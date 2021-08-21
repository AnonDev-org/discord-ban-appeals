const router = require('express').Router();
const { getUserInfo, getBan, unbanUser } = require("./helpers/user-helpers.js");
const { API_ENDPOINT, MAX_EMBED_FIELD_CHARS, MAX_EMBED_FOOTER_CHARS } = require("./helpers/discord-helpers.js");
const { createJwt, decodeJwt } = require("./helpers/jwt-helpers.js");
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: true })
const fetch = require('node-fetch')

router.get("/oauth-callback", async (req, res) => {
  if (req.query.code !== undefined) {
    const result = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: new URL(process.env.URL + "/functions/oauth-callback"),
        scope: "identify"
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await result.json();
    if (!result.ok) {
      console.log(data);
      return res.status(500).end("Failed to get user access token")
    }
    const user = await getUserInfo(data.access_token);
    if (process.env.GUILD_ID && !process.env.SKIP_BAN_CHECK) {
      const ban = await getBan(user.id, process.env.GUILD_ID, process.env.DISCORD_BOT_TOKEN);
      if (ban === null) {
        return res.redirect("/error")
      }
      const userPublic = {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
        discriminator: user.discriminator
      };
      let url = `/form?token=${encodeURIComponent(createJwt(userPublic, data.expires_in))}`;
      if (req.query.state !== undefined) {
        url += `&state=${encodeURIComponent(req.query.state)}`;
      }
      return res.redirect(url)
    }
  }
  return res.sendStatus(400)
})
router.get("/oauth", async (req, res) => {
  const redirectUri = new URL(process.env.URL + "/functions/oauth-callback");
  let url = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(process.env.DISCORD_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify&prompt=none`;
  if (req.query.state !== undefined) {
    url += `&state=${encodeURIComponent(req.query.state)}`;
  }
  return res.redirect(url)
})
router.post("/submission-created", urlencodedParser, async (req, res) => {
  const params = new URLSearchParams(req.body);
  payload = {
    banReason: params.get("banReason") || undefined,
    appealText: params.get("appealText") || undefined,
    futureActions: params.get("futureActions") || undefined,
    token: params.get("token") || undefined
  };
  if (payload.banReason !== undefined &&
    payload.appealText !== undefined &&
    payload.futureActions !== undefined &&
    payload.token !== undefined) {

    const userInfo = decodeJwt(payload.token);
    const blockedUsers = JSON.parse(`[${process.env.BLOCKED_USERS || ""}]`);
    if (blockedUsers.indexOf(userInfo.id) > -1) {
      return res.redirect(`/error?msg=${encodeURIComponent("You cannot submit ban appeals with this Discord account.")}`)
    }
    const message = {
      embed: {
        title: "New appeal submitted!",
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Submitter",
            value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`
          },
          {
            name: "Why were you banned?",
            value: payload.banReason.slice(0, MAX_EMBED_FIELD_CHARS)
          },
          {
            name: "Why do you feel you should be unbanned?",
            value: payload.appealText.slice(0, MAX_EMBED_FIELD_CHARS)
          },
          {
            name: "What will you do to avoid being banned in the future?",
            value: payload.futureActions.slice(0, MAX_EMBED_FIELD_CHARS)
          }
        ]
      }
    }
    if (process.env.GUILD_ID) {
      try {
        const ban = await getBan(userInfo.id, process.env.GUILD_ID, process.env.DISCORD_BOT_TOKEN);
        if (ban !== null && ban.reason) {
          message.embed.footer = {
            text: `Original ban reason: ${ban.reason}`.slice(0, MAX_EMBED_FOOTER_CHARS)
          };
        }
      } catch (e) {
        console.log(e);
      }

      if (!process.env.DISABLE_UNBAN_LINK) {
        const unbanUrl = new URL(process.env.URL + "/functions/unban")
        const unbanInfo = {
          userId: userInfo.id
        };

        message.embed.description = `[Approve appeal and unban user](${unbanUrl.toString()}?token=${encodeURIComponent(createJwt(unbanInfo))})`;
      }
    }

    const result = await fetch(`${API_ENDPOINT}/channels/${encodeURIComponent(process.env.APPEALS_CHANNEL)}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
      },
      body: JSON.stringify(message)
    });

    if (result.ok) {
      return res.redirect("/success")
    } else {
      console.log(await result.json());
      return res.status(500).end("Failed to submit message")
    }

  } else {
    return res.sendStatus(400)
  }
})

router.get("/unban", async (req, res) => {
  if (process.env.DISABLE_UNBAN_LINK) return res.status(500).end("This function is disabled")
  if (req.query.token !== undefined) {
    const unbanInfo = decodeJwt(req.query.token);
    if (unbanInfo.userId !== undefined) {
      try {
        await unbanUser(unbanInfo.userId, process.env.GUILD_ID, process.env.DISCORD_BOT_TOKEN);

        return res.redirect(`/success?msg=${encodeURIComponent("User has been unbanned\nPlease contact them and let them know")}`)
      } catch (e) {
        console.log(e)
        return res.redirect(`/error?msg=${encodeURIComponent("Failed to unban user\nPlease manually unban")}`)
      }
    }
  }
  return res.sendStatus(400)
})

module.exports = router;

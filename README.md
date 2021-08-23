
# Discord Ban Appeals

  

This is a form which allows users to appeal their bans from a Discord server.

  

By using OAuth2, it ensures users can't forge or fake appeals.

  

## How do I use this?

  

1. Create an application on the [Discord Developer Portal](https://discord.com/developers/applications).

  

2. In the **Bot** section of the newly created application's dashboard, create a bot account and invite it to your server with the **Ban Members** permission.

>  **Pro tip**: Use a [permissions calculator](https://finitereality.github.io/permissions-calculator/) to generate the invite link!

  

3. In your server, create a channel dedicated to ban appeals. Ensure only mods and the bot can view the channel, and that the bot has the **Send Messages** and **Embed Links** permissions for this channel.

![](https://cdn.discordapp.com/attachments/688870664941076514/743300978119278642/unknown.png)

  

4. In Discord's settings, go in the **Appearance** section and enable **Developer Mode**. You will need it soon.

![](https://cdn.discordapp.com/attachments/688870664941076514/743301339752169522/unknown.png)

  
  

5. Create .env file with the following details
   | Field name            | Instructions                                                                                                               |
   | :-------------------- | :------------------------------------------------------------------------------------------------------------------------- |
   | DISCORD_CLIENT_ID      | You can get this from the **General Information** section for the application you created in step 1.                       |
   | DISCORD_CLIENT_SECRET  | You can get this from the **General Information** section for the application you created in step 1.                       |
   | DISCORD_BOT_TOKEN      | Get this in the **Bot** section that you used in step 2.                                                                   |
   | GUILD_ID               | This is where the developer mode you enabled in step 4 comes in handy. Right click your server icon and press **Copy ID**. |
   | APPEALS_CHANNEL        | Same deal than the guild ID, but with the channel you created in step 3.                                                   |
   | JWT_SECRET             | Use a password manager to generate a password with ~50 characters, or mash your keyboard.                                  |
   | URL                    | URL (with protocol and without / at the end)  where is your application running              |

  

6. Start the application by running:

`npm install` - Install dependencies

`node build.js` - Make sure that your Discord client was connected to the gateway at least once (run this just first time when you are setuping this)

`npm start` or `node index.js` - Start the application


  
  

7. Go back to the [Discord Developer Portal](https://discord.com/developers/applications), open the dashboard for the application you created in step 1, and click on **OAuth2**.

  

8. Click on **Add Redirect** and enter `[your-site]/functions/oauth-callback`, replacing `[site-name]`with URL (with protocol) where is your application running

  

9. Hit the green **Save Changes** button.

  

10. You should be good to go! You might want to test if it works as intended with an alt account, and if you encounter any problems feel free to [create an issue on GitHub](https://github.com/AnonDev-org/discord-ban-appeals/issues/new).

  

## Blocking users

  

Users that spam requests can be blocked by creating an environment variable called `BLOCKED_USERS`, which should contain a comma-separated list of quoted user IDs. To do this:

  
- Create an environment variable with `BLOCKED_USERS` as its key. For the value, paste in the user ID you copied in the previous step, and enter in a quotation mark (`"`) on both sides.

- To add more IDs, add a comma after the first quoted ID

 
After making changes in your env file, make sure to restart the application.

  

  
  

### Information

This is rewrited project [discord-ban-appeals](https://github.com/sylveon/discord-ban-appeals.git) to express webserver, so it does not have to be hosted on Netlify.

  

Rewrited by [AnonDev](https://anon.is-a.dev)

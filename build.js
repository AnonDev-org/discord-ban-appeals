const Discord = require("discord.js");
const process = require("process");

async function main() {
  // Make sure the bot connected to the gateway at least once.
  const client = new Discord.Client();
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log(`Connected to the gateway as ${client.user.tag}`)
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
  client.destroy();
}

main();
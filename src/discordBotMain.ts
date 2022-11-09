const { Client, GatewayIntentBits} = require('discord.js');
require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    console.log("Logged in as:");
    console.log(client.user.username);
    console.log(client.user.id);
    console.log("---------------");
});

client.on('messageCreate', (message: any) => {
    if (message.content == 'ping') {
        message.reply('pongstor5');
    }
});

client.login(process.env.TOKEN);
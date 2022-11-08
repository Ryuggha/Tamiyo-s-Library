const Discord = require('discord.js');
require('dotenv/config')

const client = new Discord.client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    console.log("Logged in as:");
    console.log(client.user.name);
    console.log(client.user.id);
    console.log("---------------");
});

client.on('messageCreate', (message: any) => {
    if (message.content == 'ping') {
        message.reply('pong');
    }
});

client.login(process.env.TOKEN);
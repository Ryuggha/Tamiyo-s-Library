"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Client, GatewayIntentBits, ActivityType, Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv/config');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.on('ready', () => {
    console.log("Logged in as:");
    console.log(client.user.username);
    console.log(client.user.id);
    console.log("---------------");
    client.user.setActivity('my reconstruction', { type: ActivityType.Watching });
});
client.commands = new Collection();
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    var filePath = path.join(commandsPath, file);
    var command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`[Warning] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
client.on(Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    var command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        yield command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        yield interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
}));
client.login(process.env.TOKEN);

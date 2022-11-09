export {}
const {REST, Routes} = require('discord.js');
const path = require('node:path');
const fs = require("node:fs");
require('dotenv/config')

var commands = [];
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file : string) => file.endsWith(".js"));

for (const file of commandFiles) {
    var command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

var rest = new REST({ version: "10" }).setToken(process.env.VPSTOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands for the Deployed bot.`);
        
        const data = await rest.put(Routes.applicationCommands(process.env.VPSapplicationId), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands for the Deployed bot.`);
    } 
    catch (error) {
        console.error(error);
    }
})();

var rest2 = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands for the Test bot.`);
        
        const data2 = await rest2.put(Routes.applicationCommands(process.env.applicationId), { body: commands });

        console.log(`Successfully reloaded ${data2.length} application (/) commands for the Test bot.`);
    } 
    catch (error) {
        console.error(error);
    }
})();
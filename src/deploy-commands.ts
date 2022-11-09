export {}
const {REST, Routes} = require('discord.js');
const fs = require("node:fs");
const path = require('node:path');
require('dotenv/config')

var commands = [];
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file : string) => file.endsWith(".js"));

for (const file of commandFiles) {
    var command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

var rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(Routes.applicationGuildCommands(process.env.applicationId, 551431881044787200), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } 
    catch (error) {
        console.error(error);
    }
})();
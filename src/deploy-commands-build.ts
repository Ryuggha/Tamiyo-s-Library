export {}
const {REST, Routes} = require('discord.js');
const fs = require("node:fs");

var commands = [];
var commandFiles = fs.readdirSync("./commands").filter((file : string) => file.endsWith(".js"));

for (const file of commandFiles) {
    var command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

var rest = new REST({ version: "10" }).setToken(process.env.VPSTOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(Routes.applicationCommands(process.env.VPSaplicationId), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } 
    catch (error) {
        console.error(error);
    }
})();

var rest2 = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest2.put(Routes.applicationCommands(process.env.aplicationId), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } 
    catch (error) {
        console.error(error);
    }
})();
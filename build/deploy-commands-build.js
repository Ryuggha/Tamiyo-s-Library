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
Object.defineProperty(exports, "__esModule", { value: true });
const { REST, Routes } = require('discord.js');
const path = require('node:path');
const fs = require("node:fs");
require('dotenv/config');
var commands = [];
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    var command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}
var rest = new REST({ version: "10" }).setToken(process.env.VPSTOKEN);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands for the Deployed bot.`);
        const data = yield rest.put(Routes.applicationCommands(process.env.VPSapplicationId), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands for the Deployed bot.`);
    }
    catch (error) {
        console.error(error);
    }
}))();
/*
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
})();*/ 

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
const fs = require("node:fs");
const path = require('node:path');
require('dotenv/config');
var commands = [];
var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    var command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}
var rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = yield rest.put(Routes.applicationGuildCommands(process.env.applicationId, 551431881044787200), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
}))();

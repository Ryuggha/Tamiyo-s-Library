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
const MTGHelper_1 = require("./helpers/MTGHelper");
const CustomSetsHandler_1 = require("./helpers/CustomSetsHandler");
const builders_1 = require("@discordjs/builders");
const { Client, GatewayIntentBits, ActivityType, Collection, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
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
    (0, CustomSetsHandler_1.loadCustomSets)();
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
client.on(Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'builddeck') { //Build Deck Interaction
        const modal = new ModalBuilder()
            .setCustomId('deckBuilder')
            .setTitle('Build Deck');
        const deckNameInput = new TextInputBuilder()
            .setCustomId("deckNameInput")
            .setLabel("The Name of your Deck")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const deckSleeveInput = new TextInputBuilder()
            .setCustomId("deckSleeveInput")
            .setLabel("The URL to the sleeves of your Deck")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const deckListInput = new TextInputBuilder()
            .setCustomId("deckListInput")
            .setLabel("The decklist to build your Deck")
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder().addComponents(deckNameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(deckSleeveInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(deckListInput);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        yield interaction.showModal(modal);
    }
}));
client.on(Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isModalSubmit())
        return;
    var decklist = interaction.fields.getTextInputValue("deckListInput");
    var sleeve = interaction.fields.getTextInputValue("deckSleeveInput");
    if (sleeve == null || sleeve === "")
        sleeve = "https://i.imgur.com/hsYf4R9.jpg";
    var name = interaction.fields.getTextInputValue("deckNameInput");
    if (name == null || name === "")
        name = "Unnamed Deck";
    yield interaction.reply('Creating Deck, this may take a while. \nPlease wait...');
    try {
        var cardListArray = (0, MTGHelper_1.readDeckList)(decklist);
        var activeCustomSets = true;
        var deck = yield (0, MTGHelper_1.buildDeckFromDeckList)(name, cardListArray, sleeve, activeCustomSets);
        var deckFile = new AttachmentBuilder(Buffer.from(JSON.stringify(deck[0], null, 4)), { name: `${name}.json` });
        //await interaction.editReply(`A deck with ${deck[2]} total cards have been created.`);
        const deckEmbed = new builders_1.EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL(), url: 'https://discord.js.org' })
            .setColor(0x1d1d1d)
            .setTitle(name)
            .setDescription(`A deck with ${deck[2]} total cards have been created.`)
            .setThumbnail(sleeve)
            .addFields({ name: 'Deck Download ↓', value: 'Put this file in \\Tabletop Simulator\\Saves\\Saved Objects', inline: true })
            .setTimestamp()
            .setFooter({ text: "Tamiyo's Library", iconURL: 'https://i.imgur.com/jquHe9A.png' });
        yield interaction.followUp({ embeds: [deckEmbed] });
        yield interaction.followUp({ files: [deckFile] });
        if (deck[1] != "")
            yield interaction.followUp(deck[1]);
    }
    catch (err) {
        yield interaction.followUp("There has been an unknown error to create this deck...\n");
        console.log(err);
    }
}));
client.login(process.env.TOKEN);

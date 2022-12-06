import { buildDeckFromDeckList, readDeckList } from "./helpers/MTGHelper";
import { loadCustomSets } from "./helpers/CustomSetsHandler";

const { Client, GatewayIntentBits, ActivityType, Collection, Events, ModalBuilder,
    ActionRowBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv/config')

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
    loadCustomSets();
});

client.commands = new Collection();

var commandsPath = path.join(__dirname, "commands");
var commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith(".js"));

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

client.on(Events.InteractionCreate, async (interaction: any) => {
    if (!interaction.isChatInputCommand()) return;

    var command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true});
    }
});

client.on(Events.InteractionCreate, async (interaction: any) => {
	if (!interaction.isChatInputCommand()) return;

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

        await interaction.showModal(modal);
	}
});

client.on(Events.InteractionCreate, async (interaction: any) => {
	if (!interaction.isModalSubmit()) return;

    var decklist = interaction.fields.getTextInputValue("deckListInput");   

    var sleeve = interaction.fields.getTextInputValue("deckSleeveInput");
    if (sleeve == null || sleeve === "") sleeve = "https://i.imgur.com/hsYf4R9.jpg";
    var name = interaction.fields.getTextInputValue("deckNameInput");
    if (name == null || name === "") name = "Unnamed Deck";

    await interaction.reply('Creating Deck, this may take a while. \nPlease wait...');

    try {
        var cardListArray = readDeckList(decklist);
        var activeCustomSets = true;
        var deck = await buildDeckFromDeckList(name, cardListArray, sleeve, activeCustomSets);
        var deckFile = new AttachmentBuilder(Buffer.from(JSON.stringify(deck[0], null, 4)), {name: `${name}.json`});
        await interaction.editReply(`A deck with ${deck[2]} total cards have been created.`);
        await interaction.followUp( {files: [deckFile]} );
        if (deck[1] != "") await interaction.followUp(deck[1]);
    }
    catch (err) {
        await interaction.followUp("There has been an unknown error to create this deck...\n");
        console.log(err);
    }
});

client.login(process.env.TOKEN);

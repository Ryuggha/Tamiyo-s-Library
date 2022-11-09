import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("build_deck")
        .setDescription("Creates a deck to use in Tabletop Simulator."),

    async execute(interaction: any) {
        await interaction.reply('WIP');
    },

};

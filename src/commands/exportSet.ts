import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("export_set")
        .setDescription("Export all the cards from the set to Tabletop Simulator."),

    async execute(interaction: any) {
        await interaction.reply('WIP');
    },

};

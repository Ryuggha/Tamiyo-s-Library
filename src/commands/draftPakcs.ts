import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("draft_packs")
        .setDescription("Generates draft packs for use in Tabletop Simulator."),

    async execute(interaction: any) {
        await interaction.reply('WIP');
    },

};

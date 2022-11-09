import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("billy")
        .setDescription("Roll for the -x ability of Billy, The Unstable Gambler"),

    async execute(interaction: any) {
        await interaction.reply('WIP');
    },

};

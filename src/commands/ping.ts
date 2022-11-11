import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong"),

    async execute(interaction: any) {
        await interaction.reply('Pongstor 2.0');
    },

};

import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("builddeck")
        .setDescription("Creates a deck to use in Tabletop Simulator. Don't use arguments, just try it out!"),

    async execute(interaction: any) {
     
    },

};

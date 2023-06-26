import { SlashCommandBuilder } from "discord.js";
import { randomBrewTournamentIIBossGenerator } from "../helpers/MTGHelper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jefes")
        .setDescription("Genera 5 jefes aleatorios para el torneo de Random Brew Tournament II"),

    async execute(interaction: any) {
        await interaction.deferReply();

        var cards = await randomBrewTournamentIIBossGenerator();
        var response = `Entre estas cinco cartas debes escoger tus tres jefes: \n`;
        for (var i = 0; i < cards.length; i++) {
            response += `** ${cards[i].name} ** \n ${cards[i].url} \n \n`;
        }

        await interaction.editReply({content: response});
    }
}
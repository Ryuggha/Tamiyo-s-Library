import { SlashCommandBuilder } from "discord.js";
import { randomBrewTournamentIIBossGenerator } from "../helpers/MTGHelper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jefes")
        .setDescription("SOLO USAR UNA VEZ :: Random Brew Tournament II"),

    async execute(interaction: any) {
        await interaction.deferReply();

        var cards = await randomBrewTournamentIIBossGenerator(interaction.user.tag);
        var response = `ATENCIÓN: Usa este comando solo una vez, pues quedará registrado cada uso\nEntre estas cinco cartas debes escoger tus tres jefes: \n\n`;
        for (var i = 0; i < cards.length; i++) {
            response += `** ${cards[i].name} ** \n ${cards[i].url} \n \n`;
        }

        await interaction.editReply({content: response});
    }
}
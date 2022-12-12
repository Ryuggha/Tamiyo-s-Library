import { SlashCommandBuilder } from "discord.js";
import { billy } from "../helpers/ScryfallImplementation";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("billy")
        .setDescription("Roll for the second -x ability of Billy, The Unstable Gambler")
        .addIntegerOption((option) => 
            option.setName("x")
                .setDescription("X is the ammount of Loyalty Counters spent to use Billy, The Unstable Gabler ability")
                .setRequired(true)
                .setMinValue(0)
        ),

    async execute(interaction: any) {
        var x = interaction.options.getInteger("x");
        await interaction.deferReply();

        var spellUrl = await billy(x, false);

        if (spellUrl[1])
            await interaction.editReply({ content: `Billy casted a spell of Mana Value of ${x}:`, files: [spellUrl[0]]});
        else
            await interaction.editReply(spellUrl[0]);
    },

};

import { SlashCommandBuilder } from "discord.js";
import { billy } from "../ScryfallImplementation";

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

        var spellUrl = await billy(x);
        
        await interaction.reply("TODO: Billy still doesn't search for custom sorceries.\n"+ spellUrl);
    },

};

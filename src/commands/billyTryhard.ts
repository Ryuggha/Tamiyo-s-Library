import { SlashCommandBuilder } from "discord.js";
import { billy } from "../ScryfallImplementation";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("billy_tryhard")
        .setDescription("Roll for the second -x ability of Billy, but only ")
        .addIntegerOption((option) => 
            option.setName("x")
                .setDescription("X is the ammount of Loyalty Counters spent to use Billy, The Unstable Gabler ability")
                .setRequired(true)
                .setMinValue(0)
        ),

    async execute(interaction: any) {
        var x = interaction.options.getInteger("x");
        interaction.deferReply();

        var spellUrl = await billy(x, true);
        
        await interaction.editReply("TODO: Billy still doesn't search for custom sorceries.\n"+ spellUrl);
    },

};

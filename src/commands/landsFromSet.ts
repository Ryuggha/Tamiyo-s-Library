import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { billy } from "../helpers/ScryfallImplementation";
import { getLandsFromSet } from "../helpers/MTGHelper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("landsfromset")
        .setDescription("Generates lands from a specific set for use in Tabletop Simulator.")
        .addStringOption((option) => 
            option.setName("setcode")
                .setDescription("The code of the set you want your packs from. If left blank, the set will be choosen at random.")
                .setRequired(false))
        .addStringOption((option) =>
            option.setName("sleeveart")
                .setDescription("The URL of the image you want as sleeves.")
                .setRequired(false)
        ),

    async execute(interaction: any) {
        var x = interaction.options.getString("x");
        await interaction.deferReply();

        var setCode = interaction.options.getString("setcode");
        if (setCode == null || setCode.toUpperCase() === "RANDOM") setCode = "";
        var sleeve = interaction.options.getString("sleeveart");

        var [packs, error] = await getLandsFromSet(setCode, sleeve);

        if (error) {
            await interaction.editReply("There has been an error parsing your draft booster packs... Maybe the set code was nonexistent? Or maybe the APIs are down... Try again");
        }
        else {
            var packsFile = new AttachmentBuilder(Buffer.from(JSON.stringify(packs, null, 4)), {name: "lands.json"});

            const packsEmbed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL(), url: 'https://discord.js.org' })
                .setColor(0x1d1d1d)
                .setTitle("Lands")
                .setDescription(`A bag with with 100 lands of each type have been created.`)
                .setThumbnail(sleeve)
                .addFields({ name: 'File Download ↓', value: 'Put this file in \\Tabletop Simulator\\Saves\\Saved Objects', inline: true })
                .setTimestamp()
                .setFooter({ text: "Tamiyo's Library", iconURL: 'https://i.imgur.com/jquHe9A.png' });
    
            await interaction.editReply({ content: `${interaction.user}`, embeds: [packsEmbed] });
            await interaction.followUp( {files: [packsFile]} );
        }
    },

};
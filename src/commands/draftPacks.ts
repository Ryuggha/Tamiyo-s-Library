import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { generateDraftPacks } from "../helpers/MTGHelper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("draftvoosters")
        .setDescription("Generates draft booster packs for use in Tabletop Simulator.")
        .addStringOption((option) => 
            option.setName("setcode")
                .setDescription("The code of the set you want your packs from (Usually a three letter code)")
                .setRequired(true))
        .addIntegerOption((option) => 
            option.setName("numberofpacks")
                .setDescription("The number of packs you want to generate")
                .setRequired(true))
        .addStringOption((option) =>
            option.setName("sleeveart")
                .setDescription("The URL of the image you want as sleeves.")
                .setRequired(false)),
                
    async execute(interaction: any) {
        await interaction.reply('Creating Booster Pack, this may take a while. \nPlease wait...');

        var setCode = interaction.options.getString("setcode");
        var sleeve = interaction.options.getString("sleeveart");
        var num = interaction.options.getInteger("numberofpacks");

        var [packs, error] = await generateDraftPacks(setCode, num, sleeve);

        if (error) {
            await interaction.editReply("There has been an error parsing your draft booster packs... Maybe the set code was nonexistent?");
        }
        else {
            var packsFile = new AttachmentBuilder(Buffer.from(JSON.stringify(packs, null, 4)), {name: "boosters.json"});

            const packsEmbed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL(), url: 'https://discord.js.org' })
                .setColor(0x1d1d1d)
                .setTitle("Booster Draft Packs")
                .setDescription(`A bag with ${num} total booster packs have been created.`)
                .setThumbnail(sleeve)
                .addFields({ name: 'File Download ↓', value: 'Put this file in \\Tabletop Simulator\\Saves\\Saved Objects', inline: true })
                .setTimestamp()
                .setFooter({ text: "Tamiyo's Library", iconURL: 'https://i.imgur.com/jquHe9A.png' });
    
            await interaction.editReply({ content: `${interaction.user}`, embeds: [packsEmbed] });
            await interaction.followUp( {files: [packsFile]} );
        }
    },
};

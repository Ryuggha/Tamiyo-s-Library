"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const MTGHelper_1 = require("../helpers/MTGHelper");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("landsfromset")
        .setDescription("Generates lands from a specific set for use in Tabletop Simulator.")
        .addStringOption((option) => option.setName("setcode")
        .setDescription("The code of the set you want your packs from. If left blank, the set will be choosen at random.")
        .setRequired(false))
        .addStringOption((option) => option.setName("sleeveart")
        .setDescription("The URL of the image you want as sleeves.")
        .setRequired(false)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var x = interaction.options.getString("x");
            yield interaction.deferReply();
            var setCode = interaction.options.getString("setcode");
            if (setCode == null || setCode.toUpperCase() === "RANDOM")
                setCode = "";
            var sleeve = interaction.options.getString("sleeveart");
            var [packs, error] = yield (0, MTGHelper_1.getLandsFromSet)(setCode, sleeve);
            if (error) {
                yield interaction.editReply("There has been an error parsing your draft booster packs... Maybe the set code was nonexistent? Or maybe the APIs are down... Try again");
            }
            else {
                var packsFile = new discord_js_1.AttachmentBuilder(Buffer.from(JSON.stringify(packs, null, 4)), { name: "lands.json" });
                const packsEmbed = new discord_js_1.EmbedBuilder()
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL(), url: 'https://discord.js.org' })
                    .setColor(0x1d1d1d)
                    .setTitle("Lands")
                    .setDescription(`A bag with with 100 lands of each type have been created.`)
                    .setThumbnail(sleeve)
                    .addFields({ name: 'File Download ↓', value: 'Put this file in \\Tabletop Simulator\\Saves\\Saved Objects', inline: true })
                    .setTimestamp()
                    .setFooter({ text: "Tamiyo's Library", iconURL: 'https://i.imgur.com/jquHe9A.png' });
                yield interaction.editReply({ content: `${interaction.user}`, embeds: [packsEmbed] });
                yield interaction.followUp({ files: [packsFile] });
            }
        });
    },
};

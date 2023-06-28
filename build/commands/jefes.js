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
        .setName("jefes")
        .setDescription("SOLO USAR UNA VEZ :: Random Brew Tournament II"),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            var cards = yield (0, MTGHelper_1.randomBrewTournamentIIBossGenerator)(interaction.user.tag);
            var response = `ATENCIÓN: Usa este comando solo una vez, pues quedará registrado cada uso\nEntre estas cinco cartas debes escoger tus tres jefes: \n\n`;
            for (var i = 0; i < cards.length; i++) {
                response += `** ${cards[i].name} ** \n ${cards[i].url} \n \n`;
            }
            yield interaction.editReply({ content: response });
        });
    }
};

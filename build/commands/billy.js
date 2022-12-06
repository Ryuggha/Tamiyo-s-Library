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
const ScryfallImplementation_1 = require("../ScryfallImplementation");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("billy")
        .setDescription("Roll for the second -x ability of Billy, The Unstable Gambler")
        .addIntegerOption((option) => option.setName("x")
        .setDescription("X is the ammount of Loyalty Counters spent to use Billy, The Unstable Gabler ability")
        .setRequired(true)
        .setMinValue(0)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var x = interaction.options.getInteger("x");
            yield interaction.deferReply();
            var spellUrl = yield (0, ScryfallImplementation_1.billy)(x, false);
            yield interaction.editReply("TODO: Billy still doesn't search for custom sorceries.\n\n");
            if (spellUrl[1])
                yield interaction.followUp({ files: [spellUrl[0]] });
            else
                yield interaction.followUp(spellUrl[0]);
        });
    },
};

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billy = void 0;
const rndm_1 = __importDefault(require("./helpers/rndm"));
function getScryfallData(request) {
    return __awaiter(this, void 0, void 0, function* () {
        var ret = [];
        var response = yield fetch(request);
        var json = yield response.json();
        ret.push(...json["data"]);
        if (json["has_more"]) {
            var nextPage = yield getScryfallData(json["next_page"]);
            ret.push(...nextPage);
        }
        return ret;
    });
}
function billy(cmc, isTryhard) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isTryhard)
            var cards = yield getScryfallData("https://api.scryfall.com/cards/search?q=t:sorcery+-is:digital+f:commander+-mana:{X}+cmc:" + cmc);
        else
            var cards = yield getScryfallData("https://api.scryfall.com/cards/search?q=t:sorcery+-is:digital+-mana:{X}+cmc:" + cmc);
        var url = "";
        var customSetSorceries = [];
        console.log("TODO: Custom Set Sorceries");
        if (cards.length + customSetSorceries.length <= 0) {
            return "Billy tried it's best, but can't find any spell...\nYou cast nothing.";
        }
        while (url == "") {
            var rnd = rndm_1.default.randomInt(0, cards.length + customSetSorceries.length - 1);
            let wefRndm = rnd - cards.length;
            if (wefRndm >= 0) {
                url = customSetSorceries[wefRndm]["png"];
            }
            else {
                var card = cards[rnd];
                if (card["layout"] == "normal") {
                    url = card['image_uris']['png'];
                }
            }
        }
        return url;
    });
}
exports.billy = billy;

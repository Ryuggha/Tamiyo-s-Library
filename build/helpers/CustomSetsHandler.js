"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetRarityPools = exports.generateCustomDraft = exports.loadCustomSets = exports.customSets = void 0;
const CustomCard_1 = __importDefault(require(".././helpers/CustomCard"));
const CustomSet_1 = __importDefault(require(".././helpers/CustomSet"));
const MTGHelper_1 = require("./MTGHelper");
const rndm_1 = __importDefault(require("./rndm"));
const fs = require('node:fs');
const path = require('node:path');
exports.customSets = [];
function loadCustomSets() {
    var actualPath = "./../../CustomSets/";
    var customSetsPath = path.join(__dirname, "./../../CustomSets/");
    var folders = fs.readdirSync(customSetsPath);
    for (const folder of folders) {
        if (!folder.includes("."))
            loadCustomSetsRecursive(customSetsPath, folder);
    }
}
exports.loadCustomSets = loadCustomSets;
function loadCustomSetsRecursive(actualPath, folder) {
    var customSet = new CustomSet_1.default(folder);
    actualPath += folder + "/";
    var files = fs.readdirSync(actualPath);
    for (const file of files) {
        if (!file.includes("."))
            loadCustomSetsRecursive(actualPath, file);
        else if (file.endsWith(".json")) {
            var cardData = JSON.parse(fs.readFileSync(actualPath + file));
            customSet.cards.push(new CustomCard_1.default(cardData["name"], cardData["png"], cardData["back"], cardData["type"], cardData["cmc"], cardData["rarity"]));
        }
    }
    if (customSet.cards.length != 0)
        exports.customSets.push(customSet);
}
function generateCustomDraft(set, numberOfPacks, sleeve) {
    var rates = {
        common: 10,
        uncommon: 3,
        rareSlot: { rare: 7, mythic: 1 },
        basic: 1
    };
    rates = specialCasesCustomRates(set, rates);
    var pools = new SetRarityPools();
    for (const card of set.cards) {
        if (card.rarity === "c") {
            pools.common.push(card);
            if (card.type.toUpperCase().indexOf("LAND") >= 0)
                pools.commonNonBasicLands.push(card);
        }
        else if (card.rarity === "u")
            pools.uncommon.push(card);
        else if (card.rarity === "r")
            pools.rare.push(card);
        else if (card.rarity === "m")
            pools.mythic.push(card);
        else if (card.rarity === "b")
            pools.basic.push(card);
    }
    var packList = [];
    for (var packNumber = 0; packNumber < numberOfPacks; packNumber++) {
        var cardList = [];
        for (const cardTypeEntry of Object.entries(rates)) {
            var cardType = cardTypeEntry[0];
            var numberOfCards = 0;
            if (typeof cardTypeEntry[1] != "number") {
                var auxTypesObject = Object.entries(cardTypeEntry[1]);
                var totalWeight = 0;
                for (var i = 0; i < auxTypesObject.length; i++) {
                    totalWeight += parseInt(auxTypesObject[i][1]);
                }
                var r = rndm_1.default.randomInt(0, totalWeight - 1);
                var actualWeight = 0;
                for (var i = 0; i < auxTypesObject.length; i++) {
                    actualWeight += parseInt(auxTypesObject[i][1]);
                    if (r < actualWeight) {
                        cardType = auxTypesObject[i][0];
                        numberOfCards = 1;
                        break;
                    }
                }
            }
            else
                numberOfCards = parseInt(cardTypeEntry[1]);
            for (var i = 0; i < numberOfCards; i++) {
                var cardIndex = rndm_1.default.randomInt(0, pools[cardType].length - 1);
                var card = pools[cardType][cardIndex];
                cardList.push((0, MTGHelper_1.getCustomCardAttributes)(card));
            }
        }
        packList.push(cardList);
    }
    return packList;
}
exports.generateCustomDraft = generateCustomDraft;
function specialCasesCustomRates(set, rates) {
    if (set.name.toUpperCase() === "WEF") {
        rates = {
            commonNonBasicLands: 1,
            common: 9,
            uncommon: 3,
            rareSlot: { rare: 7, mythic: 1 },
            basic: 1
        };
    }
    return rates;
}
class SetRarityPools {
    constructor() {
        this.common = [];
        this.uncommon = [];
        this.rare = [];
        this.mythic = [];
        this.basic = [];
        this.commonNonBasicLands = [];
    }
}
exports.SetRarityPools = SetRarityPools;

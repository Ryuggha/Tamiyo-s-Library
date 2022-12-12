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
exports.CardAtt = exports.generateDraftPacks = exports.getScryfallCardAttributes = exports.buildDeckFromDeckList = exports.readDeckList = void 0;
const ScryfallImplementation_1 = require("./ScryfallImplementation");
const CardLineDict_1 = require("./CardLineDict");
const CustomSetsHandler_1 = require("./CustomSetsHandler");
const TTSObjectsHandler_1 = require("./TTSObjectsHandler");
const MTGJsonImplementation_1 = require("./MTGJsonImplementation");
var defaultSleeve = "https://i.imgur.com/hsYf4R9.jpg";
function readDeckList(deckList) {
    var cardListArray = [];
    var splitList = deckList.split("\n");
    for (var i = splitList.length - 1; i >= 0; i--) {
        if (splitList[i].startsWith("//")) {
            cardListArray.push(new CardLineDict_1.CardLineDict(splitList[i].substring(2), true));
        }
        else {
            var card = getCardDictFromLine(splitList[i]);
            if (card !== null)
                cardListArray.push(card);
        }
    }
    return cardListArray;
}
exports.readDeckList = readDeckList;
function getCardDictFromLine(line) {
    var card = new CardLineDict_1.CardLineDict();
    var lineSplitted = line.split(" ");
    for (var i = 0; i < lineSplitted.length; i++) {
        if (i === 0)
            card.num = parseInt(lineSplitted[0]);
        else if (i === 1 && lineSplitted[i].startsWith("[")) {
            var charList = lineSplitted[i].split("");
            var auxHashNum = charList.indexOf("#");
            if (auxHashNum !== -1) {
                for (var j = 1; j < auxHashNum; j++) {
                    card.set += charList[j];
                }
                for (var j = 1; j < charList.length - (auxHashNum + 1); j++) {
                    card.setNum += charList[j + auxHashNum];
                }
            }
            else {
                for (var j = 1; j < charList.length - 1; j++) {
                    card.set += charList[j];
                }
            }
        }
        else {
            card.name += lineSplitted[i] + " ";
        }
    }
    card.name = card.name.trim();
    if (card.name === "")
        return null;
    return card;
}
function buildDeckFromDeckList(deckName = "Untitled Deck", cardDictList, customSleeve = defaultSleeve, activeCustomSets = true) {
    return __awaiter(this, void 0, void 0, function* () {
        var errors = "";
        var cardsParsed = 0;
        var cardListMap = new Map();
        var deckSectionMap = new Map();
        deckSectionMap.set(-1, "Tokens");
        var cardListCount = 0;
        for (const cardDict of cardDictList) {
            if (cardDict.separator) {
                deckSectionMap.set(cardListCount, cardDict.name);
                cardListCount++;
            }
            else {
                try {
                    var customSetFlag = "";
                    if (activeCustomSets) {
                        if (cardDict.set !== "") {
                            if (CustomSetsHandler_1.customSets.find((e) => e.name.toUpperCase() === cardDict.set.toUpperCase()))
                                customSetFlag = cardDict.set.toUpperCase();
                        }
                        else {
                            var basicLandNames = ["PLAINS", "ISLAND", "SWAMP", "FOREST", "MOUNTAIN",
                                "SNOW-COVERED PLAINS", "SNOW-COVERED ISLAND", "SNOW-COVERED SWAMP",
                                "SNOW-COVERED MOUNTAIN", "SNOW-COVERED FOREST"];
                            if (!(basicLandNames.find((e) => e === cardDict.name.toUpperCase()))) {
                                for (const customSet of CustomSetsHandler_1.customSets) {
                                    if (customSet.cards.find((e) => e.name.toUpperCase() === cardDict.name.toUpperCase())) {
                                        customSetFlag = customSet.name.toUpperCase();
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    var cardAtt;
                    if (customSetFlag !== "")
                        cardAtt = getCustomCardAttributes(cardDict.name, customSetFlag);
                    else {
                        var cardJson = yield (0, ScryfallImplementation_1.getSpecificCardFromScryfall)(cardDict);
                        cardAtt = getScryfallCardAttributes(cardJson);
                    }
                    for (var i = 0; i < cardDict.num; i++) {
                        //Tokens flag validation would go here
                        if (cardListMap.get(cardListCount) == null)
                            cardListMap.set(cardListCount, []);
                        cardListMap.get(cardListCount).push(cardAtt);
                        cardsParsed++;
                    }
                }
                catch (error) {
                    errors += "Something went wrong with " + JSON.stringify(cardDict) + "\n";
                }
            }
        }
        if (cardListMap.get(-1) == null)
            deckSectionMap.delete(-1);
        return [(0, TTSObjectsHandler_1.createTTSBagWithDeck)(cardListMap, deckSectionMap, deckName, customSleeve), errors, cardsParsed];
    });
}
exports.buildDeckFromDeckList = buildDeckFromDeckList;
function getCustomCardAttributes(name, customSetName) {
    var _a;
    var customCard = (_a = CustomSetsHandler_1.customSets.find((e) => e.name.toUpperCase() === customSetName.toUpperCase())) === null || _a === void 0 ? void 0 : _a.cards.find(e => e.name.toUpperCase() === name.toUpperCase());
    if (customCard != null)
        return new CardAtt(customCard.name, "", customCard.url, customCard.backUrl);
    else
        throw Error("Can't find card in CustomCards");
}
function getScryfallCardAttributes(cardJson) {
    var card = new CardAtt(cardJson["name"]);
    try {
        card.desc = cardJson["prices"]["usd"] + "$";
    }
    catch (e) { }
    try {
        card.image = cardJson['image_uris']['png'];
    }
    catch (e) {
        card.image = cardJson["card_faces"][0]['image_uris']['png'];
        card.back = cardJson["card_faces"][1]['image_uris']['png'];
    }
    if (cardJson["rarity"] === "common")
        card.rarity = "c";
    else if (cardJson["rarity"] === "uncommon")
        card.rarity = "u";
    else if (cardJson["rarity"] === "rare")
        card.rarity = "r";
    else if (cardJson["rarity"] === "mythic")
        card.rarity = "m";
    else if (cardJson["type_line"].toUpperCase().indexOf("BASIC"))
        card.rarity = "b";
    else {
        console.log(`Strange Rarity found: ${cardJson["rarity"]}`);
        card.rarity = cardJson["rarity"].substring(0, 1).toLowerCase();
    }
    return card;
}
exports.getScryfallCardAttributes = getScryfallCardAttributes;
function generateDraftPacks(setCode, numberOfPacks, sleeve) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sleeve == null)
            sleeve = "https://i.imgur.com/hsYf4R9.jpg";
        var customSet = CustomSetsHandler_1.customSets.find(x => x.name.toUpperCase() === setCode.toUpperCase());
        //Try using MTG Json
        try {
            var packList = yield (0, MTGJsonImplementation_1.generateBoosterDraftPack)(setCode, numberOfPacks);
            return [(0, TTSObjectsHandler_1.createTTSBagWithCards)(packList, "Booster Packs", sleeve), false];
        }
        catch (e) {
            console.log("An error has ocurred during the execution: --\n" + e);
            return [null, true];
        }
    });
}
exports.generateDraftPacks = generateDraftPacks;
class CardAtt {
    constructor(name = "", desc = "", image = "", back = "", rarity = "") {
        this.name = name;
        this.desc = desc;
        this.image = image;
        this.back = back;
        this.rarity = rarity;
    }
}
exports.CardAtt = CardAtt;

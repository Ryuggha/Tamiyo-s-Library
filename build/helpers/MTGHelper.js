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
exports.CardLink = exports.CardAtt = exports.inBanList = exports.randomBrewTournamentIIBossGenerator = exports.getRandomDraftSet = exports.generateDraftPacks = exports.getScryfallCardLink = exports.getScryfallCardAttributes = exports.getCustomCardAttributes = exports.buildDeckFromDeckList = exports.readDeckList = void 0;
const ScryfallImplementation_1 = require("./ScryfallImplementation");
const CardLineDict_1 = require("./CardLineDict");
const CustomSetsHandler_1 = require("./CustomSetsHandler");
const TTSObjectsHandler_1 = require("./TTSObjectsHandler");
const MTGJsonImplementation_1 = require("./MTGJsonImplementation");
const rndm_1 = __importDefault(require("./rndm"));
var defaultSleeve = "https://i.imgur.com/hsYf4R9.jpg";
var banList = null;
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
                        cardAtt = getCustomCardAttributes(searchCustomCard(cardDict.name, customSetFlag));
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
function searchCustomCard(name, customSetName) {
    var _a;
    var customCard = (_a = CustomSetsHandler_1.customSets.find((e) => e.name.toUpperCase() === customSetName.toUpperCase())) === null || _a === void 0 ? void 0 : _a.cards.find(e => e.name.toUpperCase() === name.toUpperCase());
    if (customCard == null)
        throw Error("Can't find card in CustomCards");
    return customCard;
}
function getCustomCardAttributes(customCard) {
    return new CardAtt(customCard.name, "", customCard.url, customCard.backUrl, customCard.rarity);
}
exports.getCustomCardAttributes = getCustomCardAttributes;
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
        console.log(cardJson);
        card.image = cardJson["card_faces"][0]['image_uris']['png'];
        card.back = cardJson["card_faces"][1]['image_uris']['png'];
    }
    if (cardJson["type_line"].toUpperCase().indexOf("BASIC") >= 0)
        card.rarity = "b";
    else if (cardJson["rarity"] === "common")
        card.rarity = "c";
    else if (cardJson["rarity"] === "uncommon")
        card.rarity = "u";
    else if (cardJson["rarity"] === "rare")
        card.rarity = "r";
    else if (cardJson["rarity"] === "mythic")
        card.rarity = "m";
    else {
        console.log(`Strange Rarity found: ${cardJson["rarity"]}`);
        card.rarity = cardJson["rarity"].substring(0, 1).toLowerCase();
    }
    return card;
}
exports.getScryfallCardAttributes = getScryfallCardAttributes;
function getScryfallCardLink(cardJson) {
    return new CardLink(cardJson["name"], cardJson["scryfall_uri"]);
}
exports.getScryfallCardLink = getScryfallCardLink;
function generateDraftPacks(setCode, numberOfPacks, sleeve) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sleeve == null)
            sleeve = "https://i.imgur.com/hsYf4R9.jpg";
        var customSet = CustomSetsHandler_1.customSets.find(x => x.name.toUpperCase() === setCode.toUpperCase());
        //Try using MTG Json
        try {
            var packList = yield (0, MTGJsonImplementation_1.generateBoosterDraftPack)(setCode, numberOfPacks);
            for (const booster of packList) {
                booster.sort(function (a, b) {
                    const rarityValueCalc = (r) => {
                        if (r === "c")
                            return 5;
                        if (r === "u")
                            return 4;
                        if (r === "r")
                            return 3;
                        if (r === "m")
                            return 2;
                        if (r === "b")
                            return 1;
                        return -1;
                    };
                    var auxA = rarityValueCalc(a.rarity);
                    var auxB = rarityValueCalc(b.rarity);
                    return auxB - auxA;
                });
            }
            return [(0, TTSObjectsHandler_1.createTTSBagWithCards)(packList, "Booster Packs", sleeve), false];
        }
        catch (e) {
            if (customSet != null) {
                var packList = (0, CustomSetsHandler_1.generateCustomDraft)(customSet, numberOfPacks, sleeve);
                return [(0, TTSObjectsHandler_1.createTTSBagWithCards)(packList, "Booster Packs", sleeve), false];
            }
            else {
                console.log("An error has ocurred during the execution: --\n" + e);
                return [null, true];
            }
        }
    });
}
exports.generateDraftPacks = generateDraftPacks;
function getRandomDraftSet() {
    return __awaiter(this, void 0, void 0, function* () {
        var draftableSets = [];
        draftableSets = draftableSets.concat(yield (0, MTGJsonImplementation_1.getAllLegalBoosterSets)());
        draftableSets = draftableSets.concat((0, CustomSetsHandler_1.getAllCustomBoosterSets)());
        var selectedSet = draftableSets[rndm_1.default.randomInt(0, draftableSets.length - 1)];
        return selectedSet;
    });
}
exports.getRandomDraftSet = getRandomDraftSet;
function randomBrewTournamentIIBossGenerator() {
    return __awaiter(this, void 0, void 0, function* () {
        var cards = [];
        do {
            for (const card of yield (0, ScryfallImplementation_1.getRandomCards)(5)) {
                if (!inBanList(card["name"])) {
                    if (cards.filter(x => x.name === card["name"]).length >= 0) {
                        if (!card["type_line"].toUpperCase().includes("LAND")) {
                            if (card["oracle_text"] != "") {
                                cards.push(getScryfallCardLink(card));
                            }
                        }
                    }
                }
            }
            console.log("a");
        } while (cards.length < 5);
        return cards.slice(0, 5);
    });
}
exports.randomBrewTournamentIIBossGenerator = randomBrewTournamentIIBossGenerator;
function inBanList(name) {
    if (banList == null)
        createBanlist();
    return banList.includes(name);
}
exports.inBanList = inBanList;
function createBanlist() {
    var list = [];
    var fs = require('fs');
    var array = fs.readFileSync("textFiles/RandomBrewTournamentBanList.txt").toString().split("\n");
    for (var i = 0; i < array.length; i++) {
        var v = array[i].trim();
        if (v != null && v != "")
            list.push(v);
    }
    banList = list;
}
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
class CardLink {
    constructor(name = "", url = "") {
        this.name = name;
        this.url = url;
    }
}
exports.CardLink = CardLink;

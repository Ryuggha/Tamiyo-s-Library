"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTTSBagWithCards = exports.createTTSBagWithDeck = void 0;
const MTGHelper_1 = require("./MTGHelper");
const rndm_1 = __importDefault(require("./rndm"));
const fs = require('node:fs');
const path = require('node:path');
var ttsBagJson = "";
var ttsObjectJson = "";
var ttsCardJson = "";
var ttsDeckJson = "";
function initializeTTSJsons() {
    ttsBagJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../../TTSJson/ttsBag.json")));
    ;
    ttsObjectJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../../TTSJson/ttsObject.json")));
    ttsCardJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../../TTSJson/ttsCard.json")));
    ttsDeckJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../../TTSJson/ttsDeck.json")));
}
function createTTSBagWithDeck(cardListMap, deckSectionMap, deckName, sleeve) {
    if (ttsBagJson === "")
        initializeTTSJsons();
    var containedObjects = [];
    for (const key of cardListMap.keys()) {
        var sectionName = "deck";
        if (deckSectionMap.get(key) != null)
            sectionName = deckSectionMap.get(key);
        containedObjects.push(createTTSDeck(sectionName, cardListMap.get(key), sleeve));
    }
    var bag = JSON.parse(JSON.stringify(ttsBagJson));
    bag["ObjectStates"][0]["Nickname"] = deckName;
    bag["ObjectStates"][0]["ContainedObjects"] = containedObjects;
    return bag;
}
exports.createTTSBagWithDeck = createTTSBagWithDeck;
function createTTSBagWithCards(cardListList, deckName, sleeve) {
    if (ttsBagJson === "")
        initializeTTSJsons();
    var containedObjects = [];
    for (const cardList of cardListList) {
        containedObjects.push(createTTSDeck("Booster", cardList, sleeve));
    }
    var bag = JSON.parse(JSON.stringify(ttsBagJson));
    bag["ObjectStates"][0]["Nickname"] = deckName;
    bag["ObjectStates"][0]["ContainedObjects"] = containedObjects;
    return bag;
}
exports.createTTSBagWithCards = createTTSBagWithCards;
function createTTSDeck(deckName, deckList, sleeve) {
    if (deckList.length === 0)
        return null;
    else if (deckList.length === 1) {
        return createTTSCardObject(deckList[0], rndm_1.default.randomInt(0, 999), sleeve)[0];
    }
    else {
        var deck = JSON.parse(JSON.stringify(ttsDeckJson));
        deck["Nickname"] = deckName;
        var deckId = 1;
        var cardIdsUsed = 0;
        for (var i = 0; i < deckList.length; i++) {
            var cardId = parseInt(deckId.toString() + cardIdsUsed.toString());
            var cardObject = createTTSCardObject(deckList[i], cardId, sleeve);
            deck["ContainedObjects"].push(cardObject[0]);
            deck["CustomDeck"][cardId] = cardObject[1];
            cardIdsUsed += cardObject[2];
            deck["DeckIDs"].push(cardId * 100);
        }
        return deck;
    }
}
function createTTSCardObject(card, cardId = 12345, sleeve = "") {
    var ttsCard = JSON.parse(JSON.stringify(ttsCardJson));
    ttsCard["FaceURL"] = card.image;
    ttsCard["BackURL"] = sleeve;
    var ttsObject = JSON.parse(JSON.stringify(ttsObjectJson));
    ttsObject["Nickname"] = card.name;
    ttsObject["CardID"] = cardId * 100;
    ttsObject["Description"] = card.desc;
    ttsObject["CustomDeck"][cardId] = ttsCard;
    var idsUsed = 1;
    if (card.back !== "") {
        var auxCard = new MTGHelper_1.CardAtt(card.name, card.desc, card.back, "");
        ttsObject["States"] = { 2: createTTSCardObject(auxCard, cardId + 1, sleeve)[0] };
        idsUsed++;
    }
    return [ttsObject, ttsCard, idsUsed];
}

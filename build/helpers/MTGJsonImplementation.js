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
exports.getAllLegalBoosterSets = exports.generateBoosterDraftPack = void 0;
const MTGHelper_1 = require("./MTGHelper");
const rndm_1 = __importDefault(require("./rndm"));
const ScryfallImplementation_1 = require("./ScryfallImplementation");
const Papa = require('papaparse');
var mtgJsonAllIdentifiers;
var mtgJsonAllCards;
function getMTGJsonData(request) {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield fetch(request);
        var json = yield response.json();
        return json;
    });
}
function getMTGJsonCSV(request) {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield fetch(request);
        var text = yield response.text();
        var csv = Papa.parse(text, { header: true, skipEmptyLines: true });
        return csv;
    });
}
function generateBoosterDraftPack(setCode, numberOfPacks) {
    return __awaiter(this, void 0, void 0, function* () {
        var setJson, scryfallData;
        yield Promise.all([getMTGJsonData(`https://mtgjson.com/api/v5/${setCode.toUpperCase()}.json`),
            (0, ScryfallImplementation_1.getScryfallData)(`https://api.scryfall.com/cards/search?q=unique:prints+set:${setCode}`)]).then(([json, scryfall]) => {
            setJson = json;
            scryfallData = scryfall;
        });
        if (setJson == null)
            throw new Error("MTGJson Json is null");
        var packList = [];
        var draftIdentifier;
        if ("draft" in setJson["data"]["booster"])
            draftIdentifier = "draft";
        else if ("play" in setJson["data"]["booster"])
            draftIdentifier = "play";
        else {
            console.log("Neither 'draft' nor 'play' are valid keys in MTGJson:data:booster:key");
            throw new Error("Neither 'draft' nor 'play' are valid keys in MTGJson:data:booster:key");
        }
        var boosters = setJson["data"]["booster"][draftIdentifier];
        var cardMap = new Map();
        for (const mtgJsonCard of setJson["data"]["cards"]) {
            var scryfallCard = scryfallData.find((x) => mtgJsonCard["identifiers"]["scryfallId"] === x["id"]);
            if (scryfallCard != null)
                cardMap.set(mtgJsonCard["uuid"], scryfallCard);
            else {
                console.log("I think this won't be a problem, but the id: " + mtgJsonCard["identifiers"]["scryfallId"] + " was not mapped.");
            }
        }
        for (var i = 0; i < numberOfPacks; i++) {
            var cardList = [];
            var packTypeRndm = rndm_1.default.randomInt(0, boosters["boostersTotalWeight"] - 1);
            var actualBoosterWeight = 0;
            var contents = [];
            for (const packType of boosters["boosters"]) {
                actualBoosterWeight += packType["weight"];
                if (packTypeRndm < actualBoosterWeight) {
                    contents = packType["contents"];
                    break;
                }
            }
            for (const cardTypeEntry of Object.entries(contents)) {
                var cardType = cardTypeEntry[0];
                for (var j = 0; j < contents[cardType]; j++) {
                    var cardRndm = rndm_1.default.randomInt(0, boosters["sheets"][cardType]["totalWeight"] - 1);
                    var actualCardWeight = 0;
                    var card = "";
                    for (const cardJsonMapKeyEntries of Object.entries(boosters["sheets"][cardType]["cards"])) {
                        var cardJsonMapKey = cardJsonMapKeyEntries[0];
                        actualCardWeight += boosters["sheets"][cardType]["cards"][cardJsonMapKey];
                        if (cardRndm < actualCardWeight) {
                            card = cardMap.get(cardJsonMapKey);
                            if (card == null) {
                                if (mtgJsonAllIdentifiers == null) {
                                    yield updateMTGJsonAllIdentifiers();
                                }
                                var scryFallId = mtgJsonAllIdentifiers[cardJsonMapKey]["identifiers"]["scryfallId"];
                                card = yield (0, ScryfallImplementation_1.getCardFromScryfallFromId)(scryFallId);
                            }
                            break;
                        }
                    }
                    cardList.push((0, MTGHelper_1.getScryfallCardAttributes)(card));
                    if (card["name"] == "Void Beckoner")
                        console.log("Successful Test");
                }
            }
            packList.push(cardList);
        }
        return packList;
    });
}
exports.generateBoosterDraftPack = generateBoosterDraftPack;
function updateMTGJsonAllCards() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("DEPRECATED");
        mtgJsonAllCards = (yield getMTGJsonCSV("https://mtgjson.com/api/v5/csv/cards.csv"))["data"];
    });
}
function updateMTGJsonAllIdentifiers() {
    return __awaiter(this, void 0, void 0, function* () {
        mtgJsonAllIdentifiers = (yield getMTGJsonData("https://mtgjson.com/api/v5/AllIdentifiers.json"))["data"];
    });
}
function getAllLegalBoosterSets() {
    return __awaiter(this, void 0, void 0, function* () {
        var ret = [];
        var sets = (yield getMTGJsonCSV("https://mtgjson.com/api/v5/csv/sets.csv"))["data"];
        for (const set of sets) {
            if (set["booster"] != "") {
                ret.push(set["code"]);
            }
        }
        return ret;
    });
}
exports.getAllLegalBoosterSets = getAllLegalBoosterSets;

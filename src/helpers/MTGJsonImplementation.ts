import { CardAtt, getScryfallCardAttributes } from "./MTGHelper";
import rndm from "./rndm";
import { getCardFomScryfallFromName, getCardFromScryfallFromId, getScryfallData } from "./ScryfallImplementation";
const Papa = require('papaparse'); 

var mtgJsonAllIdentifiers: any;
var mtgJsonAllCards: any;

async function getMTGJsonData(request: string): Promise<any> {
    var response = await fetch(request);
    var json = await response.json();
    
    return json;
}

async function getMTGJsonCSV(request: string): Promise<any> {
    var response = await fetch(request);
    var text = await response.text();
    var csv = Papa.parse(text, {header: true, skipEmptyLines: true}); 

    return csv;
}

export async function generateBoosterDraftPack(setCode: string, numberOfPacks: number): Promise<CardAtt[][]> {
    var setJson: any, scryfallData: any;
    await Promise.all([getMTGJsonData(`https://mtgjson.com/api/v5/${setCode.toUpperCase()}.json`), 
        getScryfallData(`https://api.scryfall.com/cards/search?q=unique:prints+set:${setCode}`)]).then(([json, scryfall]) => {
            setJson = json;
            scryfallData = scryfall;
        });
    if (setJson == null) throw new Error("MTGJson Json is null");

    var packList = [];
    var draftIdentifier : string;
    if ("draft" in setJson["data"]["booster"]) draftIdentifier = "draft";
    else if ("play" in setJson["data"]["booster"]) draftIdentifier = "play";
    else {
        console.log("Neither 'draft' nor 'play' are valid keys in MTGJson:data:booster:key");
        throw new Error("Neither 'draft' nor 'play' are valid keys in MTGJson:data:booster:key");
    }
    var boosters = setJson["data"]["booster"][draftIdentifier];
    var cardMap: Map<any, any> = new Map<any, any>();

    for (const mtgJsonCard of setJson["data"]["cards"]) {
        var scryfallCard = scryfallData.find((x: { [x: string]: any; }) => mtgJsonCard["identifiers"]["scryfallId"] === x["id"]);
        if (scryfallCard != null) cardMap.set(mtgJsonCard["uuid"], scryfallCard);
        else {
            console.log("I think this won't be a problem, but the id: " + mtgJsonCard["identifiers"]["scryfallId"] + " was not mapped.");
        }
    }

    for (var i = 0; i < numberOfPacks; i++) {
        var cardList: CardAtt[] = [];
        var packTypeRndm = rndm.randomInt(0, boosters["boostersTotalWeight"] - 1);
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
                var cardRndm = rndm.randomInt(0, boosters["sheets"][cardType]["totalWeight"] - 1);
                var actualCardWeight = 0;
                var card = "" as any;

                for (const cardJsonMapKeyEntries of Object.entries(boosters["sheets"][cardType]["cards"])) {
                    var cardJsonMapKey = cardJsonMapKeyEntries[0];
                    actualCardWeight += boosters["sheets"][cardType]["cards"][cardJsonMapKey]
                    if (cardRndm < actualCardWeight) {
                        card = cardMap.get(cardJsonMapKey);
                        if (card == null) {
                            if (mtgJsonAllIdentifiers == null) {
                                await updateMTGJsonAllIdentifiers();
                            }                            
                            var scryFallId = mtgJsonAllIdentifiers[cardJsonMapKey]["identifiers"]["scryfallId"];

                            card = await getCardFromScryfallFromId(scryFallId);
                        }
                        break;
                    }
                }
                cardList.push(getScryfallCardAttributes(card));
                if (card["name"] == "Void Beckoner") console.log("Successful Test");
            }
        }
        packList.push(cardList);
    }
    return packList;
}

async function updateMTGJsonAllCards() {
    console.log("DEPRECATED");
    mtgJsonAllCards = (await getMTGJsonCSV("https://mtgjson.com/api/v5/csv/cards.csv"))["data"];
}

async function updateMTGJsonAllIdentifiers() {
    mtgJsonAllIdentifiers = (await getMTGJsonData("https://mtgjson.com/api/v5/AllIdentifiers.json"))["data"]
}

export async function getAllLegalBoosterSets(): Promise<string[]> {
    var ret: string[] = [];

    var sets = (await getMTGJsonCSV("https://mtgjson.com/api/v5/csv/sets.csv"))["data"];
    for (const set of sets) {
        if (set["booster"] != "") {
            ret.push(set["code"]);
        }
    }

    return ret;
}

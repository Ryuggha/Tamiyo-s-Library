import { CardAtt, getScryfallCardAttributes } from "./MTGHelper";
import rndm from "./rndm";
import { getCardFromScryfallFromId, getScryfallData } from "./ScryfallImplementation";
const Papa = require('papaparse'); 

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
    var boosters = setJson["data"]["booster"]["default"];
    var cardMap: Map<any, any> = new Map<any, any>();

    for (const mtgJsonCard of setJson["data"]["cards"]) {
        var scryfallCard = scryfallData.find((x: { [x: string]: any; }) => mtgJsonCard["identifiers"]["scryfallId"] === x["id"]);
        if (scryfallCard != null) cardMap.set(mtgJsonCard["uuid"], scryfallCard);
        else {
            console.log("Card not found in mtgJson-scryfall parse: " + mtgJsonCard["name"] + " : " + mtgJsonCard["identifiers"]["scryfallId"]);
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
                var card = "";

                for (const cardJsonMapKeyEntries of Object.entries(boosters["sheets"][cardType]["cards"])) {
                    var cardJsonMapKey = cardJsonMapKeyEntries[0];
                    actualCardWeight += boosters["sheets"][cardType]["cards"][cardJsonMapKey]
                    if (cardRndm < actualCardWeight) {
                        card = cardMap.get(cardJsonMapKey);
                        if (card == null) {
                            if (mtgJsonAllCards == null) {
                                await updateMTGJsonAllCards();
                            }                            
                            var auxCard = mtgJsonAllCards.find((x: any) => x["uuid"] === cardJsonMapKey)
                            if (auxCard == null) {
                                await updateMTGJsonAllCards();
                                auxCard = mtgJsonAllCards.find((x: any) => x["uuid"] === cardJsonMapKey)
                            }

                            var scryfallId = auxCard["scryfallId"]

                            card = await getCardFromScryfallFromId(scryfallId);
                        }
                        break;
                    }
                }
                cardList.push(getScryfallCardAttributes(card));
            }
        }
        packList.push(cardList);
    }
    return packList;
}

async function updateMTGJsonAllCards() {
    mtgJsonAllCards = (await getMTGJsonCSV("https://mtgjson.com/api/v5/csv/cards.csv"))["data"];
}
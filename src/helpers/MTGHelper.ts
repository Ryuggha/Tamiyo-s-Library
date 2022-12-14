import { getSpecificCardFromScryfall } from "./ScryfallImplementation";
import { CardLineDict } from "./CardLineDict";
import CustomCard from "./CustomCard";
import { customSets, generateCustomDraft, getAllCustomBoosterSets } from "./CustomSetsHandler";
import { createTTSBagWithCards, createTTSBagWithDeck } from "./TTSObjectsHandler";
import { generateBoosterDraftPack, getAllLegalBoosterSets } from "./MTGJsonImplementation";
import CustomSet from "./CustomSet";
import Card from "./CustomCard";
import rndm from "./rndm";

var defaultSleeve = "https://i.imgur.com/hsYf4R9.jpg";

export function readDeckList(deckList: string): CardLineDict[] {
    var cardListArray: CardLineDict[] = [];

    var splitList = deckList.split("\n");

    for (var i = splitList.length - 1; i >= 0; i--) {
        if (splitList[i].startsWith("//")) {
            cardListArray.push(new CardLineDict(splitList[i].substring(2), true));
        }
        else {
            var card = getCardDictFromLine(splitList[i]);
            if (card !== null) cardListArray.push(card);
        }
    }

    return cardListArray;
}

function getCardDictFromLine(line: string): CardLineDict | null {
    var card = new CardLineDict();

    var lineSplitted = line.split(" ");

    for (var i = 0; i < lineSplitted.length; i++) {
        if (i === 0) card.num = parseInt(lineSplitted[0]);
        else if (i === 1 && lineSplitted[i].startsWith("[")) {
            var charList = lineSplitted[i].split("");

            var auxHashNum = charList.indexOf("#");
            if (auxHashNum !== -1)
            {
                for (var j = 1; j < auxHashNum; j++) {
                    card.set += charList[j];
                }
                for (var j = 1; j < charList.length - (auxHashNum + 1); j++) {
                    card.setNum += charList[j + auxHashNum]
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
    if (card.name === "") return null;
    return card;
}

export async function buildDeckFromDeckList(deckName: string = "Untitled Deck", cardDictList: CardLineDict[], customSleeve: string = defaultSleeve, activeCustomSets: boolean = true): Promise<any> {
    var errors = "";
    var cardsParsed = 0;
    var cardListMap: Map<number, CardAtt[]> = new Map();
    var deckSectionMap: Map<number, string> = new Map();
    deckSectionMap.set(-1, "Tokens");
    var cardListCount = 0;
    

    for (const cardDict of cardDictList) {
        if (cardDict.separator) {
            deckSectionMap.set(cardListCount, cardDict.name);
            cardListCount++;
        }
        else {
            try {
                var customSetFlag: string = "";
                if (activeCustomSets) {
                    if (cardDict.set !== "") {
                        if (customSets.find((e) => e.name.toUpperCase() === cardDict.set.toUpperCase()))
                            customSetFlag = cardDict.set.toUpperCase();
                    }
                    else {
                        var basicLandNames = ["PLAINS", "ISLAND", "SWAMP", "FOREST", "MOUNTAIN", 
                            "SNOW-COVERED PLAINS", "SNOW-COVERED ISLAND", "SNOW-COVERED SWAMP", 
                            "SNOW-COVERED MOUNTAIN", "SNOW-COVERED FOREST"]
                        if (!(basicLandNames.find((e) => e === cardDict.name.toUpperCase()))) {
                            for (const customSet of customSets) {
                                if (customSet.cards.find((e) => e.name.toUpperCase() === cardDict.name.toUpperCase())) {
                                    customSetFlag = customSet.name.toUpperCase();
                                    break;
                                }
                            }
                        }
                    }
                }

                var cardAtt;
                if (customSetFlag !== "") cardAtt = getCustomCardAttributes(searchCustomCard(cardDict.name, customSetFlag)); 
                else {
                    var cardJson = await getSpecificCardFromScryfall(cardDict);
                    cardAtt = getScryfallCardAttributes(cardJson);
                }

                for (var i = 0; i < cardDict.num; i++) {
                    //Tokens flag validation would go here

                    if (cardListMap.get(cardListCount) == null) cardListMap.set(cardListCount, []); 
                    cardListMap.get(cardListCount)!.push(cardAtt);

                    cardsParsed++;
                }
            }
            catch (error) {
                errors += "Something went wrong with " + JSON.stringify(cardDict) + "\n";
            }
        }
    }

    if (cardListMap.get(-1) == null) deckSectionMap.delete(-1);

    return [createTTSBagWithDeck(cardListMap, deckSectionMap, deckName, customSleeve), errors, cardsParsed];
}

function searchCustomCard(name: string, customSetName: string): Card {
    var customCard = customSets.find((e) => e.name.toUpperCase() === customSetName.toUpperCase())?.cards.find(e => e.name.toUpperCase() === name.toUpperCase());
    if (customCard == null) throw Error("Can't find card in CustomCards");
    return customCard;
}

export function getCustomCardAttributes(customCard: Card): CardAtt {
    return new CardAtt(customCard.name, "", customCard.url, customCard.backUrl, customCard.rarity);
}

export function getScryfallCardAttributes(cardJson: any): CardAtt {
    var card = new CardAtt(cardJson["name"]);

    try { card.desc = cardJson["prices"]["usd"] + "$" }
    catch (e) {}

    try { card.image = cardJson['image_uris']['png'] }
    catch (e) {
        card.image = cardJson["card_faces"][0]['image_uris']['png']
        card.back = cardJson["card_faces"][1]['image_uris']['png']
    }

    if (cardJson["type_line"].toUpperCase().indexOf("BASIC") >= 0) card.rarity = "b";
    else if (cardJson["rarity"] === "common") card.rarity = "c";
    else if (cardJson["rarity"] === "uncommon") card.rarity = "u";
    else if (cardJson["rarity"] === "rare") card.rarity = "r";
    else if (cardJson["rarity"] === "mythic") card.rarity = "m";
    else {
        console.log(`Strange Rarity found: ${cardJson["rarity"]}`);
        card.rarity = cardJson["rarity"].substring(0, 1).toLowerCase();
    }

    return card;
}

export async function generateDraftPacks(setCode: string, numberOfPacks: number, sleeve: string | null): Promise<[any, boolean]> {
    
    if (sleeve == null) sleeve = "https://i.imgur.com/hsYf4R9.jpg";
    var customSet = customSets.find(x => x.name.toUpperCase() === setCode.toUpperCase());

    //Try using MTG Json
    try {
        var packList = await generateBoosterDraftPack(setCode, numberOfPacks);
        for (const booster of packList) {
            booster.sort(function (a: CardAtt, b:CardAtt) {
                const rarityValueCalc = (r: string) => {
                    if (r === "c") return 5;
                    if (r === "u") return 4;
                    if (r === "r") return 3;
                    if (r === "m") return 2;
                    if (r === "b") return 1;
                    return -1;
                }

                var auxA = rarityValueCalc(a.rarity);
                var auxB = rarityValueCalc(b.rarity);

                return auxB - auxA;
            });
        }
        return [createTTSBagWithCards(packList, "Booster Packs", sleeve), false];
    }
    catch (e) {
        if (customSet != null) {

            var packList = generateCustomDraft(customSet, numberOfPacks, sleeve);
            return [createTTSBagWithCards(packList, "Booster Packs", sleeve), false];
        }
        else {
            console.log("An error has ocurred during the execution: --\n" + e);
            return [null, true]
        }
    }
}

export async function getRandomDraftSet(): Promise<string> {
    var draftableSets: string[] = [];

    draftableSets = draftableSets.concat(await getAllLegalBoosterSets());
    draftableSets = draftableSets.concat(getAllCustomBoosterSets());

    var selectedSet = draftableSets[rndm.randomInt(0, draftableSets.length - 1)];

    return selectedSet;
}

export class CardAtt {
    name: string;
    desc: string;
    image: string;
    back: string;
    rarity: string;

    constructor (name: string = "", desc: string = "", image: string = "", back: string = "", rarity: string = "") {
        this.name = name;
        this.desc = desc;
        this.image = image;
        this.back = back;
        this.rarity = rarity;
    }
}

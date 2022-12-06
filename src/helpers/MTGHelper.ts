import { getSpecificCardFromScryfall } from "../ScryfallImplementation";
import { CardLineDict } from "./CardLineDict";
import CustomCard from "./CustomCard";
import { customSets } from "./CustomSetsHandler";
import { createTTSBagWithDeck } from "./TTSObjectsHandler";

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
                if (customSetFlag !== "") cardAtt = getCustomCardAttributes(cardDict.name, customSetFlag); 
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

function getCustomCardAttributes(name: string, customSetName: string): CardAtt {
    var customCard = customSets.find((e) => e.name.toUpperCase() === customSetName.toUpperCase())?.cards.find(e => e.name.toUpperCase() === name.toUpperCase());
    if (customCard != null) return new CardAtt(customCard.name, "", customCard.url, customCard.backUrl);
    else throw Error("Can't find card in CustomCards");
}

function getScryfallCardAttributes(cardJson: any): CardAtt {
    var card = new CardAtt(cardJson["name"]);

    try { card.desc = cardJson["prices"]["usd"] + "$" }
    catch (e) {}

    try { card.image = cardJson['image_uris']['png'] }
    catch (e) {
        card.image = cardJson["card_faces"][0]['image_uris']['png']
        card.back = cardJson["card_faces"][1]['image_uris']['png']
    }

    return card;
}

export class CardAtt {
    name: string;
    desc: string;
    image: string;
    back: string;

    constructor (name: string = "", desc: string = "", image: string = "", back: string = "") {
        this.name = name;
        this.desc = desc;
        this.image = image;
        this.back = back;
    }
}

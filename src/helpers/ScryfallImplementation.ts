import { CardLineDict } from "./CardLineDict";
import Card from "./CustomCard";
import { customSets } from "./CustomSetsHandler";
import rndm from "./rndm";

var officialBack = "https://i.imgur.com/hsYf4R9.jpg";
var customBack = "";

export async function getScryfallData(request: string, rawData: boolean = false): Promise<any[]> {
    
    var ret = [];

    var response = await fetch(request);
    var json = await response.json();
    if (rawData) return json;
    if (json["data"] != null) {
        ret.push(...json["data"]);
        if (json["has_more"]) {
            var nextPage = await getScryfallData(json["next_page"]);
            ret.push(...nextPage)
        }
    }
    
    return ret;
}

export async function billy (cmc: string, isTryhard: boolean): Promise<[string, boolean]> {
    if (isTryhard) var cards = await getScryfallData("https://api.scryfall.com/cards/search?q=t:sorcery+-is:digital+f:commander+-mana:{X}+cmc:" + cmc);
    else var cards = await getScryfallData("https://api.scryfall.com/cards/search?q=t:sorcery+-is:digital+-mana:{X}+cmc:" + cmc);
    var url = "";
    var customSetSorceries: Card[] = [];

    for (const set of customSets) {
        for (const c of set.cards) {
            if (isTryhard) {
                if (set.name.toUpperCase() === "WEF" && c.type.toUpperCase().includes("SORCERY") && c.manaValue == cmc.toString()) customSetSorceries.push(c);
            }
            else {
                if (c.type.toUpperCase().includes("SORCERY") && c.manaValue == cmc.toString()) customSetSorceries.push(c);
                
            }
        }
    }

    if (cards.length + customSetSorceries.length <= 0) {
        return ["Billy tried it's best, but can't find any spell...\nYou cast nothing.", false];
    }

    while (url == "") {
        var rnd = rndm.randomInt(0, cards.length + customSetSorceries.length - 1);
        let wefRndm = rnd - cards.length;

        if (wefRndm >= 0) {
            url = customSetSorceries[wefRndm].url;
        }
        else {
            var card = cards[rnd];
            if (card["layout"] == "normal") {
                url = card['image_uris']['png'];
            }
        }
    }

    return [url, true];
}

export async function getCardFomScryfallFromName(cardName: string): Promise<any> {
    return (await getScryfallData(`https://api.scryfall.com/cards/search?q=!\"${cardName}\"`))[0];
}

export async function getSpecificCardFromScryfall(cardDict: CardLineDict): Promise<any> {
    if (cardDict.set !== "") {
        if (cardDict.setNum !== "") {
            return (await getScryfallData(`https://api.scryfall.com/cards/search?q=!\"${cardDict.name}\"+set:\"${cardDict.set}\"+number:\"${cardDict.setNum}\"`))[0];
        }
        else return (await getScryfallData(`https://api.scryfall.com/cards/search?q=!\"${cardDict.name}\"+set:\"${cardDict.set}\"`))[0];
    }
    else {
        return getCardFomScryfallFromName(cardDict.name);
    }
}

export async function getCardFromScryfallFromId(cardId: string): Promise<any>  {
    return (await getScryfallData(`https://api.scryfall.com/cards/${cardId}`, true));
}

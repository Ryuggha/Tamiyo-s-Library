import { getRandomCards, getScryfallData, getSpecificCardFromScryfall } from "./ScryfallImplementation";
import { CardLineDict } from "./CardLineDict";
import CustomCard from "./CustomCard";
import { customSets, generateCustomDraft, getAllCustomBoosterSets } from "./CustomSetsHandler";
import { createTTSBagWithCards, createTTSBagWithDeck } from "./TTSObjectsHandler";
import { generateBoosterDraftPack, getAllLegalBoosterSets } from "./MTGJsonImplementation";
import CustomSet from "./CustomSet";
import Card from "./CustomCard";
import rndm from "./rndm";
const fs = require('node:fs');

var defaultSleeve = "https://i.imgur.com/hsYf4R9.jpg";

var banList: any = null;

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

export async function buildDeckFromDeckList(deckName: string = "Untitled Deck", cardDictList: CardLineDict[], customSleeve: string = defaultSleeve, activeCustomSets: boolean = true, format: string = ""): Promise<any> {
    var errors = "";
    var cardsParsed = 0;
    var cardListMap: Map<number, CardAtt[]> = new Map();
    var deckSectionMap: Map<number, string> = new Map();
    deckSectionMap.set(999, "Tokens");
    var cardListCount = 0;
    var extraErrors: any[] = [];

    var legalities = checkCustomLegality(format);

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
                var cardJson: any;
                if (customSetFlag !== "") cardAtt = getCustomCardAttributes(searchCustomCard(cardDict.name, customSetFlag)); 
                else {
                    cardJson = await getSpecificCardFromScryfall(cardDict);
                    cardAtt = getScryfallCardAttributes(cardJson);
                }

                if (legalities[1] != -1) {
                    var banListFormats = [1];
                    if (banListFormats.includes(legalities[1]) && inBanList(cardAtt.name)) errors += "ILLEGAL CARD: " + cardAtt.name + " is banned \n";
                    if (legalities[0] != "") {
                        if (customSetFlag !== "") errors += "ILLEGAL CARD: " + cardAtt.name + " is not legal \n"
                        else if (cardJson["legalities"][legalities[0]] != null) {
                            if (cardJson["legalities"][legalities[0]] != "legal") errors += "ILLEGAL CARD: " + cardAtt.name + " is not legal \n"
                        }
                        else {
                            if (!extraErrors.includes("ERROR: " + legalities[0] + " is an unknown format\n")) 
                                extraErrors.push("ERROR: " + legalities[0] + " is an unknown format\n");
                        }
                    }
                }
                
                for (var i = 0; i < cardDict.num; i++) {
                    if (customSetFlag == "" && !(cardListMap.get(999) != null && cardListMap.get(999)!.find(x => x.desc == `Created by: ${cardJson!["name"]}`))) {  
                        var cardTokens = await getTokenCards(cardJson, cardListMap.get(999));
                        if (cardTokens.length != 0) {
                            if (cardListMap.get(999) == null) cardListMap.set(999, []);
                            cardListMap.set(999, cardListMap.get(999)!.concat(cardTokens));
                        }
                    }

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

    if (cardListMap.get(999) == null) deckSectionMap.delete(999);
    errors += extraErrors;
    return [createTTSBagWithDeck(cardListMap, deckSectionMap, deckName, customSleeve), errors, cardsParsed];
}

export async function getTokenCards(cardJson: any, tokenList: CardAtt[] | undefined): Promise<CardAtt[]> {
    var tokens: CardAtt[] = [];
    if (cardJson["all_parts"] == null) return tokens;
    for (const e of cardJson["all_parts"]) {
        if (!(tokenList != null && tokenList.find(x => x.uri == e.uri)) && (e["type_line"].includes("Token") || e["type_line"].includes("Emblem"))) {
            var tokenJson: any = await getScryfallData(e["uri"], true);
            var token = new CardAtt(tokenJson["name"], `Created by: ${cardJson["name"]}`, "", "", "t", e["uri"]);
            try { token.image = tokenJson['image_uris']['png'] }
            catch (e) {
                token.image = tokenJson["card_faces"][0]['image_uris']['png']
                token.back = tokenJson["card_faces"][1]['image_uris']['png']
            }
            
            tokens.push(token);
        }
    }
    return tokens;
} 

function checkCustomLegality(l: string): [string, number] {
    l = l.toLowerCase();
    switch (l) {
        case "": return ["", -1];
        case "rbt2": return ["modern", 1];
        default: return [l, 0];
    }
}

function searchCustomCard(name: string, customSetName: string): Card {
    var customCard = customSets.find((e) => e.name.toUpperCase() === customSetName.toUpperCase())?.cards.find(e => e.name.toUpperCase() === name.toUpperCase());
    if (customCard == null) throw Error("Can't find card in CustomCards");
    return customCard;
}

export function getCustomCardAttributes(customCard: Card): CardAtt {
    return new CardAtt(customCard.name, "", customCard.url, customCard.backUrl, customCard.rarity, customCard.url);
}

export function getScryfallCardAttributes(cardJson: any): CardAtt {
    var card = new CardAtt(cardJson["name"]);
    card.uri = cardJson["uri"];

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

export function getScryfallCardLink(cardJson: any): CardLink {
    return new CardLink(cardJson["name"], cardJson["scryfall_uri"]);
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

export async function randomBrewTournamentIIBossGenerator(userName: string): Promise<CardLink[]> {
    var cards: CardLink[] = [];

    do {
        for (const card of await getRandomCards(5, "f:modern")) {
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
    }
    while (cards.length < 5);
    cards = cards.slice(0, 5);

    var fileName = userName + " - " + Date.now().toString();

    const date = new Date();
    var content = `Date: ${date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) } - ${date.getHours()}:${date.getMinutes()}`;

    for (var i = 0; i < cards.length; i++) {
        content += `\n ${cards[i].name}`;
    }

    if (!fs.existsSync("./mtgLogs")){
        fs.mkdirSync("./mtgLogs");
    }
    fs.writeFile(`./mtgLogs/${fileName}.txt`, content, (err: any) => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });

    return cards;
}

export function inBanList(name: string): boolean { //TODO MODULAR BANLIST
    if (banList == null) createBanlist();
    return banList.includes(name);  
}

export async function getLandsFromSet(setCode: string, sleeve: string): Promise<[any, boolean]> {

    if (sleeve == null || sleeve == "") sleeve = "https://i.imgur.com/hsYf4R9.jpg";
    var customSet = customSets.find(x => x.name.toUpperCase() === setCode.toUpperCase());
    var basicTypes = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
    var cardListMap: Map<number, CardAtt[]> = new Map();
    var deckSectionMap: Map<number, string> = new Map();

    for (var i = 0; i < 5; i++) {
        var cards: any = [];
        cardListMap.set(i, []);
        deckSectionMap.set(i, basicTypes[i]);

        cards = await getScryfallData(`https://api.scryfall.com/cards/search?q=!${basicTypes[i]}+unique:prints+set:${setCode}`);
        if (cards.length == 0) {
            cards = await getScryfallData(`https://api.scryfall.com/cards/search?q=!${basicTypes[i]}`);
        } 
        
        for (var j = 0; j < 100; j++) {
            var cardAtt = getScryfallCardAttributes(cards[rndm.randomInt(0, cards.length - 1)]);
            cardListMap.get(i)!.push(cardAtt);
        }
    }

    return [createTTSBagWithDeck(cardListMap, deckSectionMap, "Lands", sleeve), false];
}

function createBanlist() {
    var list = [];

    var fs = require('fs');
    var array = fs.readFileSync("textFiles/RandomBrewTournamentBanList.txt").toString().split("\n");
    for(var i = 0; i < array.length; i++) {
        var v = array[i].trim();
        if (v != null && v != "") list.push(v);
    } 
    banList = list
}

export class CardAtt {
    name: string;
    desc: string;
    image: string;
    back: string;
    rarity: string;
    uri: string;

    constructor (name: string = "", desc: string = "", image: string = "", back: string = "", rarity: string = "", uri: string = "") {
        this.name = name;
        this.desc = desc;
        this.image = image;
        this.back = back;
        this.rarity = rarity;
        this.uri = uri;
    }
}

export class CardLink {
    name: string;
    url: string;

    constructor (name: string = "", url: string = "") {
        this.name = name;
        this.url = url;
    }
}

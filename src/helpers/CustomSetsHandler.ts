import Card from ".././helpers/CustomCard";
import CustomSet from ".././helpers/CustomSet";
import { CardAtt, getCustomCardAttributes } from "./MTGHelper";
import rndm from "./rndm";
import { createTTSBagWithCards } from "./TTSObjectsHandler";
const fs = require('node:fs');
const path = require('node:path');

export var customSets: CustomSet[] = [];

export function loadCustomSets() {
    var actualPath = "./../../CustomSets/";
    var customSetsPath = path.join(__dirname, "./../../CustomSets/");
    var folders = fs.readdirSync(customSetsPath);

    for (const folder of folders) {
        if (!folder.includes(".")) loadCustomSetsRecursive(customSetsPath, folder);
    }
}

function loadCustomSetsRecursive(actualPath: string, folder: string) {
    var customSet = new CustomSet(folder);

    actualPath += folder + "/"
    var files = fs.readdirSync(actualPath);

    for (const file of files) {
        if (!file.includes(".")) loadCustomSetsRecursive(actualPath, file);
        else if (file.endsWith(".json")) {
            var cardData = JSON.parse(fs.readFileSync(actualPath+file));
            customSet.cards.push(new Card(cardData["name"], cardData["png"], cardData["back"], cardData["type"], cardData["cmc"], cardData["rarity"]));
        }
    }

    if (customSet.cards.length != 0) customSets.push(customSet);
}

export function generateCustomDraft(set: CustomSet, numberOfPacks: number, sleeve: string): CardAtt[][] {
    var rates: any = {
        common: 10,
        uncommon: 3,
        rareSlot: {rare: 7, mythic: 1},
        basic: 1
    }
    rates = specialCasesCustomRates(set, rates);

    var pools: any = new SetRarityPools();
    for (const card of set.cards) {
        if (card.rarity === "c") {
            pools.common.push(card);
            if (card.type.toUpperCase().indexOf("LAND") >= 0) pools.commonNonBasicLands.push(card);
        }
        else if (card.rarity === "u") pools.uncommon.push(card);
        else if (card.rarity === "r") pools.rare.push(card);
        else if (card.rarity === "m") pools.mythic.push(card);
        else if (card.rarity === "b") pools.basic.push(card);
    }

    var packList: CardAtt[][] = [];

    for (var packNumber = 0; packNumber < numberOfPacks; packNumber++) {
        var cardList: CardAtt[] = [];

        for (const cardTypeEntry of Object.entries(rates)) {
            var cardType = cardTypeEntry[0];
            var numberOfCards = 0;
            if (typeof cardTypeEntry[1] != "number") {
                var auxTypesObject: any = Object.entries(cardTypeEntry[1] as any);
                var totalWeight = 0;
                for (var i = 0; i < auxTypesObject.length; i++) {
                    totalWeight += parseInt(auxTypesObject[i][1]);
                }

                var r = rndm.randomInt(0, totalWeight - 1);
                var actualWeight = 0;

                for (var i = 0; i < auxTypesObject.length; i++) {
                    actualWeight += parseInt(auxTypesObject[i][1]);
                    if (r < actualWeight) {
                        cardType = auxTypesObject[i][0];
                        numberOfCards = 1;
                        break;
                    }
                }
            }
            else numberOfCards = parseInt(cardTypeEntry[1] as any);

            for (var i = 0; i < numberOfCards; i++) {
                var cardIndex = rndm.randomInt(0, pools[cardType].length - 1);
                var card = pools[cardType][cardIndex];
                cardList.push(getCustomCardAttributes(card));
            }

        }
        
        packList.push(cardList);
    }
    
    return packList;
}

function specialCasesCustomRates(set: CustomSet, rates: any) {
    if (set.name.toUpperCase() === "WEF") {
        rates = {
            commonNonBasicLands: 1,
            common: 9,
            uncommon: 3,
            rareSlot: {rare: 7, mythic: 1},
            basic: 1
        }
    }

    return rates;
}

export class SetRarityPools {
    common: Card[];
    uncommon: Card[];
    rare: Card[];
    mythic: Card[];
    basic: Card[];

    commonNonBasicLands: Card[];

    constructor () {
        this.common = [];
        this.uncommon = [];
        this.rare = [];
        this.mythic = [];
        this.basic = [];

        this.commonNonBasicLands = [];
    }
}
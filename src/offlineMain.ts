import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, generateDraftPacks, readDeckList } from "./helpers/MTGHelper";
import { getCardFromScryfallFromId } from "./helpers/ScryfallImplementation";

console.log("Offline Test\n--------------------");

// ----------------------

loadCustomSets();

async function main () {
    var rates: any = {
        basic: 1,
        rareSlot: {rare: 7, mythic: 1},
        uncommon: 3,
        common: 10
    }

    var s = "common";
    console.log(Object.entries(rates));
    console.log("\n");
    console.log((Object.entries(rates).length));
}

main();


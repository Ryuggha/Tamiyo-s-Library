import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, generateDraftPacks, getRandomDraftSet, readDeckList } from "./helpers/MTGHelper";
import { getAllLegalBoosterSets } from "./helpers/MTGJsonImplementation";
import { getCardFromScryfallFromId } from "./helpers/ScryfallImplementation";

console.log("Offline Test\n--------------------");

// ----------------------

loadCustomSets();

async function main () {
}

main();


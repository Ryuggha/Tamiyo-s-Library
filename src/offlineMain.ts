import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, generateDraftPacks, getLandsFromSet, getRandomDraftSet, randomBrewTournamentIIBossGenerator, readDeckList } from "./helpers/MTGHelper";
import { getAllLegalBoosterSets } from "./helpers/MTGJsonImplementation";
import { getCardFromScryfallFromId } from "./helpers/ScryfallImplementation";

console.log("Offline Test\n--------------------");

// ----------------------

loadCustomSets();

async function main () {
    //getLandsFromSet("j18", "");
    await getLandsFromSet("war", "");
}

main();


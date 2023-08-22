import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, generateDraftPacks, getRandomDraftSet, randomBrewTournamentIIBossGenerator, readDeckList } from "./helpers/MTGHelper";
import { getAllLegalBoosterSets } from "./helpers/MTGJsonImplementation";
import { getCardFromScryfallFromId } from "./helpers/ScryfallImplementation";

console.log("Offline Test\n--------------------");

// ----------------------

loadCustomSets();

async function main () {
    var response = await fetch("https://mtgjson.com/api/v5/AllIdentifiers.json");
    var json = await response.json();

    console.log(json["data"]['aba109b4-61b3-518a-84e6-dcc73d892e88']["identifiers"]["scryfallId"]);
}

main();


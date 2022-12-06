import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, readDeckList } from "./helpers/MTGHelper";

console.log("Offline Test\n--------------------");

// ----------------------

loadCustomSets();



async function main () {
    //var cardListArray = readDeckList("//main\n2 Yidaro, Wandering Monster\n2 [IKO#132] Reptilian Reflection\n//side\n7 [SLD] Island\n2 Call of The Abyss\n3 [WEFBalanced] Aerial Strike\n3 Island");
    var cardListArray = readDeckList("//main\n1 Yidaro, Wandering Monster");
    var activeCustomSets = true;
    var deck = await buildDeckFromDeckList("name", cardListArray);
}

main();


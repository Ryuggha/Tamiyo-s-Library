import { loadCustomSets } from "./helpers/CustomSetsHandler";
import { buildDeckFromDeckList, generateDraftPacks, getLandsFromSet, getRandomDraftSet, randomBrewTournamentIIBossGenerator, readDeckList } from "./helpers/MTGHelper";
import { getAllLegalBoosterSets } from "./helpers/MTGJsonImplementation";
import rndm from "./helpers/rndm";
import { getCardFromScryfallFromId } from "./helpers/ScryfallImplementation";

console.log("Offline Test\n--------------------");

// ----------------------

/*
loadCustomSets();

async function main () {
    //getLandsFromSet("j18", "");
    await getLandsFromSet("war", "");
}
*/

function main() {

    var iterations = 999999;

    var mod = 4;
    var damageDie = [12, 12] as number[];
    var prof = 3;
    var enemyAC = [14, 16, 18];

    for (var x = 0; x < enemyAC.length; x++) {
        var totalDamage = 0;

        for (var i = 0; i < iterations; i++) {
            var vex = false;
            for (var j = 0; j < damageDie.length; j++) {
                var adv = false;
                var roll = d20();
                //adv = true;
                if (vex) adv = true;
                if (adv) {
                    var advRoll = d20();
                    if (advRoll > roll) roll = advRoll;
                    vex = false;
                }
                if (roll > 1 && roll + prof + mod >= enemyAC[x]) {
                    //if (j == 0 || j == 1) vex = true;
                    var attackRoll = die(damageDie[j]);
                    if (roll >= 20) attackRoll += die(damageDie[j]);
                    totalDamage += mod + attackRoll;
                }
                else {
                    //totalDamage += mod;
                }
            }    
        }

        console.log("Total Damage with " + enemyAC[x] + " AC : " + Math.round(totalDamage / iterations));
    }
}

function die(dieMax: number): number {
    var die = rndm.randomInt(1, dieMax)
    //die = gwf(die, dieMax);
    return die;
}

function gwf(die: number, dieMax: number): number {
    if (die < 3) die = rndm.randomInt(1, dieMax);
    var die2 = rndm.randomInt(1, dieMax);
    if (die2 < 3) die2 = rndm.randomInt(1, dieMax);
    return die + die2;
}

function d20(): number {
    return rndm.randomInt(1, 20);
}


main();



import Card from ".././helpers/CustomCard";
import CustomSet from ".././helpers/CustomSet";
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
            customSet.cards.push(new Card(cardData["name"], cardData["png"]));
        }
    }

    if (customSet.cards.length != 0) customSets.push(customSet);
}

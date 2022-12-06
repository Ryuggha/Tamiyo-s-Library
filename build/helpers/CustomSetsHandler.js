"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomSets = exports.customSets = void 0;
const CustomCard_1 = __importDefault(require(".././helpers/CustomCard"));
const CustomSet_1 = __importDefault(require(".././helpers/CustomSet"));
const fs = require('node:fs');
const path = require('node:path');
exports.customSets = [];
function loadCustomSets() {
    var actualPath = "./../../CustomSets/";
    var customSetsPath = path.join(__dirname, "./../../CustomSets/");
    var folders = fs.readdirSync(customSetsPath);
    for (const folder of folders) {
        if (!folder.includes("."))
            loadCustomSetsRecursive(customSetsPath, folder);
    }
}
exports.loadCustomSets = loadCustomSets;
function loadCustomSetsRecursive(actualPath, folder) {
    var customSet = new CustomSet_1.default(folder);
    actualPath += folder + "/";
    var files = fs.readdirSync(actualPath);
    for (const file of files) {
        if (!file.includes("."))
            loadCustomSetsRecursive(actualPath, file);
        else if (file.endsWith(".json")) {
            var cardData = JSON.parse(fs.readFileSync(actualPath + file));
            customSet.cards.push(new CustomCard_1.default(cardData["name"], cardData["png"]));
        }
    }
    if (customSet.cards.length != 0)
        exports.customSets.push(customSet);
}

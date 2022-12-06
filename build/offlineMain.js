"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomSetsHandler_1 = require("./helpers/CustomSetsHandler");
const MTGHelper_1 = require("./helpers/MTGHelper");
console.log("Offline Test\n--------------------");
// ----------------------
(0, CustomSetsHandler_1.loadCustomSets)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        //var cardListArray = readDeckList("//main\n2 Yidaro, Wandering Monster\n2 [IKO#132] Reptilian Reflection\n//side\n7 [SLD] Island\n2 Call of The Abyss\n3 [WEFBalanced] Aerial Strike\n3 Island");
        var cardListArray = (0, MTGHelper_1.readDeckList)("//main\n1 Yidaro, Wandering Monster");
        var activeCustomSets = true;
        var deck = yield (0, MTGHelper_1.buildDeckFromDeckList)("name", cardListArray);
    });
}
main();

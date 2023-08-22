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
console.log("Offline Test\n--------------------");
// ----------------------
(0, CustomSetsHandler_1.loadCustomSets)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield fetch("https://mtgjson.com/api/v5/AllIdentifiers.json");
        var json = yield response.json();
        console.log(json["data"]['aba109b4-61b3-518a-84e6-dcc73d892e88']["identifiers"]["scryfallId"]);
    });
}
main();

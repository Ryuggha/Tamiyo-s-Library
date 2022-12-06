"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Card {
    constructor(name, url, backUrl = "", type, manaValue) {
        this.name = name;
        this.url = url;
        this.backUrl = backUrl;
        this.type = type;
        this.manaValue = manaValue;
    }
}
exports.default = Card;

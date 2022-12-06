"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Card {
    constructor(name, url, backUrl = "") {
        this.name = name;
        this.url = url;
        this.backUrl = backUrl;
    }
}
exports.default = Card;

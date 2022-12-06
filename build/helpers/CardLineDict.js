"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardLineDict = void 0;
class CardLineDict {
    constructor(name, isSeparator) {
        this.separator = false;
        this.name = "";
        this.num = 0;
        this.set = "";
        this.setNum = "";
        if (name)
            this.name = name;
        if (isSeparator)
            this.separator = true;
    }
}
exports.CardLineDict = CardLineDict;

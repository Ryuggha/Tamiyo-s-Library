export default class Card {
    name: string;
    url: string;
    backUrl: string;
    type: string;
    manaValue: string;
    rarity: string;

    constructor(name: string, url: string, backUrl: string = "", type: string, manaValue: string, rarity: string) {
        this.name = name;
        this.url = url;
        this.backUrl = backUrl;
        this.type = type;
        this.manaValue = manaValue;
        this.rarity = rarity;
    }  
}
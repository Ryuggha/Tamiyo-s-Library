export default class Card {
    name: string;
    url: string;
    backUrl: string;
    type: string;

    constructor(name: string, url: string, backUrl: string = "", type: string) {
        this.name = name;
        this.url = url;
        this.backUrl = backUrl;
        this.type = type;
    }  
}
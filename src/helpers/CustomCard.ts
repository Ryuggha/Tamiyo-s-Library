export default class Card {
    name: string;
    url: string;
    backUrl: string;

    constructor(name: string, url: string, backUrl: string = "") {
        this.name = name;
        this.url = url;
        this.backUrl = backUrl;
    }  
}
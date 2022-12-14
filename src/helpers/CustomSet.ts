import Card from "./CustomCard";

export default class CustomSet {

    name: string;
    cards: Card[];
    draftable: boolean;

    constructor(name: string) {
        this.name = name;
        this.cards = [];
        this.draftable = false;
    }
}

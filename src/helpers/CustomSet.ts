import Card from "./CustomCard";

export default class CustomSet {

    name: string;
    cards: Card[];

    constructor(name: string) {
        this.name = name;
        this.cards = [];
    }
}

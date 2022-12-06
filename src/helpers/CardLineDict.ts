export class CardLineDict {
    separator: boolean = false;
    name: string = "";
    num: number = 0;
    set: string = "";
    setNum: any = "";

    constructor (name?: string, isSeparator?: boolean) {
        if (name) this.name = name;
        if (isSeparator) this.separator = true;
    }
}
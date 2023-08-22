// Everything always inclusive

export default class rndm {

    static randomInt(min: number, max: number): number { //Max inclusive
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }
    
    static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
    
    static randomPerOne(): number {
        return Math.random();
    }
    
    static radnomPerCent(): number {
        return Math.random() * 100;
    }
    
    static randomBool(): boolean {
        if (rndm.randomInt(0, 1) === 0) return true;
        else return false;
    }

    static randomCelestialObjectNameChar(): string {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        if (rndm.radnomPerCent() < 75) {
            return numbers.charAt(rndm.randomInt(0, numbers.length - 1));
        }
        else {
            return characters.charAt(rndm.randomInt(0, characters.length - 1));
        }
    }
    
}
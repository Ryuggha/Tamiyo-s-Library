"use strict";
// Everything always inclusive
Object.defineProperty(exports, "__esModule", { value: true });
class rndm {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    static randomPerOne() {
        return Math.random();
    }
    static radnomPerCent() {
        return Math.random() * 100;
    }
    static randomBool() {
        if (rndm.randomInt(0, 1) === 0)
            return true;
        else
            return false;
    }
    static randomCelestialObjectNameChar() {
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
exports.default = rndm;

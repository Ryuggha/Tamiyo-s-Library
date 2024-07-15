# Tamiyo-s-Library

A Discord Bot that is able to fetch in the Scryfall.com and MTGJson.com APIs, to analyze and parse data of the popular card game 'Magic: The Gathering', to then, use the data to export playable decks for a virtual table called 'Tabletop Simulator'. Individual Project.

## Commands
Tamiyo's Library uses slash commands

### /builddeck
This command opens a Discord form, and asks you to input a decklist. The decklist format is optimized for usage with deckstats.net, but it supports most deckbuilding sites. 
Once sent, the bot will return a .json file with your deck. Just place it on the Save Objects folder of Tabletop simulator and you're good to go.

![builddeck form](https://imgur.com/Kh6C2NU)

### /draftboosters
This command returns a .json file with a number of booster packs of the set given by parameter. If none was given, a random drafting set will be selected.

### /exportset
This command exports each card of a given set.

### /landsfromset
This command returns a bunch of basic lands from the given set. This is thought to be used to easy the deckbuilding phase of a drafting session.

### /billy
Billy, the Unstable Gambler, is a custom card from our set, War of Efir, that requires to use this bot to be used.

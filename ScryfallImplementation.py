import random
import traceback

import requests
import json
import os
import io


officialBack = "https://i.imgur.com/hsYf4R9.jpg"
customBack = ""


def getScryfallApiCallData(call):
    ret = []

    aux = requests.get(call).json()
    ret.extend(aux['data'])
    if aux['has_more']:
        ret.extend(getScryfallApiCallData(aux['next_page']))

    return ret


def billy(cmc):
    cards = getScryfallApiCallData(
        "https://api.scryfall.com/cards/search?q=t:sorcery+-(f:historic+-f:legacy+-f:modern+-f:commander)+-mana:{X}+cmc:" + str(
            cmc))
    url = ""
    pathToJson = 'CustomSets/WEF/'  # only WEF
    cardJsons = [posJson for posJson in os.listdir(pathToJson) if posJson.endswith('.json')]
    wefSorceries = []
    for wefCard in cardJsons:
        aux = json.load(open(pathToJson + wefCard, encoding="utf8"))
        if aux['type'] == "Sorcery":
            if aux['cmc'] == str(cmc):
                wefSorceries.append(aux)

    while url == "":
        rnd = random.randint(0, len(cards) + len(wefSorceries) - 1)
        print(len(cards) + len(wefSorceries) - 1)
        print(rnd)
        print("---")
        wefRnd = rnd - len(cards)
        if wefRnd >= 0:
            url = wefSorceries[wefRnd]['png']
        else:
            card = cards[rnd]
            if card['layout'] == 'normal':
                url = card['image_uris']['png']
    return url


def giveJson():
    a = json.load(open('bag.json'))
    return io.StringIO(json.dumps(a, indent=4, sort_keys=True))


def createTTSBag(bagName="bagTest", containedObjects=[]):
    bag = json.load(open('bag.json'))
    bag["ObjectStates"][0]["Nickname"] = bagName
    bag["ObjectStates"][0]["ContainedObjects"] = containedObjects
    return bag


def createTTSDeck(deckName="deckTest", cardAtt={"name": [], "desc": [], "image": [], "back": []}):
    if len(cardAtt.get("name")) == 0:
        return None

    elif len(cardAtt.get("name")) == 1:
        return createTTSCardObject(cardAtt, 0, str(random.randint(0, 99999)))

    else:
        deck = json.load(open('ttsDeck.json'))
        deck["Nickname"] = deckName
        deckId = random.randint(0, 99)
        for x in range(len(cardAtt.get("name"))):
            cardId = int(str(deckId) + str(x))
            cardAndObject = createTTSCardObject(cardAtt, x, deckId)
            deck["ContainedObjects"].append(cardAndObject[0])
            deck["CustomDeck"].update({cardId: cardAndObject[1]})
            deck["DeckIDs"].append(cardId * 100)
        return deck


def createTTSCardObject(cardAtt, cardNum, cardId="12345"):
    card = json.load(open('ttsCard.json'))
    card["FaceURL"] = cardAtt.get("image")[cardNum]
    card["BackURL"] = cardAtt.get("back")[cardNum]

    ttsObject = json.load(open('ttsObject.json'))
    ttsObject["Nickname"] = cardAtt.get("name")[cardNum]
    ttsObject["CardID"] = cardId * 100
    try:
        ttsObject["Description"] = cardAtt.get("desc")[cardNum] + "€"
    except:
        ttsObject["Description"] = "0€"
    ttsObject["CustomDeck"].update({cardId: card})

    return [ttsObject, card]


def makeDeck(deckName="exampleName", cardDictList=[], customBack=""):
    errors = ""
    cardImagesLists = {}
    sectionNames = {"double": "Double Faced Cards", "tokens": "Tokens"}
    deckNum = 0
    back = customBack
    if back == "":
        global officialBack
        back = officialBack
    for cardDict in cardDictList:
        if "separator" in cardDict:
            sectionNames[str(deckNum)] = cardDict["separator"][2:]
            deckNum += 1
        else:
            try:
                cardJson = searchForSpecificCardInScryfall(cardDict)
                # print("tokens I guess")
                for x in range(int(cardDict["num"])):
                    if str(deckNum) not in cardImagesLists:
                        cardImagesLists[str(deckNum)] = {"name": [], "desc": [], "image": [], "back": []}
                    cardImagesLists[str(deckNum)]["name"].append(cardJson["name"])
                    cardImagesLists[str(deckNum)]["desc"].append(cardJson["prices"]["eur"])
                    try:
                        cardImagesLists[str(deckNum)]["image"].append(cardJson['image_uris']['png'])
                        cardImagesLists[str(deckNum)]["back"].append(back)
                    except:
                        cardImagesLists[str(deckNum)]["image"].append(cardJson["card_faces"][0]['image_uris']['png'])
                        cardImagesLists[str(deckNum)]["back"].append(back)
                        if "double" not in cardImagesLists:
                            cardImagesLists["double"] = {"name": [], "desc": [], "image": [], "back": []}
                        cardImagesLists["double"]["name"].append(cardJson['name'])
                        cardImagesLists["double"]["desc"].append(cardJson['prices']['eur'])
                        cardImagesLists["double"]["image"].append(cardJson["card_faces"][0]['image_uris']['png'])
                        cardImagesLists["double"]["back"].append(cardJson["card_faces"][1]['image_uris']['png'])
            except Exception as e:
                errors += "Somethign went wrong with: " + str(cardDict) + "\n"
                print(traceback.format_exc())

    containedObjects = []
    for x in cardImagesLists:
        sectionName = "deck"
        if str(x) in sectionNames:
            sectionName = sectionNames[x]
        containedObjects.append(createTTSDeck(sectionName, cardImagesLists[x]))
    bag = createTTSBag(deckName, containedObjects)
    return [io.StringIO(json.dumps(bag, indent=4, sort_keys=True)), errors]


def checkLegality(cardList=[], legalIn="", whiteList=[], banList=[]):
    errors = ""
    for card in cardList:
        if card in banList:
            errors += "   ILLEGAL CARD: " + card + " is a banned card."
        if whiteList != []:
            if card not in whiteList:
                errors += "   ILLEGAL CARD: " + card + " is not in the white list."
        if legalIn != "":
            legality = searchForCardInScryfall(card)["legalities"][legalIn]
            if legality != "legal":
                errors += "   ILLEGAL CARD: " + card + " is " + legality + " in " + legalIn + "."
    return errors


def createListOfCardsFromSetList(sets=[]):
    cardList = []
    for set in sets:
        cardList.extend(getNamesFromJson(getScryfallApiCallData("https://api.scryfall.com/cards/search?q=set:" + set)))
    return cardList


def readDeckList(deckList):
    cardAtt = {"name": [], "desc": [], "image": [], "back": []}
    cardDictList = []
    for cardName in reversed(deckList.splitlines()):
        if cardName.startswith("//"):
            cardDictList.append({"separator": cardName})
        else:
            cardDict = splitLineCardNames(cardName)
            if cardDict is not None:
                cardDictList.append(cardDict)
    return cardDictList


def searchForSpecificCardInScryfall(cardDict):
    if "set" in cardDict:
        if "setNum" in cardDict:
            return requests.get("https://api.scryfall.com/cards/search?q=!\"" + cardDict["name"] + "\"+set:\"" + cardDict["set"] + "\"+number:\"" + cardDict["setNum"] + "\"").json()['data'][0]
        else:
            return requests.get("https://api.scryfall.com/cards/search?q=!\"" + cardDict["name"] + "\"+set:\"" + cardDict["set"]).json()['data'][0]
    else:
        return searchForCardInScryfall(cardDict["name"])
    return None


def searchForCardInScryfall(cardName):
    return requests.get("https://api.scryfall.com/cards/search?q=!\"" + cardName + "\"").json()['data'][0]


def whiteListFromSets(sets=[]):
    whiteList = []
    for set in sets:
        whiteList.extend(getNamesFromJson(getScryfallApiCallData("https://api.scryfall.com/cards/search?q=set:" + set)))
    return whiteList


def splitLineCardNames(str):
    cardDict = {"name": ""}
    splitted = str.split(" ")
    for x in range(len(splitted)):
        if x == 0:
            cardDict["num"] = splitted[0]
        elif x == 1 and splitted[x].startswith('['):
            charList = list(splitted[x])
            try:
                auxHash = charList.index('#')
                cardDict["set"] = ""
                for y in range(auxHash - 1):
                    cardDict["set"] += charList[y + 1]
                cardDict["setNum"] = ""
                for y in range(len(charList) - (auxHash + 2)):
                    cardDict["setNum"] += charList[y + auxHash + 1]
            except:
                cardDict["set"] = ""
                for y in range(len(charList) - 2):
                    cardDict["set"] += charList[y + 1]
        else:
            cardDict["name"] += splitted[x] + " "
    cardDict["name"] = cardDict["name"].rstrip()
    cardDict["name"] = cardDict["name"].encode('cp1252').decode('utf-8')
    if cardDict["name"] == "":
        return None
    return cardDict


def getNamesFromJson(json):
    list = []
    for card in json['data']:
        list.append(card['name'])
    return list



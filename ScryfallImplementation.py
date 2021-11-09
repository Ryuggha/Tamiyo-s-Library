import random
import requests
import json
import os
import io


officialBack = "https://imgur.com/hsYf4R9"
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
    return io.StringIO(json.dumps(a))


def createTTSBag(bagName="bagTest", containedObjects=[]):
    bag = json.load(open('bag.json'))
    bag["ObjectStates"][0]["Nickname"] = bagName
    bag["ObjectStates"][0]["ContainedObjects"] = containedObjects
    return bag


def createTTSDeck(deckName="deckTest", cardAtt={"name": [], "desc": [], "image": [], "back": []}):
    if len(cardAtt.get("name")) == 0:
        return None

    elif len(cardAtt.get("name")) == 1:
        ttsObject = createTTSCardObject(cardAtt, 0, str(random.randint(0, 99999)))

    else:
        deck = json.load(open('ttsDeck.json'))
        deck["Nickname"] = deckName
        deckId = str(random.randint(0, 99999))
        for x in range(len(cardAtt.get("name"))):
            deck["ContainedObjects"].append(createTTSCardObject(cardAtt, x, deckId))


def createTTSCardObject(cardAtt, cardNum, deckId="12345"):
    card = json.load(open('ttsCard.json'))
    card["FaceURL"] = cardAtt.get("image")[cardNum]
    card["BackURL"] = cardAtt.get("back")[cardNum]

    cardId = deckId + str(cardNum)

    ttsObject = json.load(open('ttsObject.json'))
    ttsObject["Nickname"] = cardAtt.get("name")[cardNum]
    ttsObject["CardID"] = cardId * 100
    ttsObject["Description"] = cardAtt.get("desc")[cardNum] + "$"
    ttsObject["CustomDeck"].update({cardId: card})

    return ttsObject


giveJson()

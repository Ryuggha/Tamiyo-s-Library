import random
import requests
import json
import os
import io


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
    toExport = io.StringIO(json.dumps(a))
    return toExport


giveJson()

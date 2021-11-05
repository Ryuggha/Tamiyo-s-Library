import random
import requests
import json
import os


def billy(cmc):
    cards = requests.get("https://api.scryfall.com/cards/search?q=t:sorcery+-mana:{X}+cmc:" + str(cmc)).json()['data']
    url = ""
    pathToJson = 'CustomSets/WEF/'  ##only WEF
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
        print(str(rnd) + "/" + str(len(cards) + len(wefSorceries) - 1))
    return url

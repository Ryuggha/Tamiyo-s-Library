import random
import requests
import json


def billy(cmc):
    cards = requests.get("https://api.scryfall.com/cards/search?q=t:sorcery+-mana:{X}+cmc:" + str(cmc)).json()['data']
    url = ""
    while url == "":
        rnd = random.randint(0, len(cards) - 1)
        card = cards[rnd]
        if card['layout'] == 'normal':
            url = card['image_uris']['png']
    return url

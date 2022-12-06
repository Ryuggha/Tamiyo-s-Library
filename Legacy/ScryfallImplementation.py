import random
import traceback
from warnings import catch_warnings

import requests
import json
import os
import io


officialBack = "https://i.imgur.com/hsYf4R9.jpg"
customBack = ""
customSets = {}
customSetsCardNames = {}
ids = []

def loadCustomSets():
    info = loadCustomSet("WEFOld")
    customSets["WEF"] = info[0]
    customSetsCardNames["WEF"] = info[1]

    info = loadCustomSet("WEFBalanced")
    customSets["WEF"] = info[0]
    customSetsCardNames["WEF"] = info[1]

    info = loadCustomSet("CJS001")
    customSets["CJS001"] = info[0]
    customSetsCardNames["CJS001"] = info[1]

    info = loadCustomSet("CJS002")
    customSets["CJS002"] = info[0]
    customSetsCardNames["CJS002"] = info[1]

    info = loadCustomSet("CJS003")
    customSets["CJS003"] = info[0]
    customSetsCardNames["CJS003"] = info[1]

    info = loadCustomSet("CJS004")
    customSets["CJS004"] = info[0]
    customSetsCardNames["CJS004"] = info[1]

    info = loadCustomSet("CJS005")
    customSets["CJS005"] = info[0]
    customSetsCardNames["CJS005"] = info[1]

    info = loadCustomSet("CJS006")
    customSets["CJS006"] = info[0]
    customSetsCardNames["CJS006"] = info[1]

    info = loadCustomSet("CJS007")
    customSets["CJS007"] = info[0]
    customSetsCardNames["CJS007"] = info[1]

    info = loadCustomSet("CJS008")
    customSets["CJS008"] = info[0]
    customSetsCardNames["CJS008"] = info[1]

    info = loadCustomSet("CJS009")
    customSets["CJS009"] = info[0]
    customSetsCardNames["CJS009"] = info[1]

    info = loadCustomSet("CJS010")
    customSets["CJS010"] = info[0]
    customSetsCardNames["CJS010"] = info[1]

    info = loadCustomSet("CJS011")
    customSets["CJS011"] = info[0]
    customSetsCardNames["CJS011"] = info[1]

    info = loadCustomSet("CJS012")
    customSets["CJS012"] = info[0]
    customSetsCardNames["CJS012"] = info[1]


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
    wefSorceries = []
    for wefCard in customSets["WEF"]:
        if wefCard['type'] == "Sorcery":
            if wefCard['cmc'] == str(cmc):
                wefSorceries.append(wefCard)

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


def loadCustomSet(set):
    path = './../CustomSets/' + set + '/'
    files = [posJson for posJson in os.listdir(path) if posJson.endswith('.json')]
    cards = [[], []]
    for file in files:
        cardJsonFile = json.load(open(path + file, encoding="utf8"))
        cards[0].append(cardJsonFile)
        cards[1].append(cardJsonFile["name"].upper())
    return cards


def giveJson():
    a = json.load(open('bag.json'))
    return io.StringIO(json.dumps(a, indent=4, sort_keys=True))


def createTTSBag(bagName="bagTest", containedObjects=[]):
    bag = json.load(open('bag.json'))
    bag["ObjectStates"][0]["Nickname"] = bagName
    bag["ObjectStates"][0]["ContainedObjects"] = containedObjects
    return bag


def createTTSDeck(deckName="deckTest", cardAtt={"name": [], "desc": [], "image": [], "back": []}, back=""):
    if len(cardAtt.get("name")) == 0:
        return None

    elif len(cardAtt.get("name")) == 1:
        return createTTSCardObject(cardAtt, 0, random.randint(0, 999), back)[0]

    else:
        deck = json.load(open('ttsDeck.json'))
        deck["Nickname"] = deckName
        deckId = 1
        cardIdsUsed = 0
        for x in range(len(cardAtt.get("name"))):
            cardId = int(str(deckId) + str(cardIdsUsed))
            cardAndObject = createTTSCardObject(cardAtt, x, cardId, back)
            deck["ContainedObjects"].append(cardAndObject[0])
            deck["CustomDeck"].update({cardId: cardAndObject[1]})
            cardIdsUsed += cardAndObject[2]
            deck["DeckIDs"].append(cardId * 100)
        return deck


def createTTSCardObject(cardAtt, cardNum, cardId="12345", back=""):
    card = json.load(open('ttsCard.json'))
    card["FaceURL"] = cardAtt.get("image")[cardNum]
    card["BackURL"] = back

    ttsObject = json.load(open('ttsObject.json'))
    ttsObject["Nickname"] = cardAtt.get("name")[cardNum]
    ttsObject["CardID"] = cardId * 100
    ttsObject["Description"] = cardAtt.get("desc")[cardNum]
    ttsObject["CustomDeck"].update({cardId: card})
    idsUsed = 1
    if cardAtt["back"][cardNum] != "":
        auxCardAtt = {"image": [cardAtt["back"][cardNum]], "back": [""], "name": [cardAtt["name"][cardNum]], "desc": [cardAtt["desc"][cardNum]]}
        ttsObject["States"] = {2: createTTSCardObject(auxCardAtt, 0, cardId + 1, back)[0]}
        idsUsed = 2
    return [ttsObject, card, idsUsed]


def makeDeck(deckName="exampleName", cardDictList=[], customBack="", activeCustomSets=False):
    errors = ""
    cardNumber = 0
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
                customSetFlag = ""
                if activeCustomSets:
                    if "set" in cardDict:
                        for cusSet in customSets:
                            if cardDict["set"].upper() == cusSet:
                                customSetFlag = cusSet
                    else:
                        for cusSet in customSets:
                            if cardDict["name"].upper() in customSetsCardNames[cusSet]:
                                if cardDict["name"].upper() not in ["PLAINS", "ISLAND", "SWAMP", "FOREST", "MOUNTAIN"]:
                                    customSetFlag = cusSet
                if customSetFlag != "":
                    cardList = getCustomCardProperties(cardDict["name"], customSetFlag)
                else:
                    cardJson = searchForSpecificCardInScryfall(cardDict)
                    cardList = getCardProperties(cardJson)
                for x in range(int(cardDict["num"])):
                    for card in cardList:
                        i = str(deckNum)
                        if card["flag"] == 1:
                            i = "double"
                        elif card["flag"] == 2:
                            i = "tokens"
                        if i not in cardImagesLists:
                            cardImagesLists[i] = {"name": [], "desc": [], "image": [], "back": []}
                        cardImagesLists[i]["name"].append(card["name"])
                        cardImagesLists[i]["desc"].append(card["desc"])
                        cardImagesLists[i]["image"].append(card["image"])
                        if card["back"] != "":
                            cardImagesLists[i]["back"].append(card["back"])
                        else:
                            cardImagesLists[i]["back"].append("")
                    cardNumber += 1
            except Exception as e:
                errors += "Somethign went wrong with: " + str(cardDict) + "\n"
                # print(traceback.format_exc())
    cardImagesListsFinal = {}
    if "tokens" in cardImagesLists:
        cardImagesListsFinal["tokens"] = cardImagesLists.pop("tokens")
    if "double" in cardImagesLists:
        cardImagesListsFinal["double"] = cardImagesLists.pop("double")
    cardImagesListsFinal.update(cardImagesLists)
    containedObjects = []
    deckNum = 0
    for x in cardImagesListsFinal:
        sectionName = "deck"
        if str(x) in sectionNames:
            sectionName = sectionNames[x]
        containedObjects.append(createTTSDeck(sectionName, cardImagesListsFinal[x], back))
    bag = createTTSBag(deckName, containedObjects)
    return [io.StringIO(json.dumps(bag, indent=4, sort_keys=False)), errors, cardNumber]


def getCardProperties(cardJson):
    cards = [{"name": cardJson["name"], "desc": "", "image": "", "back": "", "flag": 0}]
    try:
        cards[0]["desc"] = str(cardJson["prices"]["eur"]) + "€"
    except:
        cards[0]["desc"] = "0€"
    try:
        cards[0]["image"] = cardJson['image_uris']['png']
    except:
        cards[0]["image"] = cardJson["card_faces"][0]['image_uris']['png']
        cards[0]["back"] = cardJson["card_faces"][1]['image_uris']['png']
    # print("tokens I guess")
    return cards


def getCustomCardProperties(name, set):
    index = customSetsCardNames[set].index(name.upper())
    cardJson = customSets[set][index]
    cards = [{"name": cardJson["name"], "desc": "0€", "image": cardJson["png"], "back": cardJson["back"], "flag": 0}]
    # print("tokens I guess")
    return cards


def checkLegality(cardList=[], legalIn="", whiteList=[], banList=[], sets=""):
    errors = ""
    if sets != "":
        sets = createListOfCardsFromSetList(sets)
    for cardDict in cardList:
        if "separator" not in cardDict:
            card = cardDict['name']
            errToAdd = ""

            if legalIn != "":
                try:
                    legality = searchForCardInScryfall(card)["legalities"][legalIn]
                    if legality != "legal":
                        errToAdd = "   ILLEGAL CARD: \"" + card + "\" is " + legality + " in " + legalIn + ".\n"
                    else:
                        errToAdd = "legal"
                except Exception as err:
                    errToAdd = "   ILLEGAL CARD: \"" + card + "\" has not been found.\n"
            if sets != "":
                if card.upper() not in (n.upper() for n in sets):
                    if errToAdd != "legal":
                        errToAdd = "   ILLEGAL CARD: \"" + card + "\" is not within the sets.\n"
                else:
                    errToAdd = "legal"
            if errToAdd != "legal" and whiteList != []:
                if card.upper() in (n.upper() for n in whiteList):
                    errToAdd = "legal"
            if card.upper() in (n.upper() for n in banList):
                errToAdd = "   ILLEGAL CARD: \"" + card + "\" is a banned card.\n"
            if errToAdd != "legal":
                errors += errToAdd
    return errors


def createListOfCardsFromSetList(sets=[]):
    cardList = []
    global customSets
    for set in sets:
        if set in customSets:
            cardList.extend(customSetsCardNames[set])
        else:
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
    try:
        return requests.get("https://api.scryfall.com/cards/search?q=!\"" + cardName + "\"").json()['data'][0]
    except:
        # print(traceback.format_exc())
        print("Error with Scryfall request with card: " + cardName)


def searchForCardIDInScryfall(id):
    try:
        return requests.get("https://api.scryfall.com/cards/id").json()
    except:
        # print(traceback.format_exc())
        print("Error with Scryfall request with the card with the id: " + id)


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
    cardDict["name"] = cardDict["name"].encode('cp1252').decode('Latin-1')
    if cardDict["name"] == "":
        return None
    return cardDict


def getNamesFromJson(json):
    list = []
    for card in json:
        list.append(card['name'])
    return list


def generatePacks(set, numberOfPacks, customBacks=""):
    back = customBack
    if back == "":
        global officialBack
        back = officialBack
    isCustom = False
    if set in customSets:
        isCustom = True
    # Draft Using MTGJson
    try:
        setJson = requests.get("https://mtgjson.com/api/v5/" + set.upper() + ".json").json()
        boosters = setJson["data"]["booster"]["default"]
        containedObjects = []
        scryFallSetData = getScryfallApiCallData("https://api.scryfall.com/cards/search?q=unique:prints+set:" + set)
        cardMap = {}
        for card in setJson["data"]["cards"]:
            found = False
            cardToRemove = ""
            for scryFallCard in scryFallSetData:
                if card["identifiers"]["scryfallId"] == scryFallCard["id"]:
                    found = True
                    cardMap[card["uuid"]] = scryFallCard
                    break
            if found:
                scryFallSetData.remove(scryFallCard)
            else:
                cardMap[card["uuid"]] = searchForCardIDInScryfall(card["identifiers"]["scryfallId"])
                # print(card["name"] + " : " + card["identifiers"]["scryfallId"])
        for x in range(numberOfPacks):
            deckAtt = {"name": [], "desc": [], "image": [], "back": []}
            packTypeRndm = random.randint(0, boosters["boostersTotalWeight"] - 1)
            actualBoosterWeight = 0
            contents = []
            for packType in boosters["boosters"]:
                actualBoosterWeight += packType["weight"]
                if packTypeRndm < actualBoosterWeight:
                    contents = packType["contents"]
                    break
            for cardType in contents:
                for iterations in range(contents[cardType]):
                    cardRndm = random.randint(0, boosters["sheets"][cardType]["totalWeight"] - 1)
                    actualCardWeight = 0
                    card = ""
                    for cardJsonMapKey in boosters["sheets"][cardType]["cards"]:
                        actualCardWeight += boosters["sheets"][cardType]["cards"][cardJsonMapKey]
                        if cardRndm < actualCardWeight:
                            card = cardMap[cardJsonMapKey]
                            break
                    cardProperties = getCardProperties(card)[0]
                    deckAtt["name"].append(cardProperties["name"])
                    deckAtt["desc"].append(cardProperties["desc"])
                    deckAtt["image"].append(cardProperties["image"])
                    deckAtt["back"].append(cardProperties["back"])
            containedObjects.append(createTTSDeck("Pack_" + str(x + 1), deckAtt, back))
        bag = createTTSBag("Packs", containedObjects)
    except:
        if not isCustom:
            print("Error at drafting: " + set)
        return generateDraft(set=set, numberOfPacks=numberOfPacks, back=back, isCustom=isCustom)
    return io.StringIO(json.dumps(bag, indent=4, sort_keys=True))


def generateDraft(set, numberOfPacks, back="", lastId=[""], isCustom=False):  # Deprecated for nonCustomSets
    pools = {}
    rates = {"rareSlot": {"rare": 7, "mythic": 1}, "uncommon": 3, "premiumSlot": {"common": 4, "premium": 1}, "common": 9, "basic": 1}
    if set in customSets:
        if set == "WEF":
            pools = createWEFPools()
            rates = {"rareSlot": {"rare": 7, "mythic": 1}, "uncommon": 3, "common": 10, "land": 1}
    if not isCustom:
        pools.update(createDefaultPools(set))
    if set == "STX":
        rates = {"sta": 1, "rareSlot": {"rare": 7, "mythic": 1}, "uncommon": 3, "common": 10}
        pools["sta"] = createPool("set:sta")
    if set == "CNS":
        rates = {"rareSlot": {"rare": 7, "mythic": 1}, "uncommon": 3, "common": 11}
    bag = createTTSBag("Packs", createDraftPacks(pools, rates, numberOfPacks, back, isCustom, set, lastId))
    return io.StringIO(json.dumps(bag, indent=4, sort_keys=True))

def createPool(query):
    return getScryfallApiCallData("https://api.scryfall.com/cards/search?q=" + query)


def createWEFPools():
    pools = {"basic": [], "land": [], "common": [], "uncommon": [], "rare": [], "mythic": []}
    global customSets
    for card in customSets["WEF"]:
        if card["rarity"] == "b":
            pools["basic"].append(card["name"])
        elif card["rarity"] == "c":
            pools["common"].append(card["name"])
            if card["type"] == "Land":
                pools["land"].append(card["name"])
        elif card["rarity"] == "u":
            pools["uncommon"].append(card["name"])
        elif card["rarity"] == "r":
            pools["rare"].append(card["name"])
        elif card["rarity"] == "m":
            pools["mythic"].append(card["name"])
    return pools


def createDefaultPools(set):
    pools = {}
    try:
        pools["basic"] = createPool("t:basic+unique:prints+set:" + set)
    except:
        pools["basic"] = createPool("t:basic+unique:prints")
    try:
        pools["common"] = createPool("-t:basic+r:c+is:booster+set:" + set)
    except:
        pools["common"] = createPool("r:c+set:" + set)
    try:
        pools["uncommon"] = createPool("r:u+is:booster+set:" + set)
    except:
        pools["uncommon"] = createPool("r:u+set:" + set)
    try:
        pools["rare"] = createPool("r:r+is:booster+set:" + set)
    except:
        pools["rare"] = createPool("r:r+set:" + set)
    try:
        pools["mythic"] = createPool("r:m+is:booster+set:" + set)
    except:
        try:
            pools["mythic"] = createPool("r:m+set:" + set)
        except:
            pass
    try:
        pools["premium"] = createPool("-is:booster+-t:basic+set:" + set)
    except:
        pass
    return pools


def createDraftPacks(pools, rates, numberOfPacks, back, isCustom=False, set="", lastId=[""]):
    containedObjects = []
    securityId = lastId[0]
    for packX in range(numberOfPacks):
        securityCardNum = 0
        deckAtt = {"name": [], "desc": [], "image": [], "back": []}
        if securityId != "":
            securityId += 1
        for key in rates:
            if isinstance(rates[key], dict):
                finalNumberOfCardsInPacks = 1
                finalKey = ""
                rndomTotal = 0
                for secKey in rates[key]:
                    rndomTotal += rates[key][secKey]
                rndm = random.randint(0, rndomTotal - 1)
                rndomTotal = 0
                for secKey in rates[key]:
                    rndomTotal += rates[key][secKey]
                    if finalKey == "":
                        if rndm < rndomTotal:
                            finalKey = secKey
            else:
                finalKey = key
                finalNumberOfCardsInPacks = rates[key]
            for cardX in range(finalNumberOfCardsInPacks):
                securityCardNum += 1
                totalCards = len(pools[finalKey])
                randomCard = random.randint(0, totalCards - 1)
                card = pools[finalKey][randomCard]
                if isCustom:
                    cardProperties = getCustomCardProperties(card, set)[0]
                else:
                    cardProperties = getCardProperties(card)[0]
                deckAtt["name"].append(cardProperties["name"])
                if securityId != "":
                    deckAtt["desc"].append(lastId[1] + "-" + str(securityId).zfill(3) + "-" + hex(securityCardNum).lstrip("0x"))
                else:
                    deckAtt["desc"].append(cardProperties["desc"])
                deckAtt["image"].append(cardProperties["image"])
                if cardProperties["back"] != "":
                    deckAtt["back"].append(cardProperties["back"])
                else:
                    deckAtt["back"].append("")
        containedObjects.append(createTTSDeck("Pack_" + str(packX + 1), deckAtt, back))
    return containedObjects

def exportCustomSet(set, customBacks=""):
    back = customBack
    if back == "":
        global officialBack
        back = officialBack
    isCustom = False
    if set in customSets:
        isCustom = True



import datetime
import json
import os
import traceback

import discord
from discord.ext import commands
from discord.ext.commands.context import Context
import requests

import ScryfallImplementation

inHeroku = False
if 'TOKEN' in os.environ:
    inHeroku = True

if inHeroku:
    TOKEN = os.environ['TOKEN']
    wefDesigner = int(os.environ['wefDesigner'])
    ownerId = int(os.environ['ownerId'])
else:
    localVars = json.load(open('localVars.json', encoding="utf8"))
    TOKEN = localVars['TOKEN']  ##Testing Token
    wefDesigner = int(localVars['wefDesigner'])
    ownerId = int(localVars['ownerId'])

client = commands.Bot(command_prefix='|', description="This is my personal bot", help_command=None,
                      case_insensitive=True)


@client.event
async def on_ready():
    print('Logged in as:')
    print(client.user.name)
    print(client.user.id)
    print('------')
    await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="|help"))
    ScryfallImplementation.loadCustomSets()


@client.command()
async def ping(ctx):
    await ctx.send('pong')


@client.command()
async def help(ctx):
    help = """
        > ping -> pong
        \n
        \n> build -> Returns a .json in a format that Tabletop Simulator can read, with all the cards in the decklist provided.
        \nThe format for this command is:
        ```|build <nameOfTheDeckWithoutSpaces> <url of the sleeve> (Neither the Name or the Sleeves are compulsory arguments)
        \n<deckList Here> (Note that the deckList must start in a line below the command)
        ```If the deckList doesn't fit in the 2000 character maximum, you can send the deckList in a .txt, where the message will be the command and the arguments.
        \nAs an example: 
        ```|build <name_of_the_deck_without_spaces> <url of the sleeve>
        \n <decklist.txt>```
        """
    # > billy X -> activate the -X of Billy, The Unstable Gambler\n
    url = "https://c1.scryfall.com/file/scryfall-cards/art_crop/front/b/4/b474378c-5fa8-418f-8d76-23e78003ed18.jpg?1576385483"
    embed = discord.Embed(title="List of Spells of the Tamiyo's Library", url=url, description=help,
                          timestamp=datetime.datetime.utcnow(),
                          color=discord.Color.green())
    embed.set_footer(text="Asked by: {}".format(ctx.author.name))
    embed.set_author(name="Ryuggha",
                     icon_url=url)
    await ctx.send(embed=embed)


@client.command()
async def billy(ctx, *arg):
    if ctx.author.id == ownerId or ctx.author.id == wefDesigner:
        if len(arg) < 1:
            await ctx.send("You must input the mana value of X after the command")
        else:
            cmc = arg[0]
            try:
                cmc = int(cmc)
                if cmc <= 0:
                    await ctx.send("X can't be 0. Read the card.")
                elif cmc < 13:
                    url = ScryfallImplementation.billy(cmc)
                    await ctx.send(url)
                else:
                    await ctx.send("Billy tried it's best, but can't find any spell...\nYou cast nothing.")
            except:
                await ctx.send(str(cmc) + " is an invalid mana value. \nYou must input the mana value of X after the command.")


@client.command()
async def json(ctx: Context):
    x = ScryfallImplementation.giveJson()
    await ctx.send(file=discord.File(x, "test.json"))


@client.command()
async def bd(ctx):
    await build(ctx)


@client.command()
async def buildDeck(ctx):
    await build(ctx)


@client.command()
async def build(ctx):
    msg = ctx.message.content
    firstLine = msg.split('\n', 1)[0]
    args = firstLine.split(" ")
    try:
        if args[1] != "":
            deckName = args[1]
        else:
            deckName = "Unnamed Deck"
    except:
        deckName = "Unnamed Deck"
    try:
        back = args[2]
    except:
        back = ""
    attachments = ctx.message.attachments
    deckLists = []
    inMessageDeck = "\n".join(msg.split("\n")[1:])
    if inMessageDeck != "":
        deckLists.append(inMessageDeck)
    for x in range(len(attachments)):
        deckLists.append(requests.get(attachments[x].url).text)
    if len(deckLists) == 0:
        await ctx.send("There is no deck to create. Try attaching a .txt file with the deckList on it with the command")
    else:
        for x in range(len(deckLists)):
            sendA = "Creating deck"
            numeral = ""
            if len(deckLists) > 1:
                sendA += " number " + str(x)
                numeral = "_" + str(x)
            sendB = ", this may take a while. \nPlease wait..."
            await ctx.send(sendA + sendB)
            try:
                cardDictList = ScryfallImplementation.readDeckList(deckLists[x])
                activeCustomSets = False
                if ctx.author.id == ownerId or ctx.author.id == wefDesigner:
                    activeCustomSets = True
                deck = ScryfallImplementation.makeDeck(deckName + numeral, cardDictList, back, activeCustomSets)
                await ctx.send(file=discord.File(deck[0], deckName + numeral + ".json"))
                if deck[1] != "":
                    await ctx.send(deck[1] + "Your deck has been created without the problematic lines.\n")
                await ctx.send("A deck with " + str(deck[2]) + " total cards have been created.")
            except Exception as err:
                await ctx.send("There has been an unknown error to create this deck...\n")
                print(traceback.format_exc())


@client.command()
async def packs(ctx, *args):
    if ctx.author.id == ownerId or ctx.author.id == wefDesigner:
        await ctx.send("Creating packs, this may take a while. \nPlease wait...")
        bag = ScryfallImplementation.generateDraft(args[1].upper(), int(args[0]))
        await ctx.send(file=discord.File(bag, "packs.json"))


client.run(TOKEN)

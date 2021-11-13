import datetime
import json
import os
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

client = commands.Bot(command_prefix='|', description="This is my personal bot", help_command=None)


@client.event
async def on_ready():
    print('Logged in as:')
    print(client.user.name)
    print(client.user.id)
    print('------')
    await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="|help"))


@client.command()
async def ping(ctx):
    await ctx.send('pong')


@client.command()
async def help(ctx):
    help = """
    > ping -> pong\n
    
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
async def makeDeckFromFile(ctx):
    deckName = "testCommander1"
    attachments = ctx.message.attachments
    deckLists = []
    for x in range(len(attachments)):
        deckLists.append(requests.get(attachments[x].url).text)

    if len(deckLists) == 0:
        await ctx.send("There is no deck to create. Try attaching a .txt file with the deckList on it with the command")
    elif len(deckLists) == 1:
        await ctx.send("Crating deck, this may take a while. Please wait...")
        try:
            cardDictList = ScryfallImplementation.readDeckList(deckLists[0])
            deck = ScryfallImplementation.makeDeck(deckName, cardDictList)
            await ctx.send(file=discord.File(deck[0], deckName + ".json"))
            if deck[1] != "":
                await ctx.send(deck[1] + "Your deck has been created without the problematic lines.")
        except Exception as err:
            await ctx.send("There has been an unknown error...")
            print(err)
    else:
        await ctx.send("WIP")


client.run(TOKEN)

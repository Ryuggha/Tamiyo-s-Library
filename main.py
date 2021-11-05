import discord
from discord.ext import commands
import datetime
from boto.s3.connection import S3Connection
import os
import json

import ScryfallImplementation

inHeroku = False
if 'TOKEN' in os.environ:
    inHeroku = True

if inHeroku:
    TOKEN = os.environ['TOKEN']
else:
    localVars = json.load(open('localVars.json', encoding="utf8"))
    TOKEN = localVars['TOKEN']  ##Testing Token

client = commands.Bot(command_prefix='|', description="This is my personal bot", help_command=None)


@client.event
async def on_ready():
    print('Logged in as:')
    print(client.user.name)
    ##print(client.user.id)
    print('------')
    print('Pa que veas')
    await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="|help"))


@client.command()
async def ping(ctx):
    await ctx.send('pong')


@client.command()
async def help(ctx):
    help = """
    > ping -> pong\n
    > billy X -> activate the -X of Billy, The Unstable Gambler\n
    """
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






client.run(TOKEN)

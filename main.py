import discord
import os
from discord.ext import commands

TOKEN = 'OTA1ODU4ODU1MTQ4MzIyODk4.YYQMzQ.PIR740b8M2LvdSoTG7aBU4PH-uw' ##Testing Token

is_prod = os.environ.get('IS_HEROKU', None)
if is_prod:
    print('Heroku App is Active')
    TOKEN = ''

client = commands.Bot(command_prefix='|', description="this is a testing bot")

@client.event
async def on_ready():
    print('Logged in as:')
    print(client.user.name)
    ##print(client.user.id)
    print('------')

@client.command()
async def ping(ctx):
     await ctx.send('pong')

client.run(TOKEN)

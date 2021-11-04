import discord
from discord.ext import commands
from boto.s3.connection import S3Connection
import os
import json

inHeroku = False
if 'TOKEN' in os.environ:
  inHeroku = True
  print(inHeroku)

if inHeroku:
    TOKEN = os.environ['TOKEN']
else:
    localVars = json.load(open('localVars.json', encoding="utf8"))
    TOKEN = localVars['TOKEN'] ##Testing Token


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

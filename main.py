import discord
from discord.ext import commands
import asyncio
import random
import datetime
import os
import traceback

# ────────────────────────────────────────────────
#   CONFIG — CHANGE ONLY OWNER_ID IF NEEDED
# ────────────────────────────────────────────────

PREFIX = ","                           # command prefix
OWNER_ID = 1459833646130401429         # your user ID (matches the token you gave)

# Low-profile presence
GAME_STATUS = random.choice([
    "being based", "existing quietly", "off radar", "trolling in silence"
])

# Storage for sniped deleted messages
deleted_msgs = {}  # {channel_id: [ {"time":dt, "author":str, "content":str, "files":list}, ... ] }

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.members = True

bot = commands.Bot(
    command_prefix=PREFIX,
    self_bot=True,
    intents=intents,
    help_command=None
)

# ────────────────────────────────────────────────
#   ONLY YOUR ACCOUNT CAN USE COMMANDS
# ────────────────────────────────────────────────

@bot.before_invoke
async def enforce_owner_only(ctx):
    if ctx.author.id != OWNER_ID:
        raise commands.CommandNotFound  # silent ignore — looks like no command exists

@bot.event
async def on_ready():
    bot.launch_time = datetime.datetime.utcnow()
    print(f"[+] JACK ONLINE → {bot.user} ({bot.user.id})")
    print(f"[+] Owner locked to ID: {OWNER_ID}")
    await bot.change_presence(
        activity=discord.Game(name=GAME_STATUS),
        status=discord.Status.idle
    )

# ────────────────────────────────────────────────
#   Deleted message sniper (.s)
# ────────────────────────────────────────────────

@bot.event
async def on_message_delete(message):
    if message.author.bot or message.author.id == bot.user.id:
        return
    cid = message.channel.id
    if cid not in deleted_msgs:
        deleted_msgs[cid] = []
    entry = {
        "time": datetime.datetime.utcnow(),
        "author": f"{message.author} ({message.author.id})",
        "content": message.content or "[no text — embed/media]",
        "files": [att.url for att in message.attachments]

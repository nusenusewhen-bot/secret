import sys
import discord
from discord.ext import commands
import asyncio
import random
import datetime
import os
import traceback

print("=== DEBUG START ===")
print("Python version:", sys.version)
print("Python executable:", sys.executable)
print("discord location:", discord.__file__)
try:
    print("discord version:", discord.__version__)
except:
    print("No __version__ attribute")
print("=== DEBUG END ===")

# CONFIG
PREFIX = ","
OWNER_ID = 1459833646130401429

GAME_STATUS = random.choice(["being based", "existing quietly", "off radar"])

deleted_msgs = {}  # still works for snipe, as it uses on_message_delete event

bot = commands.Bot(
    command_prefix=PREFIX,
    # No self_bot=True anymore – we're on regular discord.py
    # No intents= at all
    help_command=None
)

@bot.before_invoke
async def owner_only(ctx):
    if ctx.author.id != OWNER_ID:
        raise commands.CommandNotFound  # silent ignore for non-owner

@bot.event
async def on_ready():
    bot.launch_time = datetime.datetime.utcnow()
    print(f"ONLINE → {bot.user} ({bot.user.id})")
    print(f"Owner lock: {OWNER_ID}")
    await bot.change_presence(activity=discord.Game(name=GAME_STATUS), status=discord.Status.idle)

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
        "content": message.content or "[embed/media]",
        "files": [a.url for a in message.attachments]
    }
    deleted_msgs[cid].append(entry)
    now = datetime.datetime.utcnow()
    deleted_msgs[cid] = [e for e in deleted_msgs[cid] if (now - e["time"]).total_seconds() < 3600]

@bot.command(name="s")
async def snipe(ctx):
    cid = ctx.channel.id
    if cid not in deleted_msgs or not deleted_msgs[cid]:
        await ctx.send("No snipes.")
        return
    embed = discord.Embed(title="Sniped (last 60min)", color=0xff5555)
    for i, e in enumerate(reversed(deleted_msgs[cid][-10:]), 1):
        ts = e["time"].strftime("%H:%M:%S")
        val = f"**{e['author']}** • {ts}\n{e['content'][:400]}"
        if e["files"]:
            val += "\n" + "\n".join(e["files"][:2])
        embed.add_field(name=f"#{i}", value=val, inline=False)
    await ctx.send(embed=embed)

@bot.command()
async def ping(ctx):
    await ctx.send(f"Pong {round(bot.latency * 1000)}ms")

@bot.command()
async def say(ctx, *, text):
    await ctx.message.delete()
    await ctx.send(text)

@bot.command()
async def help(ctx):
    cmds = [c.name for c in sorted(bot.commands, key=lambda c: c.name)]
    await ctx.send("Commands: " + ", ".join(f"`{PREFIX}{c}`" for c in cmds[:30]) + " ...")

if __name__ == "__main__":
    token = os.getenv("TOKEN")
    if not token:
        print("NO TOKEN SET")
        sys.exit(1)
    try:
        bot.run(token)  # no bot=False – regular discord.py doesn't use that
    except Exception as e:
        print("RUN ERROR:", str(e))
        traceback.print_exc()
        sys.exit(1)

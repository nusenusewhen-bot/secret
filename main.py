import discord
from discord.ext import commands
import asyncio
import random
import datetime
import os
import traceback

# ────────────────────────────────────────────────
#   CONFIG
# ────────────────────────────────────────────────

PREFIX = ","                           # command prefix
OWNER_ID = 1459833646130401429         # your user ID

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
        raise commands.CommandNotFound  # silent ignore

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
    }

    deleted_msgs[cid].append(entry)

    # remove entries older than 1 hour
    now = datetime.datetime.utcnow()
    deleted_msgs[cid] = [
        e for e in deleted_msgs[cid]
        if (now - e["time"]).total_seconds() < 3600
    ]

@bot.command(name="s")
async def snipe(ctx):
    """Snipes deleted messages from the last hour in this channel"""
    cid = ctx.channel.id
    if cid not in deleted_msgs or not deleted_msgs[cid]:
        await ctx.send("No snipes in the last hour here.")
        return

    embed = discord.Embed(title="🪦 Sniped Deletes (last 60 min)", color=0xff5555)
    entries = deleted_msgs[cid][-12:]  # show up to 12
    for i, e in enumerate(reversed(entries), 1):
        ts = e["time"].strftime("%H:%M:%S")
        val = f"**{e['author']}**  •  {ts}\n{e['content'][:450]}"
        if e["files"]:
            val += "\n" + "\n".join(e["files"][:3])
        embed.add_field(name=f"#{i}", value=val, inline=False)

    await ctx.send(embed=embed)

# ────────────────────────────────────────────────
#   Help command — paginated
# ────────────────────────────────────────────────

@bot.command()
async def help(ctx):
    """Shows all commands (paginated)"""
    cmds = sorted(bot.commands, key=lambda c: c.name)
    per_page = 15
    pages = [cmds[i:i+per_page] for i in range(0, len(cmds), per_page)]
    for idx, page in enumerate(pages, 1):
        embed = discord.Embed(
            title=f"Commands ({len(cmds)} total) — Page {idx}/{len(pages)}",
            color=0x00ff99
        )
        for cmd in page:
            desc = cmd.help or "No description"
            embed.add_field(name=f"{PREFIX}{cmd.name}", value=desc[:100], inline=True)
        await ctx.send(embed=embed)
        await asyncio.sleep(0.75)  # avoid rate limits

# ────────────────────────────────────────────────
#   Utility commands
# ────────────────────────────────────────────────

@bot.command()
async def ping(ctx):
    """Shows latency"""
    await ctx.send(f"Pong → {round(bot.latency * 1000)} ms")

@bot.command()
async def say(ctx, *, text):
    """Say something and delete your command message"""
    await ctx.message.delete()
    await ctx.send(text)

@bot.command()
async def purge(ctx, amount: int = 20):
    """Delete your own recent messages"""
    count = 0
    async for msg in ctx.channel.history(limit=amount + 10):
        if msg.author.id == bot.user.id:
            await msg.delete()
            count += 1
            await asyncio.sleep(0.3)
    await ctx.send(f"Deleted {count} of my messages.", delete_after=5)

@bot.command()
async def avatar(ctx, member: discord.Member = None):
    member = member or ctx.author
    await ctx.send(member.display_avatar.url)

# ────────────────────────────────────────────────
#   Troll commands
# ────────────────────────────────────────────────

@bot.command()
async def spam(ctx, count: int = 5, *, text="get trolled"):
    for _ in range(min(count, 10)):
        await ctx.send(text)
        await asyncio.sleep(0.65)

@bot.command()
async def ghostping(ctx, member: discord.Member):
    msg = await ctx.send(member.mention)
    await asyncio.sleep(0.5)
    await msg.delete()

@bot.command()
async def rick(ctx):
    await ctx.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

@bot.command()
async def invisible(ctx):
    await ctx.send("||\u200b||\u200b||\u200b||")

@bot.command()
async def mimic(ctx, member: discord.Member, *, text):
    await ctx.message.delete()
    await ctx.send(f"**{member.display_name}**: {text}")

# ────────────────────────────────────────────────
#   START
# ────────────────────────────────────────────────

if __name__ == "__main__":
    token = os.getenv("TOKEN")
    if not token:
        print("ERROR: TOKEN environment variable not set!")
    else:
        try:
            bot.run(token, bot=False)
        except Exception as e:
            print("Login failed:", str(e))
            traceback.print_exc()

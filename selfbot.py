import discord
import asyncio
import re
import os

client = discord.Client()

@client.event
async def on_ready():
    print(f"[+] Logged in as {client.user} (ID: {client.user.id})")
    print("[+] Self-bot active on Railway. Listening for your commands only.")
    print("Command format: !channel_id message_here count (max 5)")

@client.event
async def on_message(message):
    if message.author != client.user:
        return

    content = message.content.strip()
    match = re.match(r'^!(\d{17,20})\s+(.+?)\s+(\d{1,2})$', content)

    if not match:
        return

    try:
        channel_id = int(match.group(1))
        text = match.group(2).strip()
        count = int(match.group(3))

        if count < 1 or count > 5:
            await message.channel.send("Count must be 1–5 (ban risk).", delete_after=8)
            return

        channel = client.get_channel(channel_id)
        if channel is None:
            await message.channel.send("Channel not found / no permission.", delete_after=8)
            return

        await message.channel.send(
            f"→ Starting {count}× send of \"{text}\" to <#{channel_id}>",
            delete_after=10
        )

        for i in range(count):
            await channel.send(text)
            await asyncio.sleep(4.5 + i * 1.0)  # very conservative delay

        await message.channel.send("── Finished ──", delete_after=6)

    except Exception as e:
        await message.channel.send(f"Error: {str(e)[:180]}", delete_after=10)
        print(f"Runtime error: {e}")

# Token **must** come from Railway variable – never commit it!
token = os.getenv("DISCORD_TOKEN")
if not token:
    raise ValueError("DISCORD_TOKEN environment variable missing!")

client.run(token.strip(), bot=False)

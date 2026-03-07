require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Shop data configuration
const shopData = {
    members: {
        title: '👥 Members',
        description: '• 1000 Offline —> 1$\n• 1000 Online —> 2$',
        emoji: '👥',
        color: 0x3498db
    },
    social: {
        title: '📱 Social Boost',
        description: `**Tiktok**
1000 Follows —> 3$
1000 Views —> 0.2$
1000 Likes —> 1$

**Youtube**
1000 Sub —> 3.5$
1000 Views —> 0.5$
1000 Likes —> 1$

**Instagram**
1000 Follows —> 2.5$
1000 Views —> 0.2$
1000 Likes —> 0.4$`,
        emoji: '📱',
        color: 0xe74c3c
    },
    nitro: {
        title: '🎁 Nitro',
        description: 'Nitro Basic —> 1.5$\nNitro Boost —> 4$',
        emoji: '🎁',
        color: 0x9b59b6
    },
    serverboost: {
        title: '⚡ Server Boost',
        description: '14x 1 month —> 3.2$\n14x 3 month —> 6$',
        emoji: '⚡',
        color: 0xf39c12
    },
    decorations: {
        title: '🎨 Decorations',
        description: '4.99$ —> 1.8$\n5.99$ —> 2.3$\n6.99$ —> 2.7$\n7.99$ —> 3$\n8.99$ —> 3.4$\n9.99$ —> 3.7$\n11.39$ —> 4.5$',
        emoji: '🎨',
        color: 0x1abc9c
    },
    accounts: {
        title: '👤 Accounts',
        description: 'Korblox acc —> 30$\nHeadless acc —> 60$\nBoth —> 90$',
        emoji: '👤',
        color: 0x34495e
    },
    mcfa: {
        title: '🔐 MCFA',
        description: 'MCFA —> 7.99$',
        emoji: '🔐',
        color: 0x95a5a6
    }
};

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    
    const commands = [
        new SlashCommandBuilder()
            .setName('shop')
            .setDescription('Display the shop menu with all products'),
        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Send a message to a specific channel (Admin only)')
            .addChannelOption(option => 
                option.setName('channel')
                    .setDescription('The channel to send the message to')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option => 
                option.setName('message')
                    .setDescription('The message to send')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        new SlashCommandBuilder()
            .setName('copy')
            .setDescription('Copy a message content in copyable format (use forwarded messages for external servers)')
            .addStringOption(option => 
                option.setName('message')
                    .setDescription('Message link or ID (forward message to this server first if from another server)')
                    .setRequired(true))
    ];
    
    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

// Helper function to parse message link or fetch by ID
async function fetchMessage(guild, query) {
    // Check if it's a message link
    const linkRegex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const linkMatch = query.match(linkRegex);
    
    if (linkMatch) {
        const [, guildId, channelId, messageId] = linkMatch;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return null;
        return await channel.messages.fetch(messageId).catch(() => null);
    }
    
    // Try to fetch by ID from current guild channels
    const channels = await guild.channels.fetch();
    for (const [, channel] of channels) {
        if (channel.isTextBased()) {
            try {
                const message = await channel.messages.fetch(query);
                if (message) return message;
            } catch {
                continue;
            }
        }
    }
    
    return null;
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'shop') {
        const embed = new EmbedBuilder()
            .setTitle('🛒 Shop Menu')
            .setDescription('If you want to purchase something and wanna know the price, click on which you wanna buy and it will tell the price.')
            .setColor(0x5865F2)
            .setTimestamp()
            .setFooter({ text: 'Click a button below to view prices' });

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_members')
                    .setLabel('Members')
                    .setEmoji('👥')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_social')
                    .setLabel('Social Boost')
                    .setEmoji('📱')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_nitro')
                    .setLabel('Nitro')
                    .setEmoji('🎁')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_serverboost')
                    .setLabel('Server Boost')
                    .setEmoji('⚡')
                    .setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_decorations')
                    .setLabel('Decorations')
                    .setEmoji('🎨')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_accounts')
                    .setLabel('Accounts')
                    .setEmoji('👤')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_mcfa')
                    .setLabel('MCFA')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2]
        });
    }
    
    if (interaction.commandName === 'say') {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        
        try {
            await channel.send(message);
            await interaction.reply({
                content: `✅ Message sent to ${channel}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({
                content: `❌ Failed to send message to ${channel}. Make sure I have permissions.`,
                ephemeral: true
            });
        }
    }
    
    if (interaction.commandName === 'copy') {
        const query = interaction.options.getString('message');
        
        await interaction.deferReply({ ephemeral: true });
        
        const message = await fetchMessage(interaction.guild, query);
        
        if (!message) {
            return await interaction.editReply({
                content: '❌ Message not found. If it\'s from another server, forward it to this server first, then use the forwarded message link/ID.\n\n**How to forward:**\n1. Right-click message → Forward\n2. Select this channel\n3. Use `/copy` with the forwarded message link'
            });
        }
        
        let content = message.content;
        let author = message.author;
        let sourceInfo = `From ${author.tag}`;
        
        // Handle forwarded messages
        if (message.type === MessageType.Forward && message.reference) {
            // Try to get original content from embeds or content
            if (message.embeds.length > 0) {
                const embed = message.embeds[0];
                content = embed.description || embed.title || message.content;
                if (embed.author) {
                    sourceInfo = `Forwarded from ${embed.author.name}`;
                }
            }
        }
        
        if (!content && message.embeds.length > 0) {
            // If no text content but has embeds, extract embed text
            const embed = message.embeds[0];
            content = embed.description || embed.title || '[Embed without text]';
        }
        
        if (!content && message.attachments.size > 0) {
            content = '[Message contains only attachments]';
        }
        
        if (!content) {
            return await interaction.editReply({
                content: '❌ Could not extract text content from this message.'
            });
        }
        
        // Create copyable format using code block for PC and mobile
        const copyableContent = `\`\`\`\n${content}\n\`\`\``;
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Copied Message')
            .setDescription(copyableContent)
            .setColor(0x2ecc71)
            .setFooter({ text: `${sourceInfo} • Click the 📋 button to copy` })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`copy_text_${interaction.id}`)
                    .setLabel('Copy Text')
                    .setEmoji('📋')
                    .setStyle(ButtonStyle.Success)
            );
        
        await interaction.editReply({
            content: '✅ Message copied! Use the button below or tap the code block to copy:',
            embeds: [embed],
            components: [row]
        });
        
        // Store content for button interaction
        client.copiedMessages = client.copiedMessages || new Map();
        client.copiedMessages.set(interaction.id, {
            content: content,
            author: author.tag,
            timestamp: Date.now()
        });
        
        // Cleanup after 10 minutes
        setTimeout(() => {
            client.copiedMessages.delete(interaction.id);
        }, 600000);
    }
});

// Handle copy button
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('copy_text_')) {
        const originalId = interaction.customId.replace('copy_text_', '');
        const data = client.copiedMessages?.get(originalId);
        
        if (!data) {
            return await interaction.reply({
                content: '❌ Copy data expired. Please use `/copy` again.',
                ephemeral: true
            });
        }
        
        await interaction.reply({
            content: `📋 **Copy this:**\n\`\`\`\n${data.content}\n\`\`\``,
            ephemeral: true
        });
    }
});

// Shop buttons handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('shop_')) {
        const category = interaction.customId.replace('shop_', '');
        const data = shopData[category];
        
        if (data) {
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(data.description)
                .setColor(data.color)
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
});

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);

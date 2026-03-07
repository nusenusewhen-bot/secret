require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
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
    
    // Register slash commands
    const commands = [
        new SlashCommandBuilder()
            .setName('shop')
            .setDescription('Display the shop menu with all products')
    ];
    
    try {
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'shop') {
            const embed = new EmbedBuilder()
                .setTitle('🛒 Shop Menu')
                .setDescription('If you want to purchase something and wanna know the price, click on which you wanna buy and it will tell the price.')
                .setColor(0x5865F2)
                .setTimestamp()
                .setFooter({ text: 'Click a button below to view prices' });

            // Create button rows (max 5 buttons per row)
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
    }
    
    if (interaction.isButton()) {
        const customId = interaction.customId;
        
        if (customId.startsWith('shop_')) {
            const category = customId.replace('shop_', '');
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
    }
});

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);

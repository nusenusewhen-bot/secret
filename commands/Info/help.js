const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Filter by category')
        .setRequired(false)
        .addChoices(
          { name: 'Owner', value: 'Owner' },
          { name: 'Admin', value: 'Admin' },
          { name: 'Moderation', value: 'Moderation' },
          { name: 'Economy', value: 'Economy' },
          { name: 'Fun', value: 'Fun' },
          { name: 'Games', value: 'Games' }
        )),
  
  // PREFIX COMMAND: !help or !help category
  messageRun: async (message, args, client) => {
    const categoryFilter = args[0];
    await sendHelp(message, client, categoryFilter, false);
  },
  
  // SLASH COMMAND: /help
  async execute(interaction, client) {
    const categoryFilter = interaction.options.getString('category');
    await sendHelp(interaction, client, categoryFilter, true);
  }
};

async function sendHelp(context, client, categoryFilter, isSlash) {
  const commands = client.commands;
  
  if (commands.size === 0) {
    return reply(context, '❌ No commands loaded!', isSlash);
  }
  
  // Group by category
  const categories = {};
  commands.forEach(cmd => {
    const cat = cmd.category || 'Misc';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmd);
  });
  
  // If filtering by category
  if (categoryFilter && categories[categoryFilter]) {
    const embed = createCategoryEmbed(categoryFilter, categories[categoryFilter], isSlash);
    return reply(context, { embeds: [embed] }, isSlash);
  }
  
  // Main help embed
  const embed = new EmbedBuilder()
    .setTitle(`${config.emojis.bot} Command List`)
    .setDescription(`**Total Commands:** ${commands.size}\n**Prefix:** \`${config.prefix}\`\n\nUse buttons below or \`${config.prefix}help <category>\``)
    .setColor(config.colors.primary)
    .setThumbnail(client.user.displayAvatarURL());
  
  // Add category fields
  Object.keys(categories).sort().forEach(cat => {
    const count = categories[cat].length;
    const cmdList = categories[cat]
      .slice(0, 3)
      .map(c => `\`${c.data.name}\``)
      .join(', ') + (categories[cat].length > 3 ? '...' : '');
    
    embed.addFields({
      name: `${getEmoji(cat)} ${cat} (${count})`,
      value: cmdList || 'No commands',
      inline: true
    });
  });
  
  embed.setFooter({ text: `Requested by ${isSlash ? context.user.tag : context.author.tag}` });
  
  // Create buttons
  const rows = createCategoryButtons(Object.keys(categories).sort());
  
  const msg = await reply(context, { embeds: [embed], components: rows }, isSlash);
  
  // Button collector
  const userId = isSlash ? context.user.id : context.author.id;
  const filter = i => i.user.id === userId;
  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
  
  collector.on('collect', async i => {
    const id = i.customId;
    
    if (id === 'help_home') {
      await i.update({ embeds: [embed], components: rows });
    } else {
      const cat = id.replace('help_', '');
      if (categories[cat]) {
        const catEmbed = createCategoryEmbed(cat, categories[cat], isSlash);
        const backRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('help_home')
              .setLabel('← Back')
              .setStyle(ButtonStyle.Secondary)
          );
        await i.update({ embeds: [catEmbed], components: [backRow] });
      }
    }
  });
  
  collector.on('end', () => {
    msg.edit({ components: [] }).catch(() => {});
  });
}

function createCategoryEmbed(category, commands, isSlash) {
  const prefix = isSlash ? '/' : config.prefix;
  
  const embed = new EmbedBuilder()
    .setTitle(`${getEmoji(category)} ${category} Commands`)
    .setColor(config.colors.primary)
    .setDescription(commands
      .sort((a, b) => a.data.name.localeCompare(b.data.name))
      .map(cmd => {
        const tag = cmd.ownerOnly ? '👑 ' : cmd.adminOnly ? '⚡ ' : '';
        return `${tag}\`${prefix}${cmd.data.name}\` - ${cmd.data.description}`;
      })
      .join('\n')
    );
  
  return embed;
}

function createCategoryButtons(categories) {
  const rows = [];
  let currentRow = new ActionRowBuilder();
  
  categories.forEach((cat, index) => {
    if (index % 5 === 0 && index > 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
    
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`help_${cat}`)
        .setLabel(cat)
        .setStyle(ButtonStyle.Primary)
    );
  });
  
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

function getEmoji(category) {
  const map = {
    'Owner': '👑',
    'Admin': '⚡',
    'Moderation': '🛡️',
    'Economy': '💰',
    'Fun': '🎮',
    'Games': '🎯',
    'Utility': '🛠️',
    'Info': 'ℹ️',
    'Misc': '📦'
  };
  return map[category] || '📄';
}

async function reply(context, payload, isSlash) {
  if (isSlash) {
    if (context.replied || context.deferred) {
      return await context.editReply(payload);
    }
    return await context.reply({ ...payload, fetchReply: true });
  } else {
    return await context.reply(payload);
  }
}

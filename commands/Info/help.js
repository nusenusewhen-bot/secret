const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Specific category')
        .setRequired(false)
        .addChoices(
          { name: 'Owner', value: 'Owner' },
          { name: 'Admin', value: 'Admin' },
          { name: 'Moderation', value: 'Moderation' },
          { name: 'Economy', value: 'Economy' },
          { name: 'Fun', value: 'Fun' },
          { name: 'Games', value: 'Games' },
          { name: 'Utility', value: 'Utility' },
          { name: 'Info', value: 'Info' }
        )),
  
  // Prefix command support (!help)
  messageRun: async (message, args, client) => {
    const category = args[0];
    await sendHelp(message, client, category, false);
  },
  
  // Slash command support (/help)
  async execute(interaction, client) {
    const category = interaction.options.getString('category');
    await sendHelp(interaction, client, category, true);
  }
};

async function sendHelp(context, client, categoryFilter, isSlash) {
  const commands = client.commands;
  const categories = {};
  
  // Group commands by category
  commands.forEach(cmd => {
    const cat = cmd.category || 'Misc';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmd);
  });
  
  // If specific category requested
  if (categoryFilter && categories[categoryFilter]) {
    const embed = createCategoryEmbed(categoryFilter, categories[categoryFilter]);
    return reply(context, { embeds: [embed] }, isSlash);
  }
  
  // Main help menu - show categories overview
  const embed = new EmbedBuilder()
    .setTitle(`${config.emojis.bot} Command Help`)
    .setDescription(`Total Commands: **${commands.size}**\nPrefix: \`${config.prefix}\`\n\nClick buttons below to view categories:`)
    .setColor(config.colors.primary)
    .setFooter({ text: `Requested by ${isSlash ? context.user.tag : context.author.tag}` });
  
  // Add fields for each category
  Object.keys(categories).sort().forEach(cat => {
    const count = categories[cat].length;
    const visible = categories[cat].filter(c => !c.ownerOnly).length;
    const ownerOnly = categories[cat].filter(c => c.ownerOnly).length;
    
    let value = `${count} commands`;
    if (ownerOnly > 0) value += ` (${ownerOnly} owner)`;
    
    embed.addFields({
      name: `${getCatEmoji(cat)} ${cat}`,
      value: value,
      inline: true
    });
  });
  
  // Create category buttons
  const rows = createCategoryButtons(Object.keys(categories).sort());
  
  const message = await reply(context, { embeds: [embed], components: rows }, isSlash);
  
  // Collector for button interactions
  const filter = i => i.user.id === (isSlash ? context.user.id : context.author.id);
  const collector = message.createMessageComponentCollector({ filter, time: 120000 });
  
  collector.on('collect', async i => {
    const selectedCat = i.customId.replace('help_', '');
    
    if (selectedCat === 'home') {
      await i.update({ embeds: [embed], components: rows });
    } else if (categories[selectedCat]) {
      const catEmbed = createCategoryEmbed(selectedCat, categories[selectedCat]);
      const backRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_home')
            .setLabel('← Back')
            .setStyle(ButtonStyle.Secondary)
        );
      await i.update({ embeds: [catEmbed], components: [backRow] });
    }
  });
  
  collector.on('end', () => {
    message.edit({ components: [] }).catch(() => {});
  });
}

function createCategoryEmbed(category, commands) {
  const embed = new EmbedBuilder()
    .setTitle(`${getCatEmoji(category)} ${category} Commands (${commands.length})`)
    .setColor(config.colors.primary)
    .setTimestamp();
  
  // Sort commands alphabetically
  commands.sort((a, b) => a.data.name.localeCompare(b.data.name));
  
  let description = '';
  commands.forEach(cmd => {
    const name = cmd.data.name;
    const desc = cmd.data.description;
    const ownerTag = cmd.ownerOnly ? '👑 ' : '';
    const adminTag = cmd.adminOnly ? '⚡ ' : '';
    
    description += `\`${config.prefix}${name}\` ${ownerTag}${adminTag}- ${desc}\n`;
  });
  
  // Split if too long (Discord limit 4096)
  if (description.length > 4000) {
    description = description.substring(0, 4000) + '...';
  }
  
  embed.setDescription(description || 'No commands in this category.');
  
  return embed;
}

function createCategoryButtons(categories) {
  const rows = [];
  let currentRow = new ActionRowBuilder();
  let count = 0;
  
  categories.forEach(cat => {
    if (count === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
      count = 0;
    }
    
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`help_${cat}`)
        .setLabel(cat)
        .setStyle(ButtonStyle.Primary)
        .setEmoji(getCatEmoji(cat))
    );
    count++;
  });
  
  if (count > 0) rows.push(currentRow);
  return rows;
}

function getCatEmoji(category) {
  const emojis = {
    'Owner': '👑',
    'Admin': '⚡',
    'Moderation': '🛡️',
    'Economy': '💰',
    'Fun': '🎮',
    'Games': '🎯',
    'Utility': '🛠️',
    'Info': 'ℹ️',
    'Social': '👥',
    'Misc': '📦'
  };
  return emojis[category] || '📄';
}

async function reply(context, payload, isSlash) {
  if (isSlash) {
    return await context.reply({ ...payload, fetchReply: true });
  } else {
    return await context.reply(payload);
  }
}

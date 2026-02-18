const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock Paper Scissors')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('Challenge user')
        .setRequired(true)),
  
  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    if (opponent.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Can\'t play yourself', ephemeral: true });
    }
    if (opponent.bot) {
      return interaction.reply({ content: '❌ Can\'t play bots', ephemeral: true });
    }
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('rps_rock').setLabel('🪨 Rock').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('rps_paper').setLabel('📄 Paper').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('rps_scissors').setLabel('✂️ Scissors').setStyle(ButtonStyle.Primary)
      );
    
    await interaction.reply({
      content: `${opponent}, ${interaction.user} challenged you!`,
      components: [row]
    });
  }
};

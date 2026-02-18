const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Shutdown bot (Owner Only)'),
  
  async execute(interaction) {
    await interaction.reply('🔴 Shutting down...');
    process.exit(0);
  }
};

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('Number (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    
    const messages = await interaction.channel.messages.fetch({ limit: amount });
    await interaction.channel.bulkDelete(messages);
    
    interaction.reply({ 
      content: `🗑️ Deleted ${messages.size} messages`, 
      ephemeral: true 
    });
  }
};

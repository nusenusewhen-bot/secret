const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason')
        .setRequired(false)),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found', ephemeral: true });
    
    await member.ban({ reason: `${interaction.user.tag}: ${reason}` });
    
    const embed = new EmbedBuilder()
      .setTitle('🔨 Banned')
      .setColor(config.colors.error)
      .addFields(
        { name: 'User', value: user.tag },
        { name: 'By', value: interaction.user.tag },
        { name: 'Reason', value: reason }
      );
    
    interaction.reply({ embeds: [embed] });
  }
};

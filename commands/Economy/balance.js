const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../../utils/helpers');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Check user')
        .setRequired(false)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = getUserData(target.id);
    
    const embed = new EmbedBuilder()
      .setTitle(`${config.emojis.money} Balance`)
      .setColor(config.colors.success)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'Wallet', value: `$${data.balance.toLocaleString()}`, inline: true },
        { name: 'Bank', value: `$${data.bank.toLocaleString()}`, inline: true },
        { name: 'Total', value: `$${(data.balance + data.bank).toLocaleString()}`, inline: true }
      );
    
    interaction.reply({ embeds: [embed] });
  }
};

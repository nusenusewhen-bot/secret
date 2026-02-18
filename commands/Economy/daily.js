const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, saveData } = require('../../utils/helpers');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Daily reward'),
  
  async execute(interaction) {
    const data = getUserData(interaction.user.id);
    const now = Date.now();
    const cooldown = 86400000;
    
    if (now - data.daily < cooldown) {
      const hours = Math.ceil((cooldown - (now - data.daily)) / 3600000);
      return interaction.reply({ 
        content: `⏳ Wait ${hours} hours`, 
        ephemeral: true 
      });
    }
    
    const amount = Math.floor(Math.random() * 500) + 500;
    data.balance += amount;
    data.daily = now;
    
    const allData = JSON.parse(require('fs').readFileSync('./storage/data.json'));
    allData.users[interaction.user.id] = data;
    saveData(allData);
    
    const embed = new EmbedBuilder()
      .setTitle('💰 Daily')
      .setColor(config.colors.success)
      .setDescription(`+$${amount.toLocaleString()}`);
    
    interaction.reply({ embeds: [embed] });
  }
};

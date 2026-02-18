const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Broadcast to all servers (Owner Only)')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Message')
        .setRequired(true)),
  
  async execute(interaction, client) {
    const msg = interaction.options.getString('message');
    let success = 0;
    
    await interaction.deferReply();
    
    for (const guild of client.guilds.cache.values()) {
      try {
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
        if (channel) {
          const embed = new EmbedBuilder()
            .setTitle('📢 Broadcast')
            .setDescription(msg)
            .setColor(config.colors.primary)
            .setFooter({ text: `From: ${interaction.user.tag}` });
          
          await channel.send({ embeds: [embed] });
          success++;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    interaction.editReply(`✅ Broadcast to ${success} servers`);
  }
};

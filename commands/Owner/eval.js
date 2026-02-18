const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate code (Owner Only)')
    .addStringOption(option => 
      option.setName('code')
        .setDescription('Code to eval')
        .setRequired(true)),
  
  async execute(interaction) {
    const code = interaction.options.getString('code');
    
    try {
      let evaled = eval(code);
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Eval')
        .setColor(config.colors.success)
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code.slice(0, 1000)}\n\`\`\`` },
          { name: 'Output', value: `\`\`\`js\n${evaled.slice(0, 1000)}\n\`\`\`` }
        );
      
      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({ 
        content: `❌ \`\`\`xl\n${err}\n\`\`\``, 
        ephemeral: true 
      });
    }
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

const responses = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.',
  'Very doubtful.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Magic 8ball')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🎱 8-Ball')
      .setColor(config.colors.primary)
      .addFields(
        { name: 'Q', value: question },
        { name: 'A', value: response }
      );
    
    interaction.reply({ embeds: [embed] });
  }
};

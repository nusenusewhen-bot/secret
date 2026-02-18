const config = require('../config');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    
    if (!command || !command.messageRun) return;
    
    try {
      command.messageRun(message, args, client);
    } catch (error) {
      console.error(error);
    }
  }
};

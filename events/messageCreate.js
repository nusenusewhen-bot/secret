const config = require('../config');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot) return;
    if (!message.guild) return;
    
    // Check for prefix
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    
    // Parse command
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!commandName) return;
    
    // Find command
    const command = client.commands.get(commandName) || 
                   client.commands.get(client.aliases.get(commandName));
    
    if (!command) return;
    
    // Check if command has messageRun function
    if (!command.messageRun) {
      return message.reply('❌ This command only works with slash commands (/)');
    }
    
    // Owner check
    if (command.ownerOnly && message.author.id !== config.ownerId) {
      return message.reply('👑 Owner only command!');
    }
    
    // Admin check
    if (command.adminOnly && message.author.id !== config.ownerId && !message.member.permissions.has('Administrator')) {
      return message.reply('⚡ Admin only!');
    }
    
    // Execute
    try {
      command.messageRun(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('❌ Error executing command!');
    }
  }
};

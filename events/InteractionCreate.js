const config = require('../config');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      
      // Owner Check
      if (command.ownerOnly && interaction.user.id !== config.ownerId) {
        return interaction.reply({ 
          content: '👑 Owner only command!', 
          ephemeral: true 
        });
      }
      
      // Admin Check
      if (command.adminOnly && interaction.user.id !== config.ownerId && !interaction.member?.permissions.has('Administrator')) {
        return interaction.reply({ 
          content: '⚡ Admin only!', 
          ephemeral: true 
        });
      }
      
      // Cooldown Check
      if (command.cooldown) {
        const cooldowns = client.cooldowns;
        if (!cooldowns.has(command.data.name)) {
          cooldowns.set(command.data.name, new Map());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown) * 1000;
        
        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return interaction.reply({ 
              content: `⏳ Wait ${timeLeft.toFixed(1)}s`, 
              ephemeral: true 
            });
          }
        }
        
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      }
      
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({ 
          content: '❌ Error executing command!', 
          ephemeral: true 
        });
      }
    }
    
    // Button Handler
    if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (button) {
        try {
          await button.execute(interaction, client);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
};

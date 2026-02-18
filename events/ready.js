const config = require('../config');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
    
    client.user.setPresence({
      activities: [{ 
        name: `${config.prefix}help | 200+ Commands`, 
        type: 3 
      }],
      status: 'online'
    });
  }
};

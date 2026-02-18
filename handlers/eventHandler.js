const fs = require('fs');
const path = require('path');

function load(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  
  if (!fs.existsSync(eventsPath)) {
    console.log('⚠️ Events folder not found, creating...');
    fs.mkdirSync(eventsPath, { recursive: true });
    return;
  }
  
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } catch (error) {
      console.error(`Error loading event ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Loaded ${eventFiles.length} events`);
}

module.exports = { load };

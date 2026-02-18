const fs = require('fs');
const path = require('path');

function load(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.log('⚠️ Commands folder not found, creating...');
    fs.mkdirSync(commandsPath, { recursive: true });
    return;
  }
  
  const categories = fs.readdirSync(commandsPath);
  let totalCommands = 0;
  
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          command.category = category;
          client.commands.set(command.data.name, command);
          totalCommands++;
          
          if (command.aliases) {
            command.aliases.forEach(alias => {
              client.aliases.set(alias, command.data.name);
            });
          }
        }
      } catch (error) {
        console.error(`Error loading command ${file}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Loaded ${totalCommands} commands`);
}

module.exports = { load };

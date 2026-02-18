const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const config = require('../config');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath);
  
  let totalCommands = 0;
  
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
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
    }
  }
  
  console.log(`✅ Loaded ${totalCommands} commands across ${categories.length} categories`);
}

function reloadCommands(client) {
  client.commands.clear();
  client.aliases.clear();
  loadCommands(client);
}

module.exports = { load, reload: reloadCommands };
module.exports.load = loadCommands;

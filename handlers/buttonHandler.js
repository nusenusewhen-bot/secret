const fs = require('fs');
const path = require('path');

function load(client) {
  const buttonsPath = path.join(__dirname, '..', 'buttons');
  
  if (!fs.existsSync(buttonsPath)) {
    fs.mkdirSync(buttonsPath, { recursive: true });
    console.log('📁 Created buttons folder');
    return;
  }
  
  const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
  
  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    try {
      const button = require(filePath);
      
      if ('data' in button && 'execute' in button) {
        client.buttons.set(button.data.name, button);
      }
    } catch (error) {
      console.error(`Error loading button ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Loaded ${client.buttons.size} buttons`);
}

module.exports = { load };

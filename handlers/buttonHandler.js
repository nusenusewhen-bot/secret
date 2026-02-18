const fs = require('fs');
const path = require('path');

function loadButtons(client) {
  const buttonsPath = path.join(__dirname, '..', 'buttons');
  
  // Create buttons folder if it doesn't exist
  if (!fs.existsSync(buttonsPath)) {
    fs.mkdirSync(buttonsPath, { recursive: true });
    console.log('📁 Created buttons folder');
    return;
  }
  
  const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
  
  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    
    if ('data' in button && 'execute' in button) {
      client.buttons.set(button.data.name, button);
    } else {
      console.log(`[WARNING] The button at ${filePath} is missing "data" or "execute" property.`);
    }
  }
  
  console.log(`✅ Loaded ${client.buttons.size} buttons`);
}

module.exports = { load: loadButtons };

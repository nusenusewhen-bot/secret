const fs = require('fs');
const path = require('path');

const storageDir = path.join(__dirname, '..', 'storage');
const dataPath = path.join(storageDir, 'data.json');

// Ensure storage directory and file exist
function ensureDataFile() {
  try {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({ users: {}, guilds: {} }, null, 2));
    }
  } catch (error) {
    console.error('Error creating data file:', error);
  }
}

// Get user data (creates if doesn't exist)
function getUserData(userId) {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (!data.users) data.users = {};
    
    if (!data.users[userId]) {
      data.users[userId] = {
        balance: 1000,
        bank: 0,
        inventory: [],
        xp: 0,
        level: 1,
        married: null,
        rep: 0,
        daily: 0,
        work: 0,
        crime: 0,
        rob: 0,
        beg: 0,
        fish: 0,
        hunt: 0,
        mine: 0,
        chop: 0,
        createdAt: Date.now()
      };
      saveData(data);
    }
    return data.users[userId];
  } catch (error) {
    console.error('Error reading user data:', error);
    return {
      balance: 1000,
      bank: 0,
      inventory: [],
      xp: 0,
      level: 1,
      daily: 0
    };
  }
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Update specific user data
function updateUserData(userId, updateObj) {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data.users[userId]) {
    data.users[userId] = getUserData(userId);
  }
  Object.assign(data.users[userId], updateObj);
  saveData(data);
  return data.users[userId];
}

// Get guild data
function getGuildData(guildId) {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data.guilds) data.guilds = {};
  
  if (!data.guilds[guildId]) {
    data.guilds[guildId] = {
      prefix: '!',
      welcomeChannel: null,
      logChannel: null,
      autoRole: null,
      disabledCommands: [],
      customCommands: {}
    };
    saveData(data);
  }
  return data.guilds[guildId];
}

// Format large numbers (1K, 1M, 1B)
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Format currency with $ sign
function formatMoney(amount) {
  return '$' + parseInt(amount).toLocaleString();
}

// Random integer between min and max (inclusive)
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Sleep/delay function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate random ID
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Time since timestamp
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

// Paginate array
function paginate(array, pageSize, pageNumber) {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

// Progress bar
function progressBar(value, maxValue, size = 20) {
  const percentage = value / maxValue;
  const progress = Math.round((size * percentage));
  const emptyProgress = size - progress;
  
  const progressText = "█".repeat(progress);
  const emptyProgressText = "░".repeat(emptyProgress);
  const percentageText = Math.round(percentage * 100) + "%";
  
  return `[${progressText}${emptyProgressText}] ${percentageText}`;
}

// Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if user is owner
function isOwner(userId) {
  return userId === process.env.OWNER_ID;
}

// Cooldown check helper
function checkCooldown(userId, commandName, cooldowns, cooldownTime) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Map());
  }
  
  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = cooldownTime * 1000;
  
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, timeLeft: timeLeft.toFixed(1) };
    }
  }
  
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return { onCooldown: false, timeLeft: 0 };
}

module.exports = {
  ensureDataFile,
  getUserData,
  saveData,
  updateUserData,
  getGuildData,
  formatNumber,
  formatMoney,
  randomRange,
  shuffleArray,
  sleep,
  generateId,
  timeSince,
  paginate,
  progressBar,
  capitalize,
  isOwner,
  checkCooldown
};

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'storage', 'data.json');

function ensureDataFile() {
  const dir = path.join(__dirname, '..', 'storage');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ users: {}, guilds: {} }, null, 2));
  }
}

function getUserData(userId) {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data.users[userId]) {
    data.users[userId] = {
      balance: 1000,
      bank: 0,
      xp: 0,
      level: 1,
      daily: 0
    };
    saveData(data);
  }
  return data.users[userId];
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

module.exports = {
  getUserData,
  saveData,
  formatNumber,
  ensureDataFile
};

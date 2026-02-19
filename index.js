require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

let browser = null;
let page = null;

async function startBrowser() {
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--window-size=1280,800'
      ]
    });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
    await page.goto('https://web.snapchat.com', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('At login page. You need to log in manually once via browser devtools or save cookies.');
    // In real use: either manual login + cookie export, or automate login with creds (very ban-heavy)
    // For now it just waits — you can connect remotely or use railway logs to see qr/login
  } catch (e) {
    console.error('Browser launch failed:', e);
  }
}

app.post('/run', async (req, res) => {
  const { command } = req.body;

  if (!page) return res.status(500).json({ error: 'Browser not ready' });

  try {
    if (command === '.snipe') {
      // very rough — find recent chats (DOM is unstable)
      await page.evaluate(() => {
        const chats = Array.from(document.querySelectorAll('[data-testid*="chat-row"]'));
        const recent = chats.filter(el => {
          const time = el.querySelector('[data-testid*="timestamp"]')?.textContent;
          return time && (time.includes('m') || time.includes('h') && !time.includes('d'));
        });
        console.log('Recent incoming (approx last 2h):', recent.map(el => el.textContent));
      });
      res.json({ status: 'sniped', note: 'check railway logs for output' });
    } 
    else if (command.startsWith('.spam')) {
      const [, ...rest] = command.split(' ');
      const times = parseInt(rest.pop()) || 3;
      const msg = rest.join(' ');

      for (let i = 0; i < times; i++) {
        await page.type('[data-testid="chat-input"]', msg + '\n');
        await page.waitForTimeout(1200); // slow to avoid instant flag
      }
      res.json({ status: 'spammed', count: times });
    } 
    else {
      res.status(400).json({ error: 'unknown command' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

(async () => {
  await startBrowser();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();

import fs from 'fs/promises';
import { launch } from 'puppeteer';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.includes('tiktok.com')) {
    return res.status(400).json({ success: false, error: 'Thiếu hoặc sai link TikTok.' });
  }

  try {
    const browser = await launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Cookie
    const cookiesJson = await fs.readFile('cookies.json', 'utf-8');
    const cookies = JSON.parse(cookiesJson);
    await page.setCookie(...cookies);

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36'
    );

    // 🟢 Quan trọng: đi tới URL TikTok trước khi extract video
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    // Đợi video render
    const videoSrc = await page.evaluate(() => {
      return new Promise((resolve) => {
        const check = () => {
          const video = document.querySelector('video');
          if (video && video.src) resolve(video.src);
          else setTimeout(check, 1000);
        };
        check();
      });
    });

    await browser.close();

    if (videoSrc) {
      return res.status(200).json({ success: true, download_url: videoSrc });
    } else {
      return res.status(404).json({ success: false, error: 'Không tìm thấy video.' });
    }
  } catch (err) {
    console.error('Lỗi Puppeteer:', err);
    return res.status(500).json({ success: false, error: 'Lỗi xử lý video.', detail: err.message });
  }
}


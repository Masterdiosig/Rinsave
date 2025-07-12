
import fs from 'fs/promises';
import { launch } from 'puppeteer';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.includes('tiktok.com')) {
    return res.status(400).json({ success: false, error: 'Thiếu hoặc sai link TikTok.' });
  }

  try {
    const browser = await launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Đọc cookies từ file
    const cookiesJson = await fs.readFile('cookies.json', 'utf-8');
    const cookies = JSON.parse(cookiesJson);
    await page.setCookie(...cookies);

    // Giả lập trình duyệt thật
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36'
    );

    // Chặn tải font, ảnh, giúp tăng tốc
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'font', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 🚀 Truy cập trang TikTok
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // ⏳ Đợi thẻ video hiển thị
    await page.waitForSelector('video', { timeout: 15000 });

    // 📥 Lấy link video
    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video?.src || null;
    });

    await browser.close();

    if (videoSrc) {
      return res.status(200).json({ success: true, download_url: videoSrc });
    } else {
      return res.status(404).json({ success: false, error: 'Không tìm thấy video.' });
    }

  } catch (err) {
    console.error('Lỗi Puppeteer:', err.message);
    return res.status(500).json({ success: false, error: 'Lỗi xử lý video.', detail: err.message });
  }
}

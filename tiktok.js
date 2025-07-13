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

    // Cookie
    const cookiesJson = await fs.readFile('cookies.json', 'utf-8');
    const cookies = JSON.parse(cookiesJson);
    await page.setCookie(...cookies);

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36'
    );

    // Bắt URL video/mp4
    let videoUrl = null;
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      request.continue();
    });

    page.on('response', async (response) => {
      const ct = response.headers()['content-type'];
      const respUrl = response.url();
      if (ct?.includes('video/mp4') && respUrl.includes('/video/tos/')) {
        videoUrl = respUrl;
      }
    });

    // Mở trang video
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    // Chờ response tải về
    await page.waitForTimeout(5000);
    await browser.close();

    if (videoUrl) {
      return res.status(200).json({ success: true, download_url: videoUrl });
    } else {
      return res.status(404).json({ success: false, error: 'Không lấy được video mp4.' });
    }
  } catch (err) {
    console.error('Lỗi xử lý video:', err);
    return res.status(500).json({ success: false, error: 'Lỗi xử lý video.', detail: err.message });
  }
}





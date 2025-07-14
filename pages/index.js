import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tự dán clipboard nếu là link TikTok
    navigator.clipboard.readText().then(text => {
      if (text.includes('tiktok.com')) {
        setUrl(text);
      }
    });
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const res = await fetch(`https://tiktok-api.up.railway.app/api/tiktok?url=${encodeURIComponent(url)}`);


      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.download_url);
      } else {
        setError(data.error || 'Không tải được video');
      }
    } catch (err) {
      setError('Lỗi kết nối API');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎬 Tải Video TikTok Không Logo</h1>

      <input
        className={styles.input}
        type="text"
        placeholder="Dán link TikTok tại đây..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button className={styles.button} onClick={handleDownload} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Tải video'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {videoUrl && (
        <div className={styles.result}>
          <video controls src={videoUrl}></video>
          <a href={videoUrl} download className={styles.download}>⬇ Tải xuống</a>
        </div>
      )}
    </div>
  );
}

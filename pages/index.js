import { useEffect, useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.clipboard?.readText().then(text => {
      if (text.includes('tiktok.com')) setUrl(text);
    }).catch(() => {});
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const res = await fetch(`/api/tiktok?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success) setVideoUrl(data.download_url);
      else setError(data.error || 'Không tải được video');
    } catch {
      setError('Lỗi kết nối API');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h1>🎬 Tải Video TikTok Không Logo</h1>
      <input
        type="text"
        placeholder="Dán link TikTok..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }}
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          background: '#000',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Đang xử lý...' : 'Tải video'}
      </button>

      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

      {videoUrl && (
        <div style={{ marginTop: 20 }}>
          <video controls style={{ width: '100%' }} src={videoUrl}></video>
          <a href={videoUrl} download style={{ display: 'block', marginTop: 10 }}>
            ⬇ Tải xuống
          </a>
        </div>
      )}
    </div>
  );
}

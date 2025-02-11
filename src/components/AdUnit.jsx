import React, { useEffect } from 'react';

function AdUnit() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="ad-container">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2228923604379440"
        data-ad-slot="6754226592"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdUnit; 
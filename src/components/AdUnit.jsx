import React, { useEffect } from 'react';

const AdUnit = ({ dataAdSlot }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-2228923604379440"
      data-ad-slot={dataAdSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export { AdUnit }; 
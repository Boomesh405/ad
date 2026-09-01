import { useState, useEffect, useCallback } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

export default function ImageGallery({ images = [], title = "Property" }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [errors, setErrors] = useState({});

  const photos = images.length > 0 ? images : [{ s3Key: FALLBACK }];
  const current = photos[active];

  const next = useCallback(() => setActive((i) => (i + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  useEffect(() => {
    if (lightbox) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  function getSrc(m) {
    if (errors[m.mediaId || m.s3Key]) return FALLBACK;
    return m.s3Key || FALLBACK;
  }

  return (
    <>
      {/* Main gallery */}
      <div className="gallery">
        <div className="gallery-main" onClick={() => setLightbox(true)}>
          <img src={getSrc(current)} alt={current.altText || title} className="gallery-cover" loading="lazy"
            onError={() => setErrors((e) => ({ ...e, [current.mediaId || current.s3Key]: true }))} />
          <div className="gallery-count">📸 {active + 1} / {photos.length}</div>
        </div>
        <div className="gallery-thumbs">
          {photos.slice(0, 4).map((m, i) => (
            <div key={i} className={`gallery-thumb ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>
              <img src={getSrc(m)} alt="" loading="lazy"
                onError={() => setErrors((e) => ({ ...e, [m.mediaId || m.s3Key]: true }))} />
              {i === 3 && photos.length > 4 && (
                <div className="thumb-overlay">+{photos.length - 4}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Close">✕</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <img src={getSrc(current)} alt={current.altText || title} className="lightbox-img"
            onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          <div className="lightbox-counter">{active + 1} / {photos.length}</div>
        </div>
      )}
    </>
  );
}

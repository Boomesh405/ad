import { useEffect } from "react";

export default function Drawer({ open, onClose, title, children, side = "right" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && open) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className={`drawer-panel drawer-${side}`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}

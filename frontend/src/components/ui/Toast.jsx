import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastCtx = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, msg, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const success = useCallback((msg) => add(msg, "success"), [add]);
  const error = useCallback((msg) => add(msg, "error", 6000), [add]);
  const info = useCallback((msg) => add(msg, "info"), [add]);
  const warn = useCallback((msg) => add(msg, "warn"), [add]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ add, success, error, info, warn, remove }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const el = document.querySelector(`[data-toast-id="${toast.id}"]`);
    if (el) el.classList.add("toast-enter");
  }, [toast.id]);

  const icons = { success: "✓", error: "✕", warn: "⚠", info: "ℹ" };
  return (
    <div className={`toast toast-${toast.type}`} data-toast-id={toast.id} onClick={onRemove}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-msg">{toast.msg}</span>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); onRemove(); }}>✕</button>
    </div>
  );
}

export const useToast = () => useContext(ToastCtx);

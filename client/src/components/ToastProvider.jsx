import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

/**
 * Fournit un système de notifications transitoires (succès / erreur) pour
 * donner un retour visuel après chaque action (créer, modifier, supprimer...).
 * Aucune dépendance externe : juste du state React + une région ARIA live
 * pour que les lecteurs d'écran annoncent aussi les messages.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, variant, duration) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const toast = useRef({
    success: (message) => push(message, 'success', 4000),
    error: (message) => push(message, 'error', 6000),
  }).current;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className="toast" data-variant={item.variant}>
            <p className="toast-message">{item.message}</p>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(item.id)}
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur d'un <ToastProvider>");
  }
  return context;
}

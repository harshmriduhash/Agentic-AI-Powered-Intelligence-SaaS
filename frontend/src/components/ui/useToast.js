import { createContext, useContext } from 'react';

const ToastContext = createContext();

export { ToastContext };

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if ToastProvider is not used
    return {
      toast: ({ title, description }) => {
        console.log('Toast:', title, description);
      },
    };
  }
  return context;
}

// Toast function for direct use
export function toast(options) {
  // This will be replaced by the actual implementation when ToastProvider is used
  console.log('Toast:', options);
}

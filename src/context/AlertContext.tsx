import React, { createContext, useContext, useState } from 'react';

type AlertType = 'info' | 'success' | 'error';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<{ message: string; type: AlertType } | null>(null);

  const showAlert = (message: string, type: AlertType = 'info') => {
    setAlertState({ message, type });
  };

  const closeAlert = () => {
    setAlertState(null);
  };

  const getIcon = (type: AlertType) => {
    if (type === 'error') return '❌';
    if (type === 'success') return '✅';
    return 'ℹ️';
  };

  const getBgColor = (type: AlertType) => {
    if (type === 'error') return 'rgba(239, 68, 68, 0.1)';
    if (type === 'success') return 'rgba(34, 197, 94, 0.1)';
    return 'rgba(59, 130, 246, 0.1)';
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content text-center" style={{ maxWidth: '400px' }}>
            <div className="flex justify-center mb-4">
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: getBgColor(alertState.type), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '30px' }}>{getIcon(alertState.type)}</span>
              </div>
            </div>
            <h2 className="text-xl mb-2" style={{ marginTop: 0 }}>Notice</h2>
            <p className="mb-6 text-muted">{alertState.message}</p>
            <button className="btn btn-primary w-full" onClick={closeAlert}>
              OK
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

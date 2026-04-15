import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  isConnected: boolean;
  credentials: any;
  tableMappings: Record<string, string>;
  sshPaths: Record<string, string>;
  setConnected: (status: boolean, creds?: any) => void;
  updateTableMapping: (original: string, newName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [tableMappings, setTableMappings] = useState<Record<string, string>>({});
  const [sshPaths, setSshPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedCreds = localStorage.getItem("game_panel_creds");
    const storedMappings = localStorage.getItem("mt2_table_mappings");
    const storedPaths = localStorage.getItem("mt2_ssh_paths");
    if (storedCreds) {
      setCredentials(JSON.parse(storedCreds));
      setIsConnected(true);
    }
    if (storedMappings) {
      setTableMappings(JSON.parse(storedMappings));
    }
    if (storedPaths) {
      setSshPaths(JSON.parse(storedPaths));
    }
  }, []);

  const setConnected = (status: boolean, creds?: any) => {
    setIsConnected(status);
    if (status && creds) {
      setCredentials(creds);
      localStorage.setItem("game_panel_creds", JSON.stringify(creds));
    } else if (!status) {
      setCredentials(null);
      localStorage.removeItem("game_panel_creds");
    }
  };

  const updateTableMapping = (original: string, newName: string) => {
    setTableMappings(prev => {
      const updated = { ...prev, [original]: newName };
      localStorage.setItem("mt2_table_mappings", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ isConnected, credentials, tableMappings, sshPaths, setConnected, updateTableMapping }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

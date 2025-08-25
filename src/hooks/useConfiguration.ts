import { useState, useEffect } from 'react';

interface ConfigurationStatus {
  supabase: boolean;
  api: boolean;
  database: boolean;
  isConfigured: boolean;
}

export const useConfiguration = () => {
  const [configStatus, setConfigStatus] = useState<ConfigurationStatus>({
    supabase: false,
    api: false,
    database: false,
    isConfigured: false
  });

  const checkConfiguration = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;

    const newStatus: ConfigurationStatus = {
      supabase: !!(supabaseUrl && supabaseKey),
      api: !!apiUrl,
      database: !!(supabaseUrl && supabaseKey), // Asumimos que si Supabase está configurado, la DB también
      isConfigured: !!(supabaseUrl && supabaseKey && apiUrl)
    };

    setConfigStatus(newStatus);
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const retryConfiguration = () => {
    checkConfiguration();
  };

  return {
    configStatus,
    retryConfiguration
  };
}; 
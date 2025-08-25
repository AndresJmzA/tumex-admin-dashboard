import { useEffect } from 'react';
import { supabase } from '@/supabaseClient';

type OrderChangeHandler = (payload: {
  id: string;
  status?: string;
  assigned_technicians?: Array<{ id: string; name: string; role: string }>;
  updated_at?: string;
}) => void;

export function useOrderEvents(onChange: OrderChangeHandler) {
  useEffect(() => {
    if (!onChange) return;

    const channel = supabase
      .channel('orders-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Orders' }, (payload: any) => {
        const newRow = payload.new || {};
        onChange({
          id: newRow.id,
          status: newRow.status,
          assigned_technicians: newRow.assigned_technicians,
          updated_at: newRow.updated_at,
        });
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (_) {
        // noop
      }
    };
  }, [onChange]);
}



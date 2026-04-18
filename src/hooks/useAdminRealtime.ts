import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useAdminRealtime<T = any>(
  tableName: string, 
  fetchData: () => Promise<{ data: T[] | null; error: Error | null }>,
  event: TableEvent = '*'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchRef = React.useRef(fetchData);
  React.useEffect(() => {
    fetchRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    let channel: RealtimeChannel;
    
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const res = await fetchRef.current();
        if (res.data) setData(res.data);
      } catch (err) {
        console.error(`Error loading initial data for ${tableName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Setup Realtime Subscription
    channel = supabase
      .channel(`admin_realtime_${tableName}`)
      .on(
        'postgres_changes',
        { event: event, schema: 'public', table: tableName },
        async (payload) => {
          console.log(`Realtime Update (${tableName}):`, payload);
          try {
            const res = await fetchRef.current();
            if (res.data) setData(res.data);
          } catch (err) {
            console.error(`Error handling realtime update for ${tableName}:`, err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, event]);

  return { data, loading, setData };
}

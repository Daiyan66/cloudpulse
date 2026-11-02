import { useState, useEffect, useCallback } from 'react';
import { monitorService } from '../services/api';
import toast from 'react-hot-toast';

export function useMonitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchMonitors = useCallback(async () => {
    try {
      setError(null);
      const res = await monitorService.getAll();
      setMonitors(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch monitors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  const createMonitor = async (data) => {
    const res = await monitorService.create(data);
    setMonitors((prev) => [res.data.data, ...prev]);
    toast.success(`Monitor "${res.data.data.name}" created!`);
    return res.data.data;
  };

  const deleteMonitor = async (id, name) => {
    await monitorService.remove(id);
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    toast.success(`"${name}" deleted.`);
  };

  const toggleMonitor = async (id, isActive) => {
    const res = await monitorService.update(id, { isActive });
    setMonitors((prev) => prev.map((m) => m.id === id ? res.data.data : m));
  };

  return { monitors, loading, error, refetch: fetchMonitors, createMonitor, deleteMonitor, toggleMonitor };
}

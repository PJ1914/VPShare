import { useState, useEffect, useCallback } from 'react';
import { hackathonService } from '../services/hackathon.service';

export const useHackathon = (hackathonId) => {
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHackathon = useCallback(async () => {
        if (!hackathonId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await hackathonService.getHackathonById(hackathonId);
            setHackathon(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load hackathon');
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    useEffect(() => {
        loadHackathon();
    }, [loadHackathon]);

    const refresh = () => {
        loadHackathon();
    };

    return { hackathon, loading, error, refresh };
};

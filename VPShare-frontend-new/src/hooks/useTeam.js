import { useState, useEffect, useCallback } from 'react';
import { hackathonService } from '../services/hackathon.service';

export const useTeam = (hackathonId) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadTeam = useCallback(async () => {
        if (!hackathonId) return;
        try {
            const registration = await hackathonService.getMyRegistration(hackathonId);
            if (registration.teamId) {
                const teamData = await hackathonService.getTeamDetails(
                    hackathonId,
                    registration.teamId
                );
                setTeam(teamData);
            }
        } catch (err) {
            // It's okay if user has no team or registration yet
            console.log('No team found or error loading team:', err);
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    return { team, loading, refresh: loadTeam };
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';

const HackathonCard = ({ hackathon }) => {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'ongoing': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-purple-100 text-purple-700';
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200 dark:border-gray-800" onClick={() => navigate(`/hackathons/${hackathon.id}`)}>
            <div className="h-40 bg-gray-200 w-full object-cover rounded-t-xl overflow-hidden relative">
                <img
                    src={hackathon.bannerImage || hackathon.coverImage || 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&q=80'}
                    alt={hackathon.title}
                    className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(hackathon.status)}`}>
                    {hackathon.status}
                </span>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold line-clamp-1">{hackathon.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{hackathon.tagline}</p>

                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(hackathon.hackathonStartDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{hackathon.participantType === 'team' ? 'Team Event' : 'Individual'}</span>
                    </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
};

export default HackathonCard;

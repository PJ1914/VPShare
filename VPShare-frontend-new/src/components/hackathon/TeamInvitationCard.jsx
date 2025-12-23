import React from 'react';
import { Check, X, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const TeamInvitationCard = ({ invitation, onAccept, onReject }) => {
    return (
        <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            Invited to join: <span className="text-purple-600">{invitation.teamName}</span>
                        </h4>
                        <p className="text-sm text-gray-500">
                            Role: {invitation.role || 'Member'} • From: {invitation.senderName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={onReject}
                    >
                        <X size={18} />
                    </Button>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={onAccept}
                    >
                        <Check size={18} className="mr-1" />
                        Accept
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamInvitationCard;

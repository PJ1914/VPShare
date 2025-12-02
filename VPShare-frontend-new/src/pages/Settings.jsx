import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Moon, Sun, Bell, Shield, Key,
    LogOut, Trash2, Save, Mail, Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const SettingsSection = ({ title, icon: Icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
    >
        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 space-y-6">
                {children}
            </div>
        </Card>
    </motion.div>
);

const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

const Settings = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);

    // Mock States
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your account preferences and settings
                    </p>
                </div>

                {/* Profile Settings */}
                <SettingsSection title="Profile Information" icon={User}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                defaultValue={user?.displayName || ''}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} isLoading={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </SettingsSection>



                {/* Notifications */}
                <SettingsSection title="Notifications" icon={Bell}>
                    <div className="space-y-6">
                        <Toggle
                            label="Email Notifications"
                            description="Receive updates about your course progress"
                            checked={notifications.email}
                            onChange={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                        />
                        <Toggle
                            label="Push Notifications"
                            description="Get instant alerts on your device"
                            checked={notifications.push}
                            onChange={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                        />
                        <Toggle
                            label="Marketing Emails"
                            description="Receive news about new courses and features"
                            checked={notifications.marketing}
                            onChange={() => setNotifications(prev => ({ ...prev, marketing: !prev.marketing }))}
                        />
                    </div>
                </SettingsSection>

                {/* Security */}
                <SettingsSection title="Security" icon={Shield}>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <Key className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Two-Factor Authentication
                        </Button>
                    </div>
                </SettingsSection>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Danger Zone</h2>
                    </div>
                    <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-900/30 overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                <div>
                                    <h3 className="text-sm font-medium text-red-900 dark:text-red-300">Sign Out</h3>
                                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                                        Sign out of your account on this device
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={logout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                <div>
                                    <h3 className="text-sm font-medium text-red-900 dark:text-red-300">Delete Account</h3>
                                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white border-none shadow-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;

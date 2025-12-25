import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, Link as LinkIcon, Bookmark, List } from 'lucide-react';
import QAModule from './QAModule';
import SmartNotes from './SmartNotes';
import BookmarksModule from './BookmarksModule';
import ChaptersModule from './ChaptersModule';

const ClassroomSidebar = ({ classId, liveClassHook, classData, className = '', isAdmin = false, getCurrentTime, onJumpToTime }) => {
    const [activeTab, setActiveTab] = useState('qa'); // qa, notes, resources, bookmarks, chapters

    return (
        <div className={`flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl ${className}`}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-none z-10">
                {[
                    { id: 'qa', label: 'Q&A', icon: MessageCircle },
                    { id: 'notes', label: 'Notes', icon: FileText },
                    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
                    { id: 'chapters', label: 'Chapters', icon: List },
                    { id: 'resources', label: 'Resources', icon: LinkIcon }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-4 font-medium transition-all flex items-center justify-center gap-2 text-sm relative ${activeTab === tab.id
                            ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900">
                {activeTab === 'qa' && (
                    <QAModule classId={classId} useLiveClassHook={liveClassHook} />
                )}
                {activeTab === 'notes' && (
                    <SmartNotes classId={classId} useLiveClassHook={liveClassHook} />
                )}
                {activeTab === 'bookmarks' && (
                    <BookmarksModule
                        classId={classId}
                        useLiveClassHook={liveClassHook}
                        getCurrentTime={getCurrentTime}
                        onJumpToTime={onJumpToTime}
                    />
                )}
                {activeTab === 'chapters' && (
                    <ChaptersModule
                        classId={classId}
                        useLiveClassHook={liveClassHook}
                        isAdmin={isAdmin}
                        onJumpToTime={onJumpToTime}
                    />
                )}
                {activeTab === 'resources' && (
                    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                        <div className="space-y-4">
                            {classData?.resources && classData.resources.length > 0 ? (
                                classData.resources.map((resource, index) => (
                                    <a
                                        key={index}
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group shadow-sm"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {new URL(resource).hostname}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {resource}
                                            </p>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LinkIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No resources attached</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomSidebar;

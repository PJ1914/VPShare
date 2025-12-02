import React from 'react';
import { Outlet } from 'react-router-dom';
import CourseSidebar from '../components/layout/CourseSidebar';

const CoursesLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            <CourseSidebar />
            <main className="flex-1 min-w-0">
                <Outlet />
            </main>
        </div>
    );
};

export default CoursesLayout;

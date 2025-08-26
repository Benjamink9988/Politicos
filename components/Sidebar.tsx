
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavIcon: React.FC<{ path: string; }> = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const Sidebar: React.FC = () => {
    const navLinkClasses = 'flex items-center px-4 py-3 text-gray-200 hover:bg-blue-900 hover:text-white transition-colors duration-200';
    const activeNavLinkClasses = 'bg-blue-900 text-white';

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses;
    
    return (
        <aside className="w-16 md:w-64 bg-primary text-white flex flex-col">
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-blue-800">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="hidden md:inline ml-3 text-xl font-bold">폴리티코스</span>
            </div>
            <nav className="flex-1 mt-6">
                <NavLink to="/dashboard" className={getNavLinkClass}>
                    <NavIcon path="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-8-12V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6" />
                    <span className="hidden md:inline ml-4">대시보드</span>
                </NavLink>
                <NavLink to="/audit" className={getNavLinkClass}>
                    <NavIcon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <span className="hidden md:inline ml-4">국정감사</span>
                </NavLink>
                <NavLink to="/analysis" className={getNavLinkClass}>
                    <NavIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <span className="hidden md:inline ml-4">인물 분석</span>
                </NavLink>
                <NavLink to="/constituency" className={getNavLinkClass}>
                    <NavIcon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    <span className="hidden md:inline ml-4">지역구 관리</span>
                </NavLink>
                <NavLink to="/legislative-support" className={getNavLinkClass}>
                    <NavIcon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    <span className="hidden md:inline ml-4">입법 활동 지원</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;

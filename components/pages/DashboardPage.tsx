
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

const FeatureCard: React.FC<{ to: string; title: string; description: string; icon: React.ReactNode }> = ({ to, title, description, icon }) => (
    <Link to={to} className="block hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <Card className="h-full">
            <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-primary p-3 rounded-full">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                    <p className="text-text-secondary mt-1">{description}</p>
                </div>
            </div>
        </Card>
    </Link>
);


const DashboardPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-gray-800">AI 보좌관 대시보드</h1>
                <p className="text-lg text-text-secondary mt-2">의정활동의 품격을 높이는 AI 파트너, 폴리티코스에 오신 것을 환영합니다.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FeatureCard
                    to="/audit"
                    title="국정감사 시뮬레이션"
                    description="국정감사를 위한 전략적인 질의응답을 생성합니다."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                <FeatureCard
                    to="/analysis"
                    title="인물 분석"
                    description="주요 인물에 대한 심층 프로필을 신속하게 파악합니다."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />
                <FeatureCard
                    to="/constituency"
                    title="지역구 관리"
                    description="민원을 처리하고 연설문을 효율적으로 작성합니다."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <FeatureCard
                    to="/legislative-support"
                    title="입법 활동 지원"
                    description="법안 초안 작성부터 해외사례 리서치까지 지원합니다."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                />
            </div>
             <Card>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">폴리티코스 사용 방법</h2>
                <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                    <li>사이드바 또는 위 카드 메뉴에서 원하시는 기능을 선택하세요.</li>
                    <li>피감기관명, 인물명 등 필요한 정보를 입력하세요.</li>
                    <li>'생성' 버튼을 눌러 AI가 콘텐츠를 분석하고 생성하도록 하세요.</li>
                    <li>AI가 생성한 결과물을 검토하여 의정활동에 활용하세요.</li>
                </ol>
            </Card>
        </div>
    );
};

export default DashboardPage;

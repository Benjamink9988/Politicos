
import React, { useState } from 'react';
import { analyzePerson } from '../../services/geminiService';
import type { PersonProfile } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ActionButtons from '../common/ActionButtons';

const PersonAnalysisPage: React.FC = () => {
    const [name, setName] = useState('');
    const [affiliation, setAffiliation] = useState('');
    const [profile, setProfile] = useState<PersonProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError('증인 또는 참고인의 성명을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        setProfile(null);
        try {
            const result = await analyzePerson(name, affiliation);
            setProfile(result);
        } catch (err) {
            setError('프로필 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const formatProfileText = () => {
        if (!profile) return '';
        const affiliationText = affiliation ? ` (${affiliation})` : '';
        let text = `
인물 기반 감사 의제 분석: ${name}${affiliationText}
======================================

■ 중점 감사 의제
${profile.keyAuditTopics.map(topic => `- ${topic}`).join('\n')}
        `.trim();

        if (profile.sources && profile.sources.length > 0) {
            text += `\n\n■ 정보 출처\n${profile.sources.map(source => `- ${source}`).join('\n')}`;
        }
    
        return text;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">인물 기반 감사 의제 분석</h1>
                <p className="text-md text-text-secondary mt-1">핵심 인물을 대상으로 한 국정감사 질의 의제를 도출합니다.</p>
            </header>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="personName" className="block text-sm font-medium text-gray-700">증인/참고인 성명</label>
                            <input
                                type="text"
                                id="personName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="예: 홍길동"
                            />
                        </div>
                        <div>
                            <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">소속 (동명이인 방지)</label>
                            <input
                                type="text"
                                id="affiliation"
                                value={affiliation}
                                onChange={(e) => setAffiliation(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="예: OO전자 부사장"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                    >
                        {loading ? '분석 중...' : '감사 의제 분석'}
                    </button>
                </form>
            </Card>

            {loading && <LoadingSpinner />}
            {error && <Card className="bg-red-100 text-red-700">{error}</Card>}

            {profile && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">{name}{affiliation ? ` (${affiliation})` : ''} 분석 결과</h2>
                        <ActionButtons
                            content={formatProfileText}
                            fileName={() => `인물분석_${name.replace(/\s/g, '_')}`}
                            shareDetails={() => ({
                                title: `인물 프로필 분석: ${name}`,
                                text: formatProfileText()
                            })}
                        />
                    </div>
                    <div className="space-y-4 prose max-w-none">
                        <div>
                            <h3 className="font-bold text-lg text-primary">중점 감사 의제</h3>
                             <ul className="list-disc pl-5 space-y-1">
                                {profile.keyAuditTopics.map((topic, index) => <li key={index}>{topic}</li>)}
                            </ul>
                        </div>
                        {profile.sources && profile.sources.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg text-primary">정보 출처</h3>
                                <p className="text-sm text-red-600 mb-2">※ AI가 제공한 출처이므로, 정확성 확인을 위해 직접 방문하여 검증하시는 것을 권장합니다.</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {profile.sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                {source}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PersonAnalysisPage;
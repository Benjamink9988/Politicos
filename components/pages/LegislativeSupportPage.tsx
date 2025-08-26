
import React, { useState } from 'react';
import { draftBill, analyzeBillImpact, researchComparativeLaw } from '../../services/geminiService';
import type { BillDraft, BillAnalysis, ComparativeLawResearch } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ActionButtons from '../common/ActionButtons';

const LegislativeSupportPage: React.FC = () => {
    // Bill Draft State
    const [rationale, setRationale] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    const [billDraft, setBillDraft] = useState<BillDraft | null>(null);
    const [draftLoading, setDraftLoading] = useState(false);
    const [draftError, setDraftError] = useState<string | null>(null);

    // Bill Analysis State
    const [billToAnalyze, setBillToAnalyze] = useState('');
    const [billAnalysis, setBillAnalysis] = useState<BillAnalysis | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Comparative Law Research State
    const [researchTopic, setResearchTopic] = useState('');
    const allCountries = ['미국', 'EU', '영국', '일본', '독일', '프랑스'];
    const [selectedCountries, setSelectedCountries] = useState<string[]>(['미국', 'EU']);
    const [researchResult, setResearchResult] = useState<ComparativeLawResearch[] | null>(null);
    const [researchLoading, setResearchLoading] = useState(false);
    const [researchError, setResearchError] = useState<string | null>(null);


    const handleDraftSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rationale || !keyPoints) return;
        setDraftLoading(true);
        setDraftError(null);
        setBillDraft(null);
        try {
            const result = await draftBill(rationale, keyPoints);
            setBillDraft(result);
        } catch (err) {
            setDraftError('법안 초안 생성 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setDraftLoading(false);
        }
    };

    const handleAnalysisSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!billToAnalyze) return;
        setAnalysisLoading(true);
        setAnalysisError(null);
        setBillAnalysis(null);
        try {
            const result = await analyzeBillImpact(billToAnalyze);
            setBillAnalysis(result);
        } catch (err) {
            setAnalysisError('법안 영향 분석 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleResearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!researchTopic || selectedCountries.length === 0) return;
        setResearchLoading(true);
        setResearchError(null);
        setResearchResult(null);
        try {
            const result = await researchComparativeLaw(researchTopic, selectedCountries);
            setResearchResult(result);
        } catch (err) {
            setResearchError('해외 사례 리서치 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setResearchLoading(false);
        }
    };
    
    const handleCountrySelection = (country: string) => {
        setSelectedCountries(prev => 
            prev.includes(country) 
                ? prev.filter(c => c !== country)
                : [...prev, country]
        );
    };

    // Formatting functions for ActionButtons
    const formatBillDraftText = () => {
        if (!billDraft) return '';
        return `
법안명: ${billDraft.title}
======================================

[제안 이유]
${billDraft.proposalReason}

--------------------------------------

[주요 내용]
${billDraft.articles.map(art => `${art.title}\n${art.content}`).join('\n\n')}
        `.trim();
    };

    const formatAnalysisText = () => {
        if (!billAnalysis) return '';
        return `
법률안 영향 및 여론 분석 보고서
======================================

■ 긍정적 기대 효과
${billAnalysis.positiveImpacts.map(item => `- ${item}`).join('\n')}

■ 부정적 우려 및 논란
${billAnalysis.negativeConcerns.map(item => `- ${item}`).join('\n')}

■ 기존 법률과의 충돌 가능성
${billAnalysis.legalConflicts.map(item => `- ${item}`).join('\n')}

■ 언론 및 여론 예상 반응
${billAnalysis.mediaSentiment.map(item => `- ${item.topic}: ${item.expectedStance}`).join('\n')}
        `.trim();
    };

    const formatResearchText = () => {
        if (!researchResult) return '';
        return `
정책 및 해외입법 리서치: ${researchTopic}
======================================
${researchResult.map(res => `
■ ${res.country}
${res.summary}
출처: 
${res.sourceLinks.map(link => `- ${link}`).join('\n')}
`).join('\n--------------------------------------\n')}
        `.trim();
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">입법 활동 지원</h1>
                <p className="text-md text-text-secondary mt-1">AI와 함께 법안 발의부터 정책 리서치까지, 입법의 전 과정을 효율적으로 관리합니다.</p>
            </header>

            {/* Bill Drafting */}
            <Card>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">1. AI 법안 초안 작성</h2>
                <form onSubmit={handleDraftSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rationale" className="block text-sm font-medium text-gray-700">제안 이유 (입법 취지)</label>
                        <textarea id="rationale" rows={4} value={rationale} onChange={e => setRationale(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: 최근 급증하는 AI 기술 오남용으로 인한 사생활 침해 및 가짜뉴스 문제 해결" />
                    </div>
                    <div>
                        <label htmlFor="keyPoints" className="block text-sm font-medium text-gray-700">법안의 주요 내용 (핵심 골자)</label>
                        <textarea id="keyPoints" rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: AI 생성물 워터마크 표기 의무화, 딥페이크 명예훼손 처벌 강화" />
                    </div>
                    <button type="submit" disabled={draftLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                        {draftLoading ? '생성 중...' : '법안 초안 생성'}
                    </button>
                </form>
                {draftLoading && <LoadingSpinner />}
                {draftError && <Card className="mt-4 bg-red-100 text-red-700">{draftError}</Card>}
                {billDraft && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">법안 초안: {billDraft.title}</h3>
                            <ActionButtons content={formatBillDraftText} fileName={() => `법안초안_${billDraft.title.replace(/\s/g, '_')}`} shareDetails={() => ({ title: `법안 초안: ${billDraft.title}`, text: formatBillDraftText() })} />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md prose max-w-none">
                            <h4>제안 이유</h4>
                            <p>{billDraft.proposalReason}</p>
                            <hr className="my-4" />
                            <h4>주요 내용</h4>
                            {billDraft.articles.map((article, index) => (
                                <div key={index} className="mt-2">
                                    <p><strong>{article.title}</strong></p>
                                    <p className="whitespace-pre-wrap">{article.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Bill Impact Analysis */}
            <Card>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">2. 법률안 영향 및 여론 분석</h2>
                <form onSubmit={handleAnalysisSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="billToAnalyze" className="block text-sm font-medium text-gray-700">분석할 법률안 내용</label>
                        <textarea id="billToAnalyze" rows={8} value={billToAnalyze} onChange={e => setBillToAnalyze(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="분석하고 싶은 법안의 전문 또는 초안을 여기에 붙여넣으세요." />
                    </div>
                    <button type="submit" disabled={analysisLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                        {analysisLoading ? '분석 중...' : '영향 및 여론 분석'}
                    </button>
                </form>
                 {analysisLoading && <LoadingSpinner />}
                {analysisError && <Card className="mt-4 bg-red-100 text-red-700">{analysisError}</Card>}
                {billAnalysis && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">분석 보고서</h3>
                             <ActionButtons content={formatAnalysisText} fileName={() => `법안영향분석_보고서`} shareDetails={() => ({ title: `법안 영향 분석 보고서`, text: formatAnalysisText() })} />
                        </div>
                        <div className="space-y-4 p-4 bg-gray-50 rounded-md prose max-w-none">
                           <div>
                                <h4 className="font-bold text-primary">긍정적 기대 효과</h4>
                                <ul className="list-disc pl-5">{billAnalysis.positiveImpacts.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-primary">부정적 우려 및 논란</h4>
                                <ul className="list-disc pl-5">{billAnalysis.negativeConcerns.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                             <div>
                                <h4 className="font-bold text-primary">기존 법률과의 충돌 가능성</h4>
                                <ul className="list-disc pl-5">{billAnalysis.legalConflicts.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-primary">언론 및 여론 예상 반응</h4>
                                <ul className="list-disc pl-5">{billAnalysis.mediaSentiment.map((item, i) => <li key={i}><strong>{item.topic}:</strong> {item.expectedStance}</li>)}</ul>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Comparative Law Research */}
            <Card>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">3. 정책 및 해외입법 리서치</h2>
                 <form onSubmit={handleResearchSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="researchTopic" className="block text-sm font-medium text-gray-700">리서치 주제</label>
                        <input id="researchTopic" value={researchTopic} onChange={e => setResearchTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: 플랫폼 노동자 권익 보호" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">비교 대상 국가</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {allCountries.map(country => (
                                <button type="button" key={country} onClick={() => handleCountrySelection(country)} className={`px-3 py-1.5 text-sm rounded-full ${selectedCountries.includes(country) ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary`}>
                                    {country}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={researchLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                        {researchLoading ? '리서치 중...' : '해외사례 리서치'}
                    </button>
                </form>
                {researchLoading && <LoadingSpinner />}
                {researchError && <Card className="mt-4 bg-red-100 text-red-700">{researchError}</Card>}
                {researchResult && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">리서치 결과: {researchTopic}</h3>
                             <ActionButtons content={formatResearchText} fileName={() => `해외사례리서치_${researchTopic.replace(/\s/g, '_')}`} shareDetails={() => ({ title: `해외사례 리서치: ${researchTopic}`, text: formatResearchText() })} />
                        </div>
                        <div className="space-y-6">
                            {researchResult.map((result, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-md prose max-w-none">
                                    <h4 className="font-bold text-primary border-b pb-1 mb-2">{result.country}</h4>
                                    <p>{result.summary}</p>
                                    {result.sourceLinks.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-sm">정보 출처:</h5>
                                            <ul className="list-disc pl-5 text-sm">
                                                {result.sourceLinks.map((link, i) => (
                                                    <li key={i}><a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{link}</a></li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

        </div>
    );
};

export default LegislativeSupportPage;

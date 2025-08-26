
import React, { useState } from 'react';
import { generateAuditAnalysis, generateFollowUpQuestion } from '../../services/geminiService';
import type { AuditAnalysis, AuditQuestion } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ActionButtons from '../common/ActionButtons';

interface QuestionAccordionProps {
    question: AuditQuestion;
    index: number;
    onGenerateFollowUp: (index: number) => void;
    isFollowUpLoading: boolean;
    onSelectFollowUp: (followUpText: string) => void;
}

const QuestionAccordion: React.FC<QuestionAccordionProps> = ({ question, index, onGenerateFollowUp, isFollowUpLoading, onSelectFollowUp }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition"
            >
                <span className="font-semibold text-primary">{`질의 ${index + 1}: ${question.questionText}`}</span>
                <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="prose max-w-none space-y-4">
                        <div>
                            <h4 className="font-bold">예상 답변:</h4>
                            <p>{question.expectedAnswer}</p>
                        </div>
                        <div>
                            <h4 className="font-bold">반론/추가 압박:</h4>
                            <p>{question.counterArgument}</p>
                        </div>
                        <div>
                            <h4 className="font-bold">근거 자료:</h4>
                            <p>{question.supportingEvidence}</p>
                        </div>
                         <div>
                            <h4 className="font-bold">추가 질의:</h4>
                            <p>{question.followUpQuestion}</p>
                        </div>
                        <div>
                            <h4 className="font-bold">제출 요청 자료:</h4>
                            <ul className="list-disc pl-5">
                                {question.requestedDocuments.map((doc, i) => <li key={i}>{doc}</li>)}
                            </ul>
                        </div>
                        
                        {question.dynamicFollowUps && question.dynamicFollowUps.length > 0 && (
                            <div>
                                <h4 className="font-bold text-accent">생성된 꼬리질문 (클릭하여 심층 분석):</h4>
                                <ul className="list-disc pl-5 mt-2 space-y-2">
                                    {question.dynamicFollowUps.map((fu, i) => (
                                        <li key={i}>
                                            <button
                                                onClick={() => onSelectFollowUp(fu)}
                                                className="text-left text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-accent rounded"
                                                title="이 질문을 질의대상 정책으로 설정"
                                            >
                                                {fu}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => onGenerateFollowUp(index)}
                            disabled={isFollowUpLoading}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
                        >
                            {isFollowUpLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    생성 중...
                                </>
                            ) : (
                                '꼬리질문 생성'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const NationalAuditPage: React.FC = () => {
    const [agency, setAgency] = useState('');
    const [policy, setPolicy] = useState('');
    const [party, setParty] = useState<'여당' | '야당'>('야당');
    const [analysis, setAnalysis] = useState<AuditAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [followUpLoading, setFollowUpLoading] = useState<number | null>(null);


    const handleGenerateFollowUp = async (questionIndex: number) => {
        if (!analysis) return;

        setFollowUpLoading(questionIndex);
        try {
            const currentQuestion = analysis.questions[questionIndex];
            const result = await generateFollowUpQuestion({
                agency: agency,
                party: party,
                originalQuestion: currentQuestion.questionText,
                expectedAnswer: currentQuestion.expectedAnswer,
            });

            setAnalysis(prevAnalysis => {
                if (!prevAnalysis) return null;
                const newQuestions = [...prevAnalysis.questions];
                const updatedQuestion = { ...newQuestions[questionIndex] };
                
                if (!updatedQuestion.dynamicFollowUps) {
                    updatedQuestion.dynamicFollowUps = [];
                }
                updatedQuestion.dynamicFollowUps.push(result.followUp);

                newQuestions[questionIndex] = updatedQuestion;
                return { ...prevAnalysis, questions: newQuestions };
            });

        } catch (err) {
            console.error("Failed to generate follow-up question:", err);
            // Optionally, show an error to the user for this specific action
        } finally {
            setFollowUpLoading(null);
        }
    };

    const handleSelectFollowUp = (followUpText: string) => {
        setPolicy(followUpText);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agency) {
            setError('피감기관명을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await generateAuditAnalysis(agency, party, policy);
            setAnalysis(result);
        } catch (err) {
            setError('분석 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const formatAnalysisText = () => {
        if (!analysis) return '';
        return `피감기관: ${agency}\n정당 포지션: ${party}\n질의대상 정책: ${policy || '미지정'}\n\n=================================\n\n` +
        analysis.questions.map((q, index) => {
            let followUps = '';
            if (q.dynamicFollowUps && q.dynamicFollowUps.length > 0) {
                followUps = `\n- 생성된 꼬리질문:\n${q.dynamicFollowUps.map(fu => `  * ${fu}`).join('\n')}`;
            }
            return `
질의 ${index + 1}: ${q.questionText}
---------------------------------
- 예상 답변: ${q.expectedAnswer}
- 반론/추가 압박: ${q.counterArgument}
- 근거 자료: ${q.supportingEvidence}
- 추가 질의: ${q.followUpQuestion}${followUps}
- 제출 요청 자료:
${q.requestedDocuments.map(doc => `  - ${doc}`).join('\n')}
`}).join('\n\n=================================\n');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">AI 국정감사 질의응답 시뮬레이션</h1>
                <p className="text-md text-text-secondary mt-1">피감기관과 정당 포지션을 선택하여 심층 질의 리스트를 생성하세요.</p>
            </header>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="agency" className="block text-sm font-medium text-gray-700">피감기관명</label>
                        <input
                            type="text"
                            id="agency"
                            value={agency}
                            onChange={(e) => setAgency(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="예: 기획재정부"
                        />
                    </div>
                     <div>
                        <label htmlFor="policy" className="block text-sm font-medium text-gray-700">질의대상 정책 (선택)</label>
                        <input
                            type="text"
                            id="policy"
                            value={policy}
                            onChange={(e) => setPolicy(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="예: 부동산 공급 정책"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">정당 포지션</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setParty('여당')} className={`flex-1 px-4 py-2 rounded-l-md ${party === '여당' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:outline-none`}>
                                여당
                            </button>
                            <button type="button" onClick={() => setParty('야당')} className={`flex-1 px-4 py-2 rounded-r-md ${party === '야당' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-r-gray-300 border-t-gray-300 border-b-gray-300 focus:outline-none`}>
                                야당
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                    >
                        {loading ? '생성 중...' : '질의 생성'}
                    </button>
                </form>
            </Card>

            {loading && <LoadingSpinner />}
            {error && <Card className="bg-red-100 text-red-700">{error}</Card>}

            {analysis && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">분석 결과: {agency}</h2>
                        <ActionButtons
                            content={formatAnalysisText}
                            fileName={() => `국정감사_질의_${agency.replace(/\s/g, '_')}`}
                            shareDetails={() => ({
                                title: `국정감사 질의 분석: ${agency}`,
                                text: formatAnalysisText()
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        {analysis.questions.map((q, index) => (
                           <QuestionAccordion 
                                key={index} 
                                question={q} 
                                index={index} 
                                onGenerateFollowUp={handleGenerateFollowUp}
                                isFollowUpLoading={followUpLoading === index}
                                onSelectFollowUp={handleSelectFollowUp}
                            />
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default NationalAuditPage;

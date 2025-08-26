
import React, { useState, useEffect, useRef } from 'react';
import { analyzePetition, draftSpeech, draftPetitionReply } from '../../services/geminiService';
import type { PetitionAnalysis, SpeechDraft, PetitionReply } from '../../types';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ActionButtons from '../common/ActionButtons';

// Define a minimal interface for SpeechRecognition to satisfy TypeScript
interface SpeechRecognition {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onstart: () => void;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    stop: () => void;
    start: () => void;
}

// Extend window type for webkitSpeechRecognition for TypeScript
declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

const ConstituencyPage: React.FC = () => {
    // Petition State
    const [petition, setPetition] = useState('');
    const [petitionResult, setPetitionResult] = useState<PetitionAnalysis | null>(null);
    const [petitionLoading, setPetitionLoading] = useState(false);
    const [petitionError, setPetitionError] = useState<string | null>(null);

    // Reply Draft State
    const [replyDraft, setReplyDraft] = useState<PetitionReply | null>(null);
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyError, setReplyError] = useState<string | null>(null);

    // Speech State
    const [meetingType, setMeetingType] = useState('');
    const [audience, setAudience] = useState('');
    const [contentToReflect, setContentToReflect] = useState('');
    const [speechLength, setSpeechLength] = useState<'1분' | '3분' | '5분' | '10분' | '15분 이상'>('3분');
    const [speechTone, setSpeechTone] = useState('진지하고 무게감 있게');
    const [speechResult, setSpeechResult] = useState<SpeechDraft | null>(null);
    const [speechLoading, setSpeechLoading] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;

        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setPetition(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        return () => {
             if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Could not start speech recognition: ", error);
            }
        }
    };

    const handlePetitionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!petition) return;
        setPetitionLoading(true);
        setPetitionError(null);
        setPetitionResult(null);
        setReplyDraft(null); // Reset reply draft
        setReplyError(null); // Reset reply error
        try {
            const result = await analyzePetition(petition);
            setPetitionResult(result);
        } catch (err) {
            setPetitionError('민원 분석 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setPetitionLoading(false);
        }
    };

    const handleDraftReply = async () => {
        if (!petition || !petitionResult) return;
        setReplyLoading(true);
        setReplyError(null);
        setReplyDraft(null);
        try {
            const result = await draftPetitionReply(petition, petitionResult);
            setReplyDraft(result);
        } catch (err) {
            setReplyError('회신문 초안 생성 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setReplyLoading(false);
        }
    };

    const handleSpeechSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingType || !audience) return;
        setSpeechLoading(true);
        setSpeechError(null);
        setSpeechResult(null);
        try {
            const result = await draftSpeech(meetingType, audience, contentToReflect, speechLength, speechTone);
            setSpeechResult(result);
        } catch (err) {
            setSpeechError('연설문 생성 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setSpeechLoading(false);
        }
    };
    
    const formatSpeechText = () => {
        if (!speechResult) return '';
        return `
제목: ${speechResult.title}
================================

[도입]
${speechResult.introduction}

[본문]
${speechResult.body.join('\n\n')}

[마무리]
${speechResult.conclusion}
        `.trim();
    };

    const formatReplyText = () => {
        if (!replyDraft) return '';
        return `
${replyDraft.greeting}

${replyDraft.body}

${replyDraft.closing}
        `.trim();
    };
    
    const speechLengthOptions: Array<'1분' | '3분' | '5분' | '10분' | '15분 이상'> = ['1분', '3분', '5분', '10분', '15분 이상'];
    const speechToneOptions = ['진지하고 무게감 있게', '희망차고 감동적으로', '부드럽고 친근하게', '논리적이고 설득력 있게', '강력하고 단호하게'];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">지역구 관리</h1>
                <p className="text-md text-text-secondary mt-1">지역 주민과의 소통을 돕는 스마트 비서 기능입니다.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Petition Management */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-700">지역구 민원 관리</h2>
                    <Card>
                        <form onSubmit={handlePetitionSubmit} className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="petition" className="block text-sm font-medium text-gray-700">민원 내용</label>
                                    {recognitionRef.current && (
                                        <button
                                            type="button"
                                            onClick={toggleListening}
                                            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            aria-label={isListening ? '음성 입력 중지' : '음성으로 입력 시작'}
                                        >
                                             <svg className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A5.002 5.002 0 014 10V8a1 1 0 012 0v2a3 3 0 006 0V8a1 1 0 012 0v2a5.002 5.002 0 01-3 4.93z" clipRule="evenodd"></path></svg>
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    id="petition"
                                    rows={5}
                                    value={petition}
                                    onChange={(e) => setPetition(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder={isListening ? "듣고 있습니다..." : "민원 내용을 입력하거나 마이크 버튼을 눌러 음성으로 입력하세요."}
                                />
                            </div>
                            <button type="submit" disabled={petitionLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                                {petitionLoading ? '분석 중...' : '처리 방안 분석'}
                            </button>
                        </form>
                    </Card>
                    {petitionLoading && <LoadingSpinner />}
                    {petitionError && <Card className="bg-red-100 text-red-700">{petitionError}</Card>}
                    {petitionResult && (
                        <Card>
                            <h3 className="text-xl font-bold mb-2">민원 처리 방안 초안</h3>
                             <div className="space-y-3 prose max-w-none">
                                <div>
                                    <h4 className="font-bold text-primary">추천 조치</h4>
                                    <ul className="list-disc pl-5">
                                        {petitionResult.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-bold text-primary">관련 부서</h4>
                                    <ul className="list-disc pl-5">
                                        {petitionResult.relevantDepartments.map((dept, i) => <li key={i}>{dept}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleDraftReply}
                                    disabled={replyLoading}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400"
                                >
                                    {replyLoading ? '생성 중...' : '답변 회신문 초안 작성'}
                                </button>
                            </div>
                        </Card>
                    )}
                    {replyLoading && <LoadingSpinner />}
                    {replyError && <Card className="bg-red-100 text-red-700">{replyError}</Card>}
                    {replyDraft && (
                        <Card>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold">민원 회신문 초안</h3>
                                <ActionButtons
                                    content={formatReplyText}
                                    fileName={() => `민원회신문_초안`}
                                    shareDetails={() => ({
                                        title: `민원 회신문 초안`,
                                        text: formatReplyText()
                                    })}
                                />
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md prose max-w-none text-text-secondary">
                                <p className="whitespace-pre-wrap text-text-primary">{replyDraft.greeting}</p>
                                <p className="whitespace-pre-wrap">{replyDraft.body}</p>
                                <p className="whitespace-pre-wrap text-text-primary">{replyDraft.closing}</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Speech Generation */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-700">찬조연설 초안 생성</h2>
                    <Card>
                        <form onSubmit={handleSpeechSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700">모임 성격</label>
                                <input id="meetingType" value={meetingType} onChange={(e) => setMeetingType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: 청년 창업 지원 축사" />
                            </div>
                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-gray-700">핵심 청중</label>
                                <input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: 20-30대 예비 창업가" />
                            </div>
                             <div>
                                <label htmlFor="contentToReflect" className="block text-sm font-medium text-gray-700">연설문에 반영할 내용 (선택)</label>
                                <textarea id="contentToReflect" rows={3} value={contentToReflect} onChange={(e) => setContentToReflect(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="예: 도전 정신과 혁신을 강조" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">연설 톤</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {speechToneOptions.map((option) => (
                                        <button type="button" key={option} onClick={() => setSpeechTone(option)} className={`px-3 py-1.5 text-sm rounded-md ${speechTone === option ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">연설 시간</label>
                                <div className="mt-1 grid grid-cols-5 rounded-md shadow-sm">
                                    {speechLengthOptions.map((option, index) => (
                                        <button type="button" key={option} onClick={() => setSpeechLength(option)} className={`px-4 py-2 text-sm ${speechLength === option ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary ${index === 0 ? 'rounded-l-md' : ''} ${index === speechLengthOptions.length - 1 ? 'rounded-r-md' : ''} ${index > 0 ? '-ml-px' : ''}`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={speechLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                                {speechLoading ? '생성 중...' : '연설문 초안 생성'}
                            </button>
                        </form>
                    </Card>
                    {speechLoading && <LoadingSpinner />}
                    {speechError && <Card className="bg-red-100 text-red-700">{speechError}</Card>}
                    {speechResult && (
                        <Card>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold">{speechResult.title}</h3>
                                 <ActionButtons
                                    content={formatSpeechText}
                                    fileName={() => `찬조연설문_${speechResult.title.replace(/\s/g, '_')}`}
                                    shareDetails={() => ({
                                        title: `찬조연설문: ${speechResult.title}`,
                                        text: formatSpeechText()
                                    })}
                                />
                            </div>
                            <div className="space-y-3 prose max-w-none text-text-secondary">
                                <p className="text-text-primary"><strong>도입:</strong> {speechResult.introduction}</p>
                                {speechResult.body.map((p, i) => <p key={i}>{p}</p>)}
                                <p className="text-text-primary"><strong>마무리:</strong> {speechResult.conclusion}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConstituencyPage;
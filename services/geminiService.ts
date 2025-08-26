
import { GoogleGenAI, Type } from "@google/genai";
import type { AuditAnalysis, PersonProfile, PetitionAnalysis, SpeechDraft, PetitionReply, BillDraft, BillAnalysis, ComparativeLawResearch } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationConfig = {
    responseMimeType: "application/json",
};

export async function generateAuditAnalysis(agency: string, party: '여당' | '야당', policy?: string): Promise<AuditAnalysis> {
    const prompt = `
      **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

      You are an expert AI assistant for a South Korean parliament member.
      Your task is to generate a comprehensive Q&A simulation for a national assembly audit. All output must be in Korean.
      
      Target Government Agency: ${agency}
      Specific Policy to Target (if any): ${policy || 'Not specified'}
      My Political Stance: ${party}

      Based on my stance, analyze the latest policies, budget, relevant laws, and news related to the agency and the specific policy. It is crucial that all information is based on the most current data available as of today's date (August 2025).
      Generate a list of at least 5 sharp, in-depth questions. For each question, provide an expected answer from the agency's perspective, a potential counter-argument I can use, supporting evidence/data points, a follow-up question, and a list of documents to request.
      
      The tone should be professional, critical, and strategic.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                description: 'List of at least 5 audit questions and related analysis.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: { type: Type.STRING, description: 'The main question to ask.' },
                        expectedAnswer: { type: Type.STRING, description: 'The likely answer from the agency.' },
                        counterArgument: { type: Type.STRING, description: 'A strong counter-argument to the expected answer.' },
                        supportingEvidence: { type: Type.STRING, description: 'Factual evidence or data to support the question/counter-argument.' },
                        followUpQuestion: { type: Type.STRING, description: 'A follow-up question to probe deeper.' },
                        requestedDocuments: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of official documents to request as evidence.' }
                    },
                    required: ['questionText', 'expectedAnswer', 'counterArgument', 'supportingEvidence', 'followUpQuestion', 'requestedDocuments']
                }
            }
        },
        required: ['questions']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });
    
    return JSON.parse(response.text) as AuditAnalysis;
}

export async function generateFollowUpQuestion(context: {
    agency: string;
    party: '여당' | '야당';
    originalQuestion: string;
    expectedAnswer: string;
}): Promise<{ followUp: string }> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

        You are an expert AI assistant for a South Korean parliament member, specializing in national assembly audits.
        Based on the following context of an ongoing Q&A, generate a single, sharp, and concise follow-up question (a "꼬리질문" or tail question).
        The goal is to press the subject on their answer, find inconsistencies, or demand more specific details. All output must be in Korean.

        Context:
        - Target Government Agency: ${context.agency}
        - My Political Stance: ${context.party}
        - My Original Question: "${context.originalQuestion}"
        - Agency's Expected Answer: "${context.expectedAnswer}"

        Your task: Generate one piercing follow-up question based on this exchange.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            followUp: { type: Type.STRING, description: 'A single, sharp follow-up question in Korean.' },
        },
        required: ['followUp']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as { followUp: string };
}


export async function analyzePerson(name: string, affiliation?: string): Promise<PersonProfile> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

        You are an expert AI information analyst for a member of the South Korean National Assembly. Your task is to analyze an individual and suggest potential topics for a National Assembly audit. All output must be in Korean and based on the latest information available as of today (August 2025).

        **CRITICAL INSTRUCTIONS:**
        1.  **Primary Sources:** You MUST prioritize information from reputable sources like major news sites and official government websites to understand the person's context and role.
        2.  **Accuracy and Homonyms:** The user has provided a name and an affiliation. Use the **affiliation ('${affiliation || 'Not specified'}')** to precisely identify the correct person and avoid confusion with homonyms. If you cannot confidently identify the correct individual, return empty arrays for all fields.
        3.  **Focus on Audit Topics:** Instead of a general profile, focus on generating specific and likely questions or key audit topics if this person were to appear as a witness. This should be based on their known activities, affiliations, and any relevant public information.
        4.  **Source Validation:** You MUST return a list of all source URLs you used for your analysis. **Crucially, these URLs must be valid, directly relevant to the information provided, and accessible.** Do not provide broken links or irrelevant pages.

        **Person to Analyze:**
        - Name: ${name}
        - Affiliation: ${affiliation || 'Not specified'}

        **Required Information (in Korean):**
        1.  **Key Audit Topics:** Suggest specific and likely questions or key audit topics if this person were to appear as a witness in a National Assembly audit.
        2.  **Sources:** A list of all valid and relevant URL sources used for this analysis.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            keyAuditTopics: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'List of specific topics this person might be questioned on during the audit.' },
            sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of verifiable source URLs used for the analysis.' }
        },
        required: ['keyAuditTopics', 'sources']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as PersonProfile;
}

export async function analyzePetition(content: string): Promise<PetitionAnalysis> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.
        
        A citizen from my constituency has submitted the following petition. Analyze its content and provide a draft plan of action. The entire response must be in Korean.
        
        Petition: "${content}"
        
        Suggest concrete next steps and identify the relevant government departments or agencies to contact for resolution. Ensure your suggestions are based on the most current laws and government structures in South Korea (as of August 2025).
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            suggestedActions: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of concrete next steps to address the petition.'},
            relevantDepartments: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of government departments or agencies to contact.'}
        },
        required: ['suggestedActions', 'relevantDepartments']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as PetitionAnalysis;
}

export async function draftPetitionReply(petitionContent: string, analysis: PetitionAnalysis): Promise<PetitionReply> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황을 미묘하게 반영하여, 국회의원의 입장에서 작성되어야 합니다.

        당신은 대한민국 국회의원의 AI 보좌관입니다. 지역구민의 민원에 대한 회신문 초안을 작성해야 합니다.
        국회의원의 입장에서, 매우 정중하고 진정성 있는 어조를 사용해 주세요.

        접수된 민원 내용:
        "${petitionContent}"

        내부 검토 결과:
        - 추천 조치: ${analysis.suggestedActions.join(', ')}
        - 관련 부서: ${analysis.relevantDepartments.join(', ')}

        **회신문 작성 지침:**
        1.  **인사말 (greeting):** "소중한 의견을 보내주신 OOO 지역구민께," 와 같이 수신인을 명시하고, 국회의원 OOO입니다 와 같은 소개로 시작합니다. 이름 부분은 '[국회의원 성명]'과 같이 플레이스홀더로 남겨주세요.
        2.  **본문 (body):**
            - 민원 내용에 대해 깊이 공감하고 있음을 표현합니다.
            - 내부 검토 결과를 바탕으로, '추천 조치'가 가능하다면 문제 해결을 위해 어떤 노력을 할 것인지 구체적으로 언급합니다. (예: 관련 부서에 의견 전달, 현장 방문, 법안 검토 등)
            - 만약 '추천 조치'가 명확하지 않거나, 해결이 어려운 사안으로 판단될 경우, 직접적인 거절이나 부정적인 표현은 피합니다. 대신, "말씀주신 사안의 중요성을 깊이 인식하고 있으며, 해결 방안을 다각도로 신중히 검토하겠습니다.", "관련 법규와 제도를 면밀히 살펴보겠습니다." 와 같이 완곡하고 책임감 있는 표현을 사용합니다.
            - 민원인의 의견이 지역 발전에 소중한 밑거름이 됨을 강조합니다.
        3.  **맺음말 (closing):** 앞으로도 지역구민의 목소리에 귀 기울이겠다는 다짐과 함께, 건강과 행복을 기원하는 따뜻한 인사로 마무리합니다. 국회의원 이름과 '드림' 또는 '올림'으로 끝맺습니다. (예: 국회의원 [국회의원 성명] 드림)

        위 지침에 따라, 바로 사용할 수 있는 완성된 형태의 회신문 초안을 작성해 주세요.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            greeting: { type: Type.STRING, description: '정중한 인사말과 수신인.' },
            body: { type: Type.STRING, description: '공감, 조치 계획 또는 신중한 검토 약속을 포함한 본문.' },
            closing: { type: Type.STRING, description: '다짐과 끝인사를 포함한 맺음말.' }
        },
        required: ['greeting', 'body', 'closing']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as PetitionReply;
}

export async function draftSpeech(
    meetingType: string,
    audience: string,
    contentToReflect: string,
    speechLength: string,
    speechTone: string
): Promise<SpeechDraft> {
    const prompt = `
      **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

      당신은 대한민국 국회의원을 보좌하는 최고의 AI 연설문 작성 전문가입니다.
      전문성, 신뢰성, 적법성을 갖춘 매우 높은 수준의 찬조 연설문 초안을 작성해야 합니다.

      아래 요구사항에 따라 연설문을 작성해 주십시오:
      - 모임 성격: ${meetingType}
      - 핵심 청중: ${audience}
      - 연설 시간: ${speechLength}
      - 연설 톤: ${speechTone}
      - 연설문에 반영할 내용 (선택 사항): ${contentToReflect || '특별히 없음'}

      결과물은 반드시 다음 사항을 준수해야 합니다:
      1.  대한민국 국회의원의 격에 맞는 정중하고 품격 있는 어조를 사용합니다.
      2.  청중의 눈높이에 맞춰 공감대를 형성하고 감동을 줄 수 있는 내용을 포함합니다.
      3.  '제목', '도입', '본문', '마무리'의 명확한 구조로 작성합니다. 본문은 여러 문단으로 구성될 수 있습니다.
      4.  [개인적인 일화 삽입]과 같은 플레이스홀더를 사용하지 않고, 바로 사용할 수 있는 완성된 형태의 연설문을 제공합니다.
      5.  법률에 위배되거나 정치적으로 편향된 내용, 확인되지 않은 사실을 포함해서는 안 됩니다.
      6.  연설문에 포함되는 모든 통계, 사실, 사례는 작성 시점을 기준으로 가장 최신 정보(2025년 8월 기준)를 사용해야 합니다.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'A suitable title for the speech.' },
            introduction: { type: Type.STRING, description: 'An engaging opening for the speech.' },
            body: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'The main points or paragraphs of the speech.' },
            conclusion: { type: Type.STRING, description: 'A strong closing for the speech.' }
        },
        required: ['title', 'introduction', 'body', 'conclusion']
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as SpeechDraft;
}

export async function draftBill(rationale: string, keyPoints: string): Promise<BillDraft> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

        You are an expert legislative assistant AI for a South Korean parliament member. Your task is to draft a bill based on the user's intent and key points. The output must be in Korean and follow the standard format of South Korean legislation.

        **User's Input:**
        - Rationale for Legislation (제안 이유): ${rationale}
        - Key Points of the Bill (법안의 주요 내용): ${keyPoints}

        **Your Task:**
        1.  Create a suitable title for the bill (법안명).
        2.  Write a formal proposal reason based on the provided rationale.
        3.  Structure the key points into formal articles (조항), such as '제1조(목적)', '제2조(정의)', etc.
        4.  Ensure the language is professional, legal, and appropriate for official submission to the National Assembly.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The official title of the bill in Korean.' },
            proposalReason: { type: Type.STRING, description: 'The formal rationale for proposing the bill.' },
            articles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'The article title, e.g., "제1조(목적)".' },
                        content: { type: Type.STRING, description: 'The full text content of the article.' }
                    },
                    required: ['title', 'content']
                }
            }
        },
        required: ['title', 'proposalReason', 'articles']
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as BillDraft;
}

export async function analyzeBillImpact(billText: string): Promise<BillAnalysis> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 모든 답변은 이 정치적 상황과 최신 정보를 기반으로 생성되어야 합니다.

        You are an expert AI policy analyst. Analyze the following draft bill from a neutral perspective and provide a comprehensive impact assessment report. The report must be in Korean.

        **Bill to Analyze:**
        \`\`\`
        ${billText}
        \`\`\`

        **Analysis Required:**
        1.  **Positive Impacts:** Foreseeable positive effects on society, the economy, etc.
        2.  **Negative Concerns:** Potential negative consequences, risks, or points of controversy.
        3.  **Legal Conflicts:** Potential conflicts or inconsistencies with existing South Korean laws.
        4.  **Media & Public Sentiment Analysis:** Predict the likely stance of major media outlets (e.g., conservative, progressive) and key public opinion trends.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            positiveImpacts: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of potential positive impacts.' },
            negativeConcerns: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of potential negative concerns or risks.' },
            legalConflicts: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of potential conflicts with existing laws.' },
            mediaSentiment: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING, description: 'The group or media type, e.g., "진보 언론" (Progressive Media).' },
                        expectedStance: { type: Type.STRING, description: 'The predicted stance or main argument.' }
                    },
                    required: ['topic', 'expectedStance']
                }
            }
        },
        required: ['positiveImpacts', 'negativeConcerns', 'legalConflicts', 'mediaSentiment']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as BillAnalysis;
}

export async function researchComparativeLaw(topic: string, countries: string[]): Promise<ComparativeLawResearch[]> {
    const prompt = `
        **중요한 시대적 배경:** 현재 시점은 2025년 8월입니다. 대통령은 이재명이며, 여당은 더불어민주당입니다. 리서치의 목적은 이 정치적 상황에서 참고할 만한 입법 사례를 찾는 것이므로, 이 점을 고려하여 답변을 구성해야 합니다.

        You are an AI research assistant specializing in international and comparative law for the South Korean National Assembly.
        Your task is to research legislative examples from other countries on a specific topic. The entire output must be in Korean.

        **Research Topic:** ${topic}
        **Target Countries:** ${countries.join(', ')}

        **Instructions:**
        For each specified country:
        1.  Find relevant laws, policies, or significant court cases related to the topic.
        2.  Provide a concise summary of that country's approach.
        3.  Include direct, valid URLs to the source material (e.g., official legal texts, government reports, reputable news analysis) if available.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                country: { type: Type.STRING, description: 'The country being reported on.' },
                summary: { type: Type.STRING, description: 'A summary of the country\'s legislative approach to the topic.' },
                sourceLinks: { type: Type.ARRAY, items: {type: Type.STRING}, description: 'A list of valid source URLs.' }
            },
            required: ['country', 'summary', 'sourceLinks']
        }
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { ...generationConfig, responseSchema: schema }
    });

    return JSON.parse(response.text) as ComparativeLawResearch[];
}


export interface AuditQuestion {
  questionText: string;
  expectedAnswer: string;
  counterArgument: string;
  supportingEvidence: string;
  followUpQuestion: string;
  requestedDocuments: string[];
  dynamicFollowUps?: string[]; // For user-initiated follow-up questions
}

export interface AuditAnalysis {
  questions: AuditQuestion[];
}

export interface PersonProfile {
  keyAuditTopics: string[];
  sources: string[];
}

export interface PetitionAnalysis {
    suggestedActions: string[];
    relevantDepartments: string[];
}

export interface PetitionReply {
    greeting: string;
    body: string;
    closing: string;
}

export interface SpeechDraft {
    title: string;
    introduction: string;
    body: string[];
    conclusion: string;
}

export interface BillDraft {
    title: string;
    proposalReason: string;
    articles: {
        title: string;
        content: string;
    }[];
}

export interface BillAnalysis {
    positiveImpacts: string[];
    negativeConcerns: string[];
    legalConflicts: string[];
    mediaSentiment: {
        topic: string;
        expectedStance: string;
    }[];
}

export interface ComparativeLawResearch {
    country: string;
    summary: string;
    sourceLinks: string[];
}

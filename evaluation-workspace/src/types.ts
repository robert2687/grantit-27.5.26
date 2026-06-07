export type EvaluationStatus =
  | "pending_review"
  | "completed"
  | "shortlisted"
  | "rejected"
  | "sent_to_copywriter";

export type WorkflowAction = "shortlist" | "reject" | "send_to_copywriter";

export type CriteriaKey =
  | "relevance"
  | "capacity_fit"
  | "success_probability"
  | "budget_fit";

export type CriteriaScores = Record<CriteriaKey, number>;
export type WeightConfig = Record<CriteriaKey, number>;

export interface GrantRecord {
  sourceGrantId?: string;
  title: string;
  funder?: string;
  description?: string;
  category?: string;
  geography?: string;
  deadline?: string;
  amountMin?: number;
  amountMax?: number;
  budgetRequested?: number;
  organizationProfile?: {
    focusAreas?: string[];
    capacityLevel?: "low" | "medium" | "high";
    historicalWinRate?: number;
  };
  tags?: string[];
  [key: string]: unknown;
}

export interface EvaluationFormData {
  grantTitle: string;
  funder: string;
  category: string;
  geography: string;
  deadline: string;
  budgetRange: string;
  organizationCapacity: string;
  keyStrengths: string[];
  riskFlags: string[];
  notes: string;
}

export interface ReviewInput {
  reviewerId: string;
  scores: CriteriaScores;
  comment?: string;
}

export interface Review extends ReviewInput {
  weightedScore: number;
  reviewedAt: string;
}

export interface AggregatedScore {
  criterionAverages: CriteriaScores;
  aggregatedScore: number;
  variance: number;
  reviewCount: number;
}

export interface Evaluation {
  id: string;
  grantRecord: GrantRecord;
  prepopulatedForm: EvaluationFormData;
  status: EvaluationStatus;
  reviews: Review[];
  aggregated?: AggregatedScore;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface EvaluationTemplate {
  templateId: string;
  version: string;
  commentGuidance: string[];
}

export interface MetricsSnapshot {
  avg_evaluation_time: number;
  correlation_with_success: number | null;
  evaluations_per_reviewer: Record<string, number>;
}

export interface EventPayloads {
  "grant.discovered": { grantRecord: GrantRecord };
  "evaluation.completed": {
    evaluationId: string;
    aggregatedScore: number;
    variance: number;
    reviewCount: number;
  };
  "evaluation.shortlisted": {
    evaluationId: string;
    aggregatedScore: number | null;
  };
}
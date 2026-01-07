export interface IdealCustomerProfile {
    company_size: string;
    industries: string[];
    decision_makers: string[];
    pain_points: string[];
    goals: string[];
    budget_range: string;
    tech_stack?: string[];
    buying_triggers?: string[];
}

export interface UseCase {
    name: string;
    description: string;
    icp: IdealCustomerProfile;
}

export interface CaseStudy {
    customer_name?: string;
    industry: string;
    problem: string;
    solution: string;
    results: string[];
    use_case: string;
}

export interface Company {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
    description: string | null;

    // New fields
    target_territories?: string[];
    use_cases?: UseCase[];
    case_studies?: CaseStudy[];
    value_propositions?: string[];

    // Legacy fields (keep for compatibility if needed, or deprecate)
    value_proposition?: string | null; // Legacy single string
    target_audience?: Record<string, any> | null; // Legacy

    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    company_id: string;
    user_id: string | null;
    name: string;
    role: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
}

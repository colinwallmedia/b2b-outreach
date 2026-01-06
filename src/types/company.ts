export interface Company {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
    description: string | null;
    value_proposition: string | null;
    target_audience: Record<string, any> | null;
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

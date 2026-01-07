-- MODIFY companies table to support AI-generated profile structure

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS target_territories text[],
ADD COLUMN IF NOT EXISTS use_cases jsonb,
ADD COLUMN IF NOT EXISTS case_studies jsonb,
ADD COLUMN IF NOT EXISTS value_propositions text[];

-- UPDATE COMMENTS
COMMENT ON COLUMN companies.target_territories IS 'Array of target geographic markets (e.g., ["North America", "EMEA"])';
COMMENT ON COLUMN companies.use_cases IS 'Array of use case objects with ICPs: [{ name, description, icp: {...} }]';
COMMENT ON COLUMN companies.case_studies IS 'Array of customer success stories';
COMMENT ON COLUMN companies.value_propositions IS 'Array of key value propositions';

/*
EXAMPLE DATA STRUCTURE:

use_cases jsonb format:
[
  {
    "name": "Network Automation for Large Enterprises",
    "description": "Automating network configuration and management",
    "icp": {
      "company_size": "5000+",
      "industries": ["Financial Services", "Healthcare"],
      "decision_makers": ["VP of Network Operations", "CIO"],
      "pain_points": ["Manual configurations", "Lack of visibility"],
      "goals": ["Reduce downtime", "Improve efficiency"],
      "budget_range": "$500K+",
      "tech_stack": ["Cisco", "Juniper"],
      "buying_triggers": ["Network outages", "Compliance requirements"]
    }
  }
]

case_studies jsonb format:
[
  {
    "customer_name": "Global Bank (confidential)",
    "industry": "Financial Services",
    "problem": "Manual network changes causing outages",
    "solution": "Automated network documentation and change management",
    "results": ["90% reduction in outages", "50% faster deployments"],
    "use_case": "Network Automation for Large Enterprises"
  }
]
*/

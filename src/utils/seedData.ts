import { supabase } from '../lib/supabase';

export const seedTestData = async () => {
    try {
        console.log('Starting seed...');

        // 1. Create Company
        const companyData = {
            name: 'Acme Corp',
            website: 'https://acme.example.com',
            industry: 'Technology',
            description: 'Leading provider of roadrunner catching supplies.'
        };

        // Check if exists
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('name', companyData.name)
            .single();

        let companyId = existingCompany?.id;

        if (!companyId) {
            const { data, error } = await supabase
                .from('companies')
                .insert([companyData])
                .select()
                .single();

            if (error) throw error;
            companyId = data.id;
            console.log('Created company:', companyData.name);
        } else {
            console.log('Company already exists:', companyData.name);
        }

        // 2. Create Team Members
        const teamMembers = [
            { name: 'Alice Smith', role: 'Account Executive' },
            { name: 'Bob Jones', role: 'SDR' },
            { name: 'Charlie Day', role: 'Manager' }
        ];

        for (const member of teamMembers) {
            // Check if member exists for this company
            const { data: existingMember } = await supabase
                .from('team_members')
                .select('id')
                .eq('company_id', companyId)
                .eq('name', member.name)
                .single();

            if (!existingMember) {
                const { error } = await supabase
                    .from('team_members')
                    .insert([{
                        company_id: companyId,
                        name: member.name,
                        role: member.role
                    }]);

                if (error) throw error;
                console.log('Created member:', member.name);
                if (error) throw error;
                console.log('Created member:', member.name);
            }
        }

        // 3. Create Dashboard KPIs (if empty)
        const { count } = await supabase
            .from('dashboard_kpis')
            .select('*', { count: 'exact', head: true });

        if (count === 0) {
            const kpis = [
                {
                    title: 'Total Revenue',
                    value: '$45,231.89',
                    change: '+20.1%',
                    trend: 'up',
                    icon_key: 'TrendingUp',
                    icon_color: 'text-green-600'
                },
                {
                    title: 'Active Users',
                    value: '2,350',
                    change: '+180.1%',
                    trend: 'up',
                    icon_key: 'Users',
                    icon_color: 'text-blue-600'
                },
                {
                    title: 'Email Sent',
                    value: '12,234',
                    change: '+19%',
                    trend: 'up',
                    icon_key: 'Mail',
                    icon_color: 'text-indigo-600'
                }
            ];

            const { error: kpiError } = await supabase
                .from('dashboard_kpis')
                .insert(kpis);

            if (kpiError) throw kpiError;
            console.log('Created KPIs');
        }

        return { success: true, message: 'Test data populated successfully!' };

    } catch (error) {
        console.error('Seed error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error during seeding'
        };
    }
};

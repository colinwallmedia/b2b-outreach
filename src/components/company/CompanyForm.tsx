import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Company } from '../../types/company';

export function CompanyForm() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        industry: '',
        description: '',
    });

    useEffect(() => {
        async function fetchCompany() {
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    setCompany(data);
                    setFormData({
                        name: data.name,
                        website: data.website || '',
                        industry: data.industry || '',
                        description: data.description || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching company:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCompany();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (company?.id) {
                const { error } = await supabase
                    .from('companies')
                    .update(formData)
                    .eq('id', company.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('companies')
                    .insert([formData]);
                if (error) throw error;
                // Refresh to get ID (simplified)
                window.location.reload();
            }
            alert('Company details saved successfully');
        } catch (err) {
            console.error('Error saving company:', err);
            alert('Failed to save company details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                <p className="text-sm text-gray-500">General details about your organization.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                        type="url"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

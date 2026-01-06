import { useState, useEffect } from 'react';
import { Save, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ValuePropBuilder() {
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [valueProp, setValueProp] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await supabase.from('companies').select('id, value_proposition').limit(1).single();
                if (data) {
                    setCompanyId(data.id);
                    setValueProp(data.value_proposition || '');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!companyId) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('companies')
                .update({ value_proposition: valueProp })
                .eq('id', companyId);

            if (error) throw error;
            alert('Value proposition saved!');
        } catch (err) {
            console.error(err);
            alert('Error saving value proposition');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!companyId) return <div>Please create a company first in the General Info tab.</div>;

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Value Proposition</h3>
                    <p className="text-sm text-gray-500">Define what makes your offer unique.</p>
                </div>
                <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Core Value Proposition
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Focus on the primary problem you solve and the benefit to the customer.
                </p>
                <textarea
                    rows={6}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g. We help B2B SaaS companies reduce churn by 30% through predictive analytics..."
                    value={valueProp}
                    onChange={(e) => setValueProp(e.target.value)}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
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
                            Save Value Prop
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

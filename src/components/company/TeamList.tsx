import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TeamMember } from '../../types/company';

export function TeamList() {
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        async function fetchData() {
            // Fetch company first
            const { data: companyData } = await supabase.from('companies').select('id').limit(1).single();
            if (companyData) {
                setCompanyId(companyData.id);
                // Fetch members
                const { data: membersData } = await supabase
                    .from('team_members')
                    .select('*')
                    .eq('company_id', companyData.id)
                    .order('created_at', { ascending: true });

                if (membersData) setMembers(membersData);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId || !newName) return;

        try {
            const { data, error } = await supabase
                .from('team_members')
                .insert([{ company_id: companyId, name: newName, role: newRole }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setMembers([...members, data]);
                setNewName('');
                setNewRole('');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add team member');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('team_members').delete().eq('id', id);
            if (error) throw error;
            setMembers(members.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to remove member');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!companyId) return <div>Please create a company first.</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-500">Manage who has access to this workspace.</p>
            </div>

            {/* Add Member Form */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
                <form onSubmit={handleAddMember} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="John Doe"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="SDR"
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                    </button>
                </form>
            </div>

            {/* List */}
            <ul className="divide-y divide-gray-100">
                {members.length === 0 ? (
                    <li className="p-6 text-center text-gray-500 text-sm">No team members yet.</li>
                ) : (
                    members.map(member => (
                        <li key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.role || 'No Role'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(member.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { User, Building2, GraduationCap, Briefcase, Mail, Loader2, Send, X, Copy, Check } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { findConnections, generateOutreachTemplate } from '../../services/networkingService';
import { Connection, OutreachTemplate, SeekerProfile } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

interface InsiderConnectionsProps {
    companyName: string;
}

export const InsiderConnections: React.FC<InsiderConnectionsProps> = ({ companyName }) => {
    const { user } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [template, setTemplate] = useState<OutreachTemplate | null>(null);
    const [generatingTemplate, setGeneratingTemplate] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchConnections = async () => {
            if (!user) return;

            try {
                setLoading(true);
                // We need the full seeker profile including parsed_data
                // The auth context might only have basic user data
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) {
                    setError("User profile not found");
                    return;
                }

                const userProfile = userDoc.data() as SeekerProfile;
                const foundConnections = await findConnections(userProfile, companyName);
                setConnections(foundConnections);
            } catch (err) {
                console.error("Failed to fetch connections", err);
                setError("Failed to load connections");
            } finally {
                setLoading(false);
            }
        };

        if (companyName) {
            void fetchConnections();
        }
    }, [user, companyName]);

    const handleGenerateTemplate = async (connection: Connection) => {
        if (!user) return;

        try {
            setSelectedConnection(connection);
            setGeneratingTemplate(true);
            setTemplate(null);

            // Get user profile again for the template generation
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userProfile = userDoc.data() as SeekerProfile;

            const generatedTemplate = await generateOutreachTemplate(connection, userProfile, 'professional');
            setTemplate(generatedTemplate);
        } catch (err) {
            console.error("Failed to generate template", err);
        } finally {
            setGeneratingTemplate(false);
        }
    };

    const copyToClipboard = () => {
        if (!template) return;
        const text = `Subject: ${template.subject}\n\n${template.body}`;
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
            </div>
        );
    }

    if (connections.length === 0) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
                <User className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 text-sm">No insider connections found at {companyName}.</p>
                <p className="text-gray-400 text-xs mt-1">Try connecting with recruiters directly on LinkedIn.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Insider Connections at {companyName}
            </h3>

            <div className="grid gap-3">
                {connections.map(connection => (
                    <div
                        key={connection.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {connection.photoURL ? (
                                    <img
                                        src={connection.photoURL}
                                        alt={connection.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-medium text-gray-900">{connection.name}</h4>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{connection.headline}</p>

                                    <div className="flex items-center gap-1 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                            connection.connectionType === 'alumni'
                                                ? 'bg-purple-100 text-purple-700'
                                                : connection.connectionType === 'ex-colleague'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {connection.connectionType === 'alumni' && <GraduationCap className="w-3 h-3" />}
                                            {connection.connectionType === 'ex-colleague' && <Briefcase className="w-3 h-3" />}
                                            {connection.connectionType === 'shared-network' && <User className="w-3 h-3" />}
                                            {connection.connectionType === 'alumni' ? 'Alumni' :
                                             connection.connectionType === 'ex-colleague' ? 'Ex-Colleague' : 'Network'}
                                        </span>
                                        <span className="text-xs text-gray-400">• {connection.sharedAttribute}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { void handleGenerateTemplate(connection); }}
                                className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                                title="Draft outreach message"
                            >
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Template Modal/Popup */}
            {selectedConnection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Send className="w-4 h-4 text-blue-600" />
                                Draft to {selectedConnection.name}
                            </h3>
                            <button
                                onClick={() => { setSelectedConnection(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {generatingTemplate ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                                    <p className="text-sm text-gray-500">Drafting personalized message...</p>
                                </div>
                            ) : template ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-gray-500">Subject</span>
                                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200">
                                            {template.subject}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-gray-500">Message Body</span>
                                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 whitespace-pre-wrap min-h-[150px]">
                                            {template.body}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => { copyToClipboard(); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

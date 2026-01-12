"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChatbotById, Chatbot } from "@/services/chatbot";
import { FileText, Upload, Save, X, CheckCircle, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

// Types
interface KBDocument {
    id: string;
    name: string;
    size: string;
    uploadedAt: Date;
    type: string;
}

// Mock Data
const MOCK_DOCS: KBDocument[] = [
    { id: '1', name: 'Company_Policy_2025.pdf', size: '2.4 MB', uploadedAt: new Date(2025, 0, 15), type: 'application/pdf' },
    { id: '2', name: 'Product_Manual_v2.pdf', size: '1.1 MB', uploadedAt: new Date(2025, 1, 10), type: 'application/pdf' },
    { id: '3', name: 'FAQ_dataset.pdf', size: '856 KB', uploadedAt: new Date(2025, 2, 5), type: 'application/pdf' },
];

export default function KnowledgeBaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [agent, setAgent] = useState<Chatbot | null>(null);
    const [kbName, setKbName] = useState("");
    const [kbDescription, setKbDescription] = useState("");
    const [documents, setDocuments] = useState<KBDocument[]>(MOCK_DOCS);
    const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(MOCK_DOCS[0]);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Agent Details
    useEffect(() => {
        const fetchAgent = async () => {
            if (params.id) {
                const data = await getChatbotById(params.id as string);
                setAgent(data);
                if (data) {
                    setKbName(data.name);
                    setKbDescription(data.description);
                }
            }
        };
        fetchAgent();
    }, [params.id]);

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Simulate upload
        setIsUploading(true);
        setTimeout(() => {
            const newDocs = Array.from(files).map((file, i) => ({
                id: `new-${Date.now()}-${i}`,
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                uploadedAt: new Date(),
                type: file.type
            }));

            setDocuments(prev => [...prev, ...newDocs]);
            setIsUploading(false);
            setToast({ message: `Successfully uploaded ${files.length} document(s)`, type: 'success' });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }, 1500);
    };

    const handleSave = () => {
        // Simulate save
        console.log("Saving KB:", { id: params.id, name: kbName, description: kbDescription, documents });
        setToast({ message: "Knowledge Base saved successfully!", type: 'success' });
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (selectedDoc?.id === id) setSelectedDoc(null);
        setToast({ message: "Document removed", type: 'success' });
    };

    return (
        <div className="relative h-[calc(100vh-100px)] flex flex-col">
            {/* Custom Toast */}
            {toast && (
                <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex-1 mr-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-sm text-muted-foreground mb-3 font-medium">
                        <span
                            onClick={() => router.push("/admin/ai-agent/knowledge-base")}
                            className="hover:text-foreground cursor-pointer transition-colors"
                        >
                            Knowledge Base
                        </span>
                        <span className="mx-2 text-muted-foreground/50">/</span>
                        <span className="text-foreground">{kbName || "Loading..."}</span>
                    </nav>

                    {/* Live Edit Inputs */}
                    <div className="flex flex-col gap-2 group/edit max-w-2xl">
                        <input
                            type="text"
                            value={kbName}
                            onChange={(e) => setKbName(e.target.value)}
                            className="text-3xl font-bold bg-transparent border border-transparent hover:border-border focus:border-primary rounded-lg px-2 -ml-2 w-full outline-none transition-all placeholder:text-muted-foreground/50 block"
                            placeholder="Enter Knowledge Base Name"
                        />
                        <textarea
                            value={kbDescription}
                            onChange={(e) => setKbDescription(e.target.value)}
                            className="text-sm text-muted-foreground bg-transparent border border-transparent hover:border-border focus:border-primary rounded-md px-2 -ml-2 w-full outline-none transition-all placeholder:text-muted-foreground/50 resize-y min-h-[40px] block"
                            placeholder="Enter description..."
                            rows={2}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm shrink-0"
                >
                    <Save size={18} />
                    Save & Publish
                </button>
            </div>

            {/* Main Layout - 2 Columns */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* LEFT COLUMN: Document List (Scrollable) */}
                <div className="col-span-4 flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b bg-muted/40 font-medium text-sm flex items-center justify-between">
                        <span>Documents ({documents.length})</span>
                        <span className="text-xs text-muted-foreground">{documents.length}/15 Files</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${selectedDoc?.id === doc.id
                                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                                    : 'bg-background hover:bg-muted/50 border-transparent hover:border-border'
                                    }`}
                            >
                                <div className={`p-2 rounded-md shrink-0 ${selectedDoc?.id === doc.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium truncate ${selectedDoc?.id === doc.id ? 'text-primary' : 'text-foreground'}`}>
                                        {doc.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>{doc.size}</span>
                                        <span>•</span>
                                        <span>{format(doc.uploadedAt, 'MMM d, yyyy')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                    title="Remove document"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Sticky Upload Widget */}
                    <div className="p-4 border-t bg-card mt-auto shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group text-center"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.txt,.docx"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-primary">Click to upload</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Max 15 files, 10MB each
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PDF Preview */}
                <div className="col-span-8 bg-muted/20 border rounded-xl overflow-hidden flex flex-col h-full relative">
                    {selectedDoc ? (
                        <>
                            <div className="h-12 border-b bg-card flex items-center justify-between px-4 shrink-0">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Eye size={16} className="text-muted-foreground" />
                                    <span className="truncate max-w-md">{selectedDoc.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Preview Mode
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-8 overflow-hidden">
                                {/* PDF Placeholder / Canvas */}
                                <div className="bg-white dark:bg-black shadow-2xl w-full h-full max-w-3xl rounded-sm border flex flex-col items-center justify-center text-muted-foreground space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="w-24 h-32 border-2 border-dashed rounded flex items-center justify-center bg-muted/30">
                                        <FileText size={48} className="opacity-20" />
                                    </div>
                                    <p>PDF Preview for <span className="font-semibold text-foreground">{selectedDoc.name}</span></p>
                                    <p className="text-xs max-w-xs text-center opacity-70">
                                        (Actual PDF rendering would require a library like react-pdf)
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FileText size={32} className="opacity-50" />
                            </div>
                            <p className="font-medium">No document selected</p>
                            <p className="text-sm">Select a document from the list to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

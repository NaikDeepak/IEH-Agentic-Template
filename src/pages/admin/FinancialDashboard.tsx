import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateFinancials, CALCULATOR_CONFIG } from '../../features/admin/services/costingService';
import {
    Users,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Zap,
    Download,
    Play,
    X,
    Building2
} from 'lucide-react';

const FinancialDashboard: React.FC = () => {
    const [userScale, setUserScale] = useState(10000);
    const [aiEngineers, setAiEngineers] = useState(1); // Lean AI-Native Team
    const [fullstackDevs, setFullstackDevs] = useState(0); // Leveraging AI coding agents
    const [premiumConversion, setPremiumConversion] = useState(5); // 5% total paying
    const [enterpriseMix, setEnterpriseMix] = useState(10); // 10% of paying are Enterprise
    const [isPitchMode, setIsPitchMode] = useState(false);

    // Ops Toggles
    const [qaEnabled, setQaEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(true);
    const [legalEnabled, setLegalEnabled] = useState(true);

    const stats = useMemo(() => {
        return calculateFinancials(
            { ai: aiEngineers, fullstack: fullstackDevs },
            { count: aiEngineers + fullstackDevs },
            { users: userScale },
            { qa: qaEnabled, marketing: marketingEnabled, legal: legalEnabled },
            { pro: premiumConversion, enterprise: enterpriseMix }
        );
    }, [userScale, aiEngineers, fullstackDevs, premiumConversion, enterpriseMix, qaEnabled, marketingEnabled, legalEnabled]);

    const handleExport = () => {
        const rows = [
            ["WorkMila Seed Funding - Financial Projections", ""],
            ["Generated on", new Date().toLocaleDateString()],
            ["", ""],
            ["--- KEY METRICS ---", ""],
            ["Monthly Users", userScale],
            ["Conv. Rate (%)", premiumConversion],
            ["Enterprise Mix (%)", enterpriseMix],
            ["Pro Users", Math.round(stats.revenue.counts.pro)],
            ["Enterprise Users", Math.round(stats.revenue.counts.enterprise)],
            ["", ""],
            ["--- MONTHLY BURN (INR) ---", ""],
            ["Engineering (Human)", stats.burn.human],
            ["SaaS Tools", stats.burn.tools],
            ["AI API Usage", stats.burn.api],
            ["Growth & Ops", stats.burn.ops],
            ["Infrastructure", stats.burn.infra],
            ["TOTAL BURN", stats.burn.total],
            ["", ""],
            ["--- MONTHLY REVENUE (INR) ---", ""],
            ["Pro Tier Revenue", stats.revenue.pro],
            ["Enterprise Revenue", stats.revenue.enterprise],
            ["TOTAL REVENUE", stats.revenue.total],
            ["", ""],
            ["NET PROFIT/LOSS", stats.profit]
        ];

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `WorkMila_Financials_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`min-h-screen bg-slate-50 transition-colors duration-700 ${isPitchMode ? 'p-12' : 'p-8'} font-sans relative`}>

            {/* Exit Pitch Mode Button */}
            <AnimatePresence>
                {isPitchMode && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => { setIsPitchMode(false); }}
                        className="fixed top-8 right-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-sky-700 text-white font-semibold text-sm rounded-xl hover:bg-sky-800 transition-colors shadow-soft-md"
                    >
                        <X size={16} /> Exit Pitch Mode
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <motion.div
                layout
                className={`max-w-7xl mx-auto mb-12 border-b border-slate-200 pb-8 ${isPitchMode ? 'text-center' : ''}`}
            >
                <div className={`flex flex-col ${isPitchMode ? 'items-center' : 'md:flex-row justify-between items-end'} gap-6`}>
                    <div>
                        <motion.h1 layout className={`${isPitchMode ? 'text-7xl' : 'text-4xl'} font-bold text-slate-900 leading-tight mb-2 transition-all`}>
                            {isPitchMode ? "Scalability" : "Seed Economics"}
                        </motion.h1>
                        <p className="text-xs font-medium text-slate-400">
                            WorkMila // Startup Unit Economics
                        </p>
                    </div>
                    {!isPitchMode && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white font-semibold hover:bg-slate-50 transition-colors rounded-xl text-sm text-slate-700"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                            <button
                                onClick={() => { setIsPitchMode(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold transition-colors rounded-xl text-sm"
                            >
                                <Play size={16} fill="white" /> Pitch Mode
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className={`max-w-7xl mx-auto grid grid-cols-1 ${isPitchMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-12 transition-all duration-500`}>

                {/* Left Column: Controls (Hidden in Pitch Mode) */}
                <AnimatePresence>
                    {!isPitchMode && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50, width: 0 }}
                            className="lg:col-span-1 space-y-10"
                        >
                            <Card title="Team Structure" icon={<Users className="w-5 h-5" />}>
                                <div className="space-y-6">
                                    <Slider
                                        label="AI Engineers"
                                        value={aiEngineers}
                                        onChange={setAiEngineers}
                                        min={0} max={10}
                                        unit=""
                                    />
                                    <Slider
                                        label="Full Stack Devs"
                                        value={fullstackDevs}
                                        onChange={setFullstackDevs}
                                        min={0} max={10}
                                        unit=""
                                    />
                                </div>
                            </Card>

                            <Card title="Traffic & Mix" icon={<TrendingUp className="w-5 h-5" />}>
                                <div className="space-y-6">
                                    <Slider
                                        label="Monthly Trafffic"
                                        value={userScale}
                                        onChange={setUserScale}
                                        min={1000} max={100000}
                                        step={1000}
                                        unit=""
                                    />
                                    <Slider
                                        label="Total Conversion (%)"
                                        value={premiumConversion}
                                        onChange={setPremiumConversion}
                                        min={1} max={20}
                                        unit="%"
                                    />
                                    <Slider
                                        label="Enterprise Mix (%)"
                                        value={enterpriseMix}
                                        onChange={setEnterpriseMix}
                                        min={0} max={50}
                                        unit="%"
                                    />
                                    <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
                                        <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="text-[10px] font-medium text-slate-400 border-b border-slate-200 pb-1 mb-1">PRO</div>
                                            <div className="text-xl font-bold text-slate-900 tabular-nums">{Math.round(stats.revenue.counts.pro)}</div>
                                        </div>
                                        <div className="flex-1 p-3 bg-sky-700 text-white border border-sky-600 rounded-lg">
                                            <div className="text-[10px] font-medium text-sky-300 border-b border-sky-600 pb-1 mb-1">ENT</div>
                                            <div className="text-xl font-bold tabular-nums">{Math.round(stats.revenue.counts.enterprise)}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Ops Toggles" icon={<Zap className="w-5 h-5" />}>
                                <div className="space-y-4">
                                    <Toggle
                                        label="Third-Party QA"
                                        enabled={qaEnabled}
                                        onToggle={setQaEnabled}
                                        price={`₹${CALCULATOR_CONFIG.OPS.QA_FIXED / 1000}k`}
                                    />
                                    <Toggle
                                        label="Marketing / Ads"
                                        enabled={marketingEnabled}
                                        onToggle={setMarketingEnabled}
                                        price={`₹${CALCULATOR_CONFIG.OPS.MARKETING_FIXED / 1000}k`}
                                    />
                                    <Toggle
                                        label="Legal & Compliance"
                                        enabled={legalEnabled}
                                        onToggle={setLegalEnabled}
                                        price={`₹${CALCULATOR_CONFIG.OPS.LEGAL_FIXED / 1000}k`}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Columns: Projections */}
                <motion.div
                    layout
                    className={`${isPitchMode ? 'lg:col-span-1 max-w-5xl mx-auto w-full' : 'lg:col-span-2'} space-y-10`}
                >
                    {/* Main Stats Grid */}
                    <div className={`grid grid-cols-1 ${isPitchMode ? 'md:grid-cols-3 gap-12' : 'md:grid-cols-3 gap-8'} transition-all`}>
                        <StatCard
                            label="Monthly Burn"
                            value={`₹${stats.burn.total.toLocaleString('en-IN')}`}
                            icon={<TrendingDown className="text-red-600" />}
                            isPitchMode={isPitchMode}
                        />
                        <StatCard
                            label="Monthly Revenue"
                            value={`₹${stats.revenue.total.toLocaleString('en-IN')}`}
                            icon={<TrendingUp className="text-black" />}
                            isPrimary
                            isPitchMode={isPitchMode}
                        />
                        <StatCard
                            label="Net Profit"
                            value={`₹${stats.profit.toLocaleString('en-IN')}`}
                            icon={<DollarSign className={stats.profit > 0 ? "text-black" : "text-gray-400"} />}
                            isPitchMode={isPitchMode}
                        />
                    </div>

                    {/* Chart Card */}
                    <motion.div
                        layout
                        className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="w-3 h-3 bg-sky-600 rounded-full"></span>
                                Capital Allocation
                            </h3>
                            <span className="text-xs font-medium bg-sky-100 text-sky-700 px-3 py-1 rounded-full">Simulation Data</span>
                        </div>

                        <div className="py-6">
                            <div className="flex h-16 border border-slate-200 rounded-xl mb-10 overflow-hidden shadow-soft">
                                <BarPart value={stats.burn.human} total={stats.burn.total} color="bg-gray-100" label="Humans" breakdown={stats.breakdown.human} />
                                <BarPart value={stats.burn.tools} total={stats.burn.total} color="bg-gray-200" label="Tools" breakdown={stats.breakdown.tools} />
                                <BarPart value={stats.burn.api} total={stats.burn.total} color="bg-gray-400" label="APIs" breakdown={stats.breakdown.api} />
                                <BarPart value={stats.burn.ops} total={stats.burn.total} color="bg-gray-600" label="Ops" breakdown={stats.breakdown.ops} />
                                <BarPart value={stats.burn.infra} total={stats.burn.total} color="bg-black" label="Infra" breakdown={stats.breakdown.infra} />
                            </div>

                            <div className={`grid grid-cols-1 ${isPitchMode ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-12 text-sm`}>
                                <div className="space-y-6">
                                    <h4 className="text-slate-700 font-semibold text-xs border-b border-slate-200 pb-2">Human Capital</h4>
                                    <CostItem label="Engineering (Partner)" value={stats.burn.human} />
                                    <CostItem label="Product Infrastructure" value={stats.burn.infra} />
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-slate-700 font-semibold text-xs border-b border-slate-200 pb-2">AI Efficiency</h4>
                                    <CostItem label="Gemini Scaling Cost" value={stats.burn.api} />
                                    <CostItem label="Growth & Marketing" value={stats.burn.ops} />
                                </div>
                                {isPitchMode && (
                                    <div className="space-y-6">
                                        <h4 className="text-slate-700 font-semibold text-xs border-b border-slate-200 pb-2">Projected ROI</h4>
                                        <CostItem label="Total Monthly Revenue" value={stats.revenue.total} />
                                        <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg text-xs italic font-mono text-slate-500">
                                            ~{Math.round((stats.profit / stats.burn.total) * 100)}% Monthly Margin
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Simulation Note */}
                    <motion.div
                        layout
                        className={`bg-sky-700 text-white p-10 rounded-2xl relative overflow-hidden transition-all ${isPitchMode ? 'text-center' : ''}`}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Building2 size={240} strokeWidth={0.5} />
                        </div>
                        <h3 className={`${isPitchMode ? 'text-5xl mb-8' : 'text-2xl mb-3'} font-bold relative z-10`}>
                            The AI-Native Advantage
                        </h3>
                        <p className={`${isPitchMode ? 'text-lg max-w-4xl mx-auto' : 'text-sm max-w-2xl'} text-sky-200 leading-relaxed relative z-10`}>
                            While legacy competitors scale burn rate linearly with headcount, WorkMila scales revenue exponentially with token efficiency.
                            Our "Agent-First" workforce model ensures high-velocity feature deployment with ultra-low CapEx overhead.
                        </p>
                        {isPitchMode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-10 flex justify-center gap-16 border-t border-white/20 pt-10"
                            >
                                <Metric value="88%" label="Gross Margin" />
                                <Metric value="10:1" label="Rev/Dev Ratio" />
                                <Metric value="∞" label="Scale Capacity" />
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// Sub-components
const Metric = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
        <div className="text-5xl font-bold text-white mb-1 tabular-nums">{value}</div>
        <div className="text-xs font-medium text-sky-200">{label}</div>
    </div>
);

const Card = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div
        layout
        className="p-6 bg-white border border-slate-200 rounded-xl shadow-soft"
    >
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4 text-sky-700">
            {icon}
            <h3 className="font-semibold text-base text-slate-900">{title}</h3>
        </div>
        {children}
    </motion.div>
);

const StatCard = ({ label, value, icon, isPrimary = false, isPitchMode = false }: { label: string; value: string; icon: React.ReactNode; isPrimary?: boolean; isPitchMode?: boolean }) => (
    <motion.div
        layout
        className={`p-6 border rounded-xl transition-all ${isPrimary ? 'bg-white border-sky-200 shadow-soft-md' : 'bg-white border-slate-200 shadow-soft'} ${isPitchMode ? 'transform scale-105' : ''}`}
    >
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            {icon}
        </div>
        <div className={`${isPitchMode ? 'text-4xl' : 'text-3xl'} font-bold text-slate-900 tabular-nums transition-all`}>{value}</div>
    </motion.div>
);

const Slider = ({ label, value, onChange, min, max, unit, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string; step?: number }) => (
    <div className="space-y-3">
        <div className="flex justify-between text-xs font-medium">
            <label className="text-slate-600">{label}</label>
            <span className="bg-sky-700 text-white px-2 py-0.5 rounded tabular-nums">{value}{unit}</span>
        </div>
        <div className="relative flex items-center">
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={(e) => { onChange(Number(e.target.value)); }}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-600"
            />
        </div>
    </div>
);

const BarPart = ({ value, total, color, label, breakdown }: { value: number; total: number; color: string; label: string; breakdown?: Record<string, number> }) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    if (percent < 0.1) return null;
    return (
        <div
            style={{ width: `${percent}%` }}
            className={`${color} h-full last:border-r-0 relative group transition-all cursor-crosshair`}
        >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50 text-white text-[8px] font-semibold text-center px-1 z-10">
                {label} ({Math.round(percent)}%)
            </div>

            {/* Hover Tooltip Breakdown */}
            {breakdown && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-4 rounded-xl shadow-soft-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="font-semibold text-xs border-b border-white/20 pb-2 mb-2">{label} Breakdown</div>
                    <div className="space-y-1">
                        {Object.entries(breakdown).map(([k, v]) => v > 0 && (
                            <div key={k} className="flex justify-between text-[10px]">
                                <span className="text-slate-400">{k}</span>
                                <span className="font-semibold">₹{(v / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CostItem = ({ label, value }: { label: string; value: number }) => {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 group hover:bg-slate-50 px-2 -mx-2 rounded transition-colors">
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">{label}</span>
            <span className="font-semibold text-lg text-slate-900 tabular-nums">₹{value.toLocaleString('en-IN')}</span>
        </div>
    );
};

const Toggle = ({ label, enabled, onToggle, price }: { label: string; enabled: boolean; onToggle: (v: boolean) => void; price: string }) => {
    const handleToggle = () => { onToggle(!enabled); };
    return (
        <div
            role="button"
            tabIndex={0}
            className="flex justify-between items-center p-4 border border-slate-200 bg-white rounded-lg group select-none cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition-colors"
            onClick={handleToggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); } }}
        >
            <div>
                <div className="font-medium text-sm text-slate-800">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{price}/mo</div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-sky-600' : 'bg-slate-200'}`}>
                <motion.div
                    animate={{ x: enabled ? 24 : 2 }}
                    className="w-5 h-5 absolute top-0.5 bg-white rounded-full shadow-sm"
                />
            </div>
        </div>
    );
};

export default FinancialDashboard;

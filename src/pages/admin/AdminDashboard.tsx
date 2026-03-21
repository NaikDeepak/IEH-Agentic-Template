import { Users, Briefcase, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { name: 'Total Users', value: '1,284', icon: Users, change: '+12%', changeType: 'increase' },
    { name: 'Active Jobs', value: '156', icon: Briefcase, change: '+5%', changeType: 'increase' },
    { name: 'Total Applications', value: '4,320', icon: FileText, change: '-2%', changeType: 'decrease' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h2>
        <p className="text-xs font-medium text-slate-400">Super Admin Control Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft hover:shadow-soft-md hover:border-sky-200 transition-all duration-200">
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center">
                <stat.icon size={20} strokeWidth={1.5} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                stat.changeType === 'increase' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
              }`}>
                {stat.change}
                {stat.changeType === 'increase' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tabular-nums mb-1">{stat.value}</div>
            <div className="text-xs font-medium text-slate-400">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
            Recent Activity
          </h3>
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 mt-1.5 bg-sky-400 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">New employer registration: <span className="text-slate-500 font-normal">TechCorp Ltd.</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
            System Health
          </h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">API Latency</span>
                <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">42ms</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[95%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Search Engine Sync</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Operational</span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Database Load</span>
                <span className="text-slate-500 font-semibold">64%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[64%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { Users, Briefcase, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { name: 'Total Users', value: '1,284', icon: Users, change: '+12%', changeType: 'increase' },
    { name: 'Active Jobs', value: '156', icon: Briefcase, change: '+5%', changeType: 'increase' },
    { name: 'Total Applications', value: '4,320', icon: FileText, change: '-2%', changeType: 'decrease' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 text-sm">Welcome back to the Super Admin control center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.change}
                {stat.changeType === 'increase' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full" />
                <div>
                  <p className="text-sm text-slate-900">New employer registration: <span className="font-semibold">TechCorp Ltd.</span></p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Latency</span>
              <span className="text-sm font-medium text-emerald-600">42ms</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full w-[95%]"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Search Engine Sync</span>
              <span className="text-sm font-medium text-emerald-600">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database Load</span>
              <span className="text-sm font-medium text-amber-600">64%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full w-[64%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

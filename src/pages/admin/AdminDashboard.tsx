import { Users, Briefcase, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { name: 'Total Users', value: '1,284', icon: Users, change: '+12%', changeType: 'increase' },
    { name: 'Active Jobs', value: '156', icon: Briefcase, change: '+5%', changeType: 'increase' },
    { name: 'Total Applications', value: '4,320', icon: FileText, change: '-2%', changeType: 'decrease' },
  ];

  return (
    <div className="space-y-8 font-sans text-black">
      <div className="border-b-2 border-black pb-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">Dashboard Overview</h2>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">Super Admin Control Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black">
                <stat.icon size={24} strokeWidth={1.5} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider px-2 py-1 border-2 border-black ${
                stat.changeType === 'increase' ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {stat.change}
                {stat.changeType === 'increase' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="text-5xl font-black tracking-tighter mb-2">{stat.value}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-2 border-black p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-black"></span>
            Recent Activity
          </h3>
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b-2 border-gray-100 last:border-0 group hover:bg-gray-50 transition-colors -mx-4 px-4">
                <div className="w-2 h-2 mt-2 bg-black" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">New employer registration: <span className="text-gray-500">TechCorp Ltd.</span></p>
                  <p className="font-mono text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-black p-8">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-black"></span>
            System Health
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
                <span>API Latency</span>
                <span className="bg-black text-white px-2 py-0.5">42ms</span>
              </div>
              <div className="w-full h-4 border-2 border-black p-0.5">
                <div className="h-full bg-black w-[95%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
                <span>Search Engine Sync</span>
                <span className="bg-black text-white px-2 py-0.5">Operational</span>
              </div>
              <div className="w-full h-4 border-2 border-black bg-black flex items-center justify-center">
                 <span className="text-[8px] text-white uppercase tracking-[0.2em]">All Systems Go</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
                <span>Database Load</span>
                <span>64%</span>
              </div>
              <div className="w-full h-4 border-2 border-black p-0.5">
                <div className="h-full bg-gray-400 w-[64%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

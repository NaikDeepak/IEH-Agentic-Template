import { LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-white text-black min-h-screen p-0 flex flex-col border-r-2 border-black">
      <div className="h-20 flex items-center px-6 border-b-2 border-black">
        <div className="text-xl font-black uppercase tracking-tighter">IEH Admin</div>
      </div>
      <nav className="flex-1 p-6">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center space-x-3 p-3 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all group"
              >
                <item.icon size={18} className="stroke-[2px]" />
                <span className="font-mono text-sm font-bold uppercase tracking-wider">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t-2 border-black">
        <button className="flex items-center space-x-3 p-3 w-full text-left border-2 border-black hover:bg-black hover:text-white transition-colors">
          <Settings size={18} className="stroke-[2px]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

import { LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col border-r border-slate-200 shadow-soft">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2.5">
        <div className="w-8 h-8 bg-sky-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">WM</span>
        </div>
        <span className="font-semibold text-slate-900 text-sm">WorkMila Admin</span>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <item.icon size={16} />
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors">
          <Settings size={16} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

import { LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8 px-2">IEH Admin</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pt-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 p-2 w-full text-left rounded-lg hover:bg-slate-800 transition-colors">
          <Settings size={20} />
          <span>Profile Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

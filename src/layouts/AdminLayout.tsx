import type { ReactNode, FC } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-base font-bold text-slate-900">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Welcome, Admin</span>
            <div className="w-8 h-8 bg-sky-700 text-white rounded-lg flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </header>
        <main className="p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

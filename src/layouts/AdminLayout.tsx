import type { ReactNode, FC } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800">Super Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Welcome, Admin</span>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
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

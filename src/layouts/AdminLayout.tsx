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
        <header className="h-20 bg-white border-b-2 border-black flex items-center justify-between px-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Super Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Welcome, Admin</span>
            <div className="w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center font-bold font-mono">
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

import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="py-6 bg-white border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Snow Safety App. All rights reserved.</p>
          <p className="mt-2">Helping communities stay safe in snowy conditions.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 
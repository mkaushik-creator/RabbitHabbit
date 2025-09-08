import { useLocation } from 'wouter';

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    setLocation(path);
  };

  return (
    <nav id="bottomNav" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:px-6 z-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between">
          <button 
            className={`nav-btn flex flex-col items-center py-1 px-3 ${location === '/home' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => handleNavigation('/home')}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            className={`nav-btn flex flex-col items-center py-1 px-3 ${location === '/dashboard' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            <i className="fas fa-chart-bar text-lg"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button 
            className={`nav-btn flex flex-col items-center py-1 px-3 ${location === '/post-generator' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => handleNavigation('/post-generator')}
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center -mt-6">
              <i className="fas fa-plus text-lg"></i>
            </div>
            <span className="text-xs mt-1">Create</span>
          </button>
          
          <button 
            className={`nav-btn flex flex-col items-center py-1 px-3 ${location === '/onboarding' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => handleNavigation('/onboarding')}
          >
            <i className="fas fa-magic text-lg"></i>
            <span className="text-xs mt-1">Wizard</span>
          </button>
          
          <button className="nav-btn flex flex-col items-center py-1 px-3 text-gray-500">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

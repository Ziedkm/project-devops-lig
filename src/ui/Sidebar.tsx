// src/ui/TheSidebar.tsx (Corrected)

import { type CSSProperties } from 'react'; // Removed unused useState
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { getSupabase } from '../config/supabaseClient';
const supabase = getSupabase();
import { 
  LayoutDashboard, Calendar, Target, Settings, LogOut, Users, History,
  ChevronLeft, Menu, Shield,
} from 'lucide-react';

// --- CHANGE #1: Update the props interface to expect `onToggle` ---
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// --- CHANGE #2: Accept `onToggle` in the component signature ---
function TheSidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useUser();
  
  const isCollapsed = !isOpen;

 // useEffect(() => {
    // On mobile, if the sidebar is open, close it on navigation.
    // We call onToggle only if it's currently open to avoid unwanted toggles.
   // if (isOpen && window.innerWidth < 768) {
    //    onToggle(); 
   // }
 // }, [location.pathname, isOpen, onToggle]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const userDisplayName = user?.email ? user.email.split('@')[0] : 'Utilisateur';

  // ... (rest of your component code is the same)
  const menuItems = [
    {
      section: 'Menu Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'calendar', label: 'Calendrier', icon: Calendar, path: '/calendar' },
        { id: 'missions', label: 'Missions', icon: Target, path: '/missions' },
      ]
    },
    ...(role === 'admin' ? [{
      section: 'Administration',
      items: [
        { id: 'employees', label: 'Employés', icon: Users, path: '/admin/employees' },
        { id: 'history', label: 'Historique', icon: History, path: '/admin/history' },
      ]
    }] : [])
  ];

 const sidebarStyle: CSSProperties = {
  width: isCollapsed ? '5rem' : '18rem',
  height: '100vh',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
  boxShadow: '0 0 40px 0 rgba(0,0,0,0.08)',
  borderRight: '1px solid rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column' as const,
  position: 'fixed',
  top: 0,
  left: 0,
  overflow: 'hidden',
  transition: 'width 0.3s ease-in-out, transform 0.3s ease-in-out',
  flexShrink: 0,
  zIndex: 1400,
};



  return (
    <div className="the-sidebar" style={sidebarStyle}>
      {/* Background animation */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', animation: 'gradientShift 15s ease infinite' }}/>
      </div>

      {/* Header */}
      <div style={{
        padding: '20px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.08)', minHeight: '80px', position: 'relative', zIndex: 10
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundImage: 'url(https://i.ibb.co/bMqmQrnm/logo-white.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                PerformaIT
              </h1>
            </div>
          </div>
        )}
        {/* --- CHANGE #3: The button now calls the onToggle function --- */}
        <button onClick={onToggle}
          style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(25, 118, 210, 0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* The rest of your component remains exactly the same... */}
      {/* ... navigation menu, footer, styles, etc ... */}
       <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0', position: 'relative', zIndex: 10 }}>
        {menuItems.map((section) => (
          <div key={section.section} style={{ marginBottom: '24px' }}>
            {!isCollapsed && (
              <h2 style={{ padding: '0 24px', marginBottom: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a5b7' }}>
                {section.section}
              </h2>
            )}
            <div style={{ padding: '0 12px' }}>
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button key={item.id} onClick={() => navigate(item.path)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', marginBottom: '4px',
                      border: 'none', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent', borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                      color: isActive ? '#1976d2' : '#5e6278', fontWeight: isActive ? '600' : '500'
                    }}
                  >
                    <item.icon size={20} style={{ color: isActive ? '#1976d2' : '#8a92a6', flexShrink: 0 }} />
                    {!isCollapsed && <span style={{ flex: 1, textAlign: 'left', fontSize: '14px' }}>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied de page */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px', position: 'relative', zIndex: 10 }}>
        <button onClick={() => navigate('/settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', marginBottom: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
            backgroundColor: location.pathname === '/settings' ? 'rgba(25, 118, 210, 0.08)' : 'transparent', color: location.pathname === '/settings' ? '#1976d2' : '#5e6278',
            fontWeight: location.pathname === '/settings' ? '600' : '500', transition: 'all 0.3s ease'
          }}
        >
          <Settings size={20} style={{ color: location.pathname === '/settings' ? '#1976d2' : '#8a92a6' }} />
          {!isCollapsed && <span style={{ flex: 1, textAlign: 'left', fontSize: '14px' }}>Paramètres</span>}
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: '12px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)', border: '1px solid rgba(25, 118, 210, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)' }}>{userInitial}</div>
              {role === 'admin' && <Shield style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', padding: '2px', color: '#ffa726' }} />}
            </div>
            {!isCollapsed && (
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#3f4254', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{userDisplayName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#a1a5b7', textTransform: 'capitalize' }}>{role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && <button onClick={handleLogout} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(244, 67, 54, 0.08)', color: '#f44336', cursor: 'pointer' }}><LogOut size={16} /></button>}
        </div>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .the-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
      width: 18rem !important;
    }
  }
  @keyframes shimmer { 0% { transform: translateX(-100%) translateY(100%); } 100% { transform: translateX(100%) translateY(-100%); } }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); } }
  @keyframes gradientShift { 0%, 100% { transform: rotate(0deg) scale(1.5); } 50% { transform: rotate(180deg) scale(2); } }
`}</style>

    </div>
  );
}

export default TheSidebar;
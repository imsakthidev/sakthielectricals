import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { POSProvider, usePOS } from '../context/POSContext';
import { LayoutDashboard, Receipt, BarChart3, Package, Settings, LogOut, KeyRound, Grid3X3, Trash2 } from 'lucide-react';
import PatternLock from '../components/PatternLock';

// Import sub-pages
import Dashboard from './pos/Dashboard';
import BillNow from './pos/BillNow';
import Reports from './pos/Reports';
import ManageItems from './pos/ManageItems';
import POSSettings from './pos/POSSettings';
import Bin from './pos/Bin';

const AuthLock = ({ children }) => {
  const { appPin, appPattern } = usePOS();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockType, setLockType] = useState('pattern'); // Default to pattern as requested
  const [pinEntry, setPinEntry] = useState('');

  const handlePatternComplete = (pattern) => {
    if (pattern.length >= 4) {
      if (JSON.stringify(pattern) === JSON.stringify(appPattern)) {
        setIsUnlocked(true);
      }
    }
  };

  const handleKeypad = (num) => {
    if (pinEntry.length < 4) {
      const newPin = pinEntry + num;
      setPinEntry(newPin);
      if (newPin.length === 4) {
        if (newPin === appPin) {
          setIsUnlocked(true);
        } else {
          alert('Incorrect PIN');
          setPinEntry('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPinEntry(prev => prev.slice(0, -1));
  };

  if (isUnlocked) return children;

  return (
    <div className="auth-overlay">
      <div className="auth-card glass" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary)' }}>Sakthi Electricals</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Draw pattern to unlock</p>
        
        <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {lockType === 'pin' ? (
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div className="pin-display">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`pin-dot ${pinEntry.length > i ? 'filled' : ''}`}></div>
                ))}
              </div>
              
              <div className="keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button key={num} className="key-btn" onClick={() => handleKeypad(num.toString())}>{num}</button>
                ))}
                <button className="key-btn" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}></button>
                <button className="key-btn" onClick={() => handleKeypad('0')}>0</button>
                <button className="key-btn" onClick={handleDelete}>⌫</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '300px', height: '300px', position: 'relative' }}>
              <PatternLock onComplete={handlePatternComplete} />
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setLockType(t => t === 'pin' ? 'pattern' : 'pin')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            {lockType === 'pin' ? <><Grid3X3 size={20} /> Use Pattern Lock</> : <><KeyRound size={20} /> Use PIN Lock</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const POSLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/bill', icon: <Receipt size={20} />, label: 'Bill Now' },
    { path: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
    { path: '/manage', icon: <Package size={20} />, label: 'Inventory' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/bin', icon: <Trash2 size={20} />, label: 'Bin' },
  ];

  return (
    <div className="pos-app-container">
      <aside className="pos-sidebar">
        <div className="pos-sidebar-header" style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', lineHeight: '1.2' }}>Sakthi Electricals</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Billing System</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className="nav-btn"
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                  borderRadius: 'var(--radius-sm)', border: 'none',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon} <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <button className="nav-btn nav-logout" onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--danger)', fontWeight: '500', cursor: 'pointer', marginTop: 'auto' }}>
          <LogOut size={20} /> <span className="nav-label">Lock System</span>
        </button>
      </aside>
      
      <main className="pos-main">
        <div className="pos-content">
          {children}
        </div>
      </main>
    </div>
  );
};

const POSAppContent = () => {
  return (
    <AuthLock>
      <POSLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bill" element={<BillNow />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/manage" element={<ManageItems />} />
          <Route path="/settings" element={<POSSettings />} />
          <Route path="/bin" element={<Bin />} />
        </Routes>
      </POSLayout>
    </AuthLock>
  );
};

const POSApp = () => {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
};

export default POSApp;

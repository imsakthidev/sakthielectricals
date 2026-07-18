import React from 'react';
import { usePOS } from '../../context/POSContext';
import { IndianRupee, FileText, PackageOpen, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { bills, items } = usePOS();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const todaysBills = bills.filter(b => new Date(b.date).toDateString() === today);
  const todayTotal = todaysBills.reduce((acc, bill) => acc + bill.total, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthBills = bills.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthBills.reduce((acc, bill) => acc + bill.total, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of today's business</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
            <IndianRupee size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Sales</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>₹{todayTotal}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', color: 'white' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>This Month</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>₹{thisMonthTotal}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '50%', color: 'var(--warning)' }}>
            <FileText size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Bills Generated</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{todaysBills.length}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '50%', color: 'var(--success)' }}>
            <PackageOpen size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Products in Store</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{items.length}</h2>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-dark)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/bill')} className="btn-primary" style={{ padding: '1rem 2rem', background: 'var(--card-bg)', color: 'var(--text-dark)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            + New Bill
          </button>
          <button onClick={() => navigate('/manage')} className="btn-primary" style={{ padding: '1rem 2rem', background: 'var(--card-bg)', color: 'var(--text-dark)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            + Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

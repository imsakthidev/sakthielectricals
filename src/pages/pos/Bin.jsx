import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

const Bin = () => {
  const { deletedBills, restoreFromBin, deletePermanently } = usePOS();
  
  const sortedDeleted = [...deletedBills].sort((a,b) => b.id - a.id);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--danger)' }}>Trash Bin</h1>
        <p style={{ color: 'var(--text-muted)' }}>Deleted bills are kept here. You can restore or permanently delete them.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', padding: '1rem' }}>
        {sortedDeleted.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {sortedDeleted.map((bill, i) => {
              const d = new Date(bill.date);
              return (
                <li key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: i === sortedDeleted.length - 1 ? 'none' : '1px solid var(--border-color)', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {d.getDate()} {d.toLocaleString('default', { month: 'short' })} • {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.4', color: 'var(--text-dark)' }}>{bill.summary}</p>
                    <span style={{ fontWeight: '700', color: 'var(--danger)', fontSize: '1.1rem', display: 'block', marginTop: '0.25rem' }}>₹{bill.total}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => restoreFromBin(bill.id)} 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <RotateCcw size={16} /> Restore
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm("Delete this bill permanently? This action cannot be undone.")) {
                          deletePermanently(bill.id);
                        }
                      }} 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', color: 'var(--danger)' }} />
            <p>Your trash bin is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bin;

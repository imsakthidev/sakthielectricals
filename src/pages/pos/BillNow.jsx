import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ShoppingCart, Printer, CheckCircle, Trash2, X } from 'lucide-react';

const BillNow = () => {
  const { items, cart, updateQty, clearCart, cartTotal, confirmPayment, savedQR, bills } = usePOS();
  const [showPayment, setShowPayment] = useState(false);


  const handlePay = () => {
    if (cartTotal === 0) return alert('Please add items to bill.');
    setShowPayment(true);
  };

  const handleConfirmAndPrint = async (print) => {
    const newBill = await confirmPayment();
    if (print) {
      const printSection = document.getElementById('print-section');
      if (!printSection) {
        const div = document.createElement('div');
        div.id = 'print-section';
        document.body.appendChild(div);
      }
      
      document.getElementById('print-section').innerHTML = `
        <div style="text-align: center; font-family: monospace; color: #000;">
          <h2 style="margin: 0 0 5px 0; font-size: 1.5rem;">⚡ Sakthi Electricals</h2>
          <p style="margin: 0 0 5px 0; font-size: 0.9rem;">Thangammalpuram, Theni</p>
          <p style="margin: 0 0 15px 0; font-size: 0.9rem; font-weight: 500;">Ph: +91 9585992141</p>
          <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 15px; text-align: left; font-size: 0.95rem;">
            <div style="margin-bottom: 5px;">Date: ${new Date(newBill.date).toLocaleString()}</div>
            <div>Bill No: ${newBill.id}</div>
          </div>
          <div style="text-align: left; margin-bottom: 15px; font-size: 0.95rem; border-bottom: 1px dashed #000; padding-bottom: 15px;">
            ${newBill.summary.split(', ').map((item) => `<div style="margin-bottom: 5px;">${item}</div>`).join('')}
          </div>
          <div style="font-size: 1.2rem; font-weight: bold; display: flex; justify-content: space-between;">
            <span>Total:</span> <span>₹${newBill.total}</span>
          </div>
          <div style="margin-top: 25px; font-size: 0.85rem;">
            <p>Thank you for shopping with us!</p>
            <p>Please visit again.</p>
          </div>
        </div>
      `;
      setTimeout(() => {
        window.print();
        setShowPayment(false);
      }, 100);
    } else {
      setShowPayment(false);
    }
  };
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>Bill Now</h1>
        <p style={{ color: 'var(--text-muted)' }}>Tap items to add to cart</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem', paddingBottom: '120px', overflowY: 'auto' }}>
        {items.map(item => {
          const qty = cart[item.id] || 0;
          return (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', border: qty > 0 ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
              <div style={{ width: '100%', height: '120px', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {item.photo ? <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem' }}>🔌</span>}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', flex: 1 }}>{item.name}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.2rem', marginBottom: '1rem' }}>₹{item.price}</p>
              
              {qty > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '100px', padding: '0.25rem' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>-</button>
                  <span style={{ fontWeight: '600' }}>{qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>+</button>
                </div>
              ) : (
                <button onClick={() => updateQty(item.id, 1)} className="btn-primary" style={{ padding: '0.75rem', width: '100%', fontSize: '0.9rem' }}>Add to Cart</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cart Bottom Bar */}
      <div className="glass" style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <button onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <Trash2 size={20} /> Clear
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Total Amount</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>₹{cartTotal}</h2>
        </div>
        <button onClick={handlePay} className="btn-primary" style={{ padding: '1rem 2.5rem', background: 'var(--success)' }}>
          Pay Now <CheckCircle size={20} />
        </button>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="auth-overlay">
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-2rem' }}>
              <button onClick={() => setShowPayment(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Payment Collection</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Amount to collect</p>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '2rem' }}>₹{cartTotal}</h1>
            
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '2rem', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {savedQR ? <img src={savedQR} alt="UPI QR" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} /> : <p style={{ color: 'var(--text-muted)' }}>No QR Code Uploaded</p>}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleConfirmAndPrint(false)} className="btn-primary" style={{ flex: 1, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                Save Only
              </button>
              <button onClick={() => handleConfirmAndPrint(true)} className="btn-primary" style={{ flex: 1.5, background: 'var(--primary)', padding: '1rem' }}>
                <Printer size={20} /> Save & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Template (Hidden normally) */}
      <div id="print-section"></div>
    </div>
  );
};

export default BillNow;

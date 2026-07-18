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

  const handleConfirmAndPrint = (print) => {
    const newBill = confirmPayment();
    if (print && newBill) {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
  
      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Receipt ${newBill.id}</title>
            <style>
              @page { size: 105mm 148mm; margin: 0; }
              html, body { width: 105mm; min-height: 148mm; margin: 0; padding: 0; }
              body { font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 10mm; color: #000; box-sizing: border-box; }
              h2 { margin: 0 0 5px 0; font-size: 1.5rem; text-align: center; }
              p { margin: 0 0 5px 0; font-size: 0.9rem; text-align: center; }
              .info { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 15px; }
              .items { border-bottom: 1px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
              .total { font-size: 1.2rem; font-weight: bold; display: flex; justify-content: space-between; }
              .footer { margin-top: 25px; font-size: 0.85rem; text-align: center; }
            </style>
          </head>
          <body>
            <h2>⚡ Sakthi Electricals</h2>
            <p>Thangammalpuram, Theni</p>
            <p style="font-weight: 500; margin-bottom: 15px;">Ph: +91 9585992141</p>
            <div class="info">
              <div style="margin-bottom: 5px;">Date: ${new Date(newBill.date).toLocaleString()}</div>
              <div>Bill No: ${newBill.id}</div>
            </div>
            <div class="items">
              ${newBill.summary.split(', ').map((item) => `<div style="margin-bottom: 5px;">${item}</div>`).join('')}
            </div>
            <div class="total">
              <span>Total:</span> <span>₹${newBill.total}</span>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>Please visit again.</p>
            </div>
          </body>
        </html>
      `);
      doc.close();
  
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
      
      setShowPayment(false);
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

      <div className="scroll-area-pos" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem', paddingBottom: '120px', overflowY: 'auto' }}>
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

    </div>
  );
};

export default BillNow;

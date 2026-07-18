import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Download, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { bills, moveToBin } = usePOS();
  
  const [swipedId, setSwipedId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [activeTouchId, setActiveTouchId] = useState(null);
  const [isMouseDrag, setIsMouseDrag] = useState(false);
  
  const handleTouchStart = (e, id, isMouse = false) => {
    setTouchStartX(isMouse ? e.clientX : e.targetTouches[0].clientX);
    setActiveTouchId(id);
    if (isMouse) setIsMouseDrag(true);
  };
  
  const handleTouchMove = (e, isMouse = false) => {
    if (isMouse && !isMouseDrag) return;
    if (touchStartX !== null) {
      setTouchEndX(isMouse ? e.clientX : e.targetTouches[0].clientX);
    }
  };
  
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const deltaX = touchStartX - touchEndX;
      // If swiped left more than 50px
      if (deltaX > 50) {
        setSwipedId(activeTouchId);
      } 
      // If swiped right to close
      else if (deltaX < -50 && swipedId === activeTouchId) {
        setSwipedId(null);
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setActiveTouchId(null);
    setIsMouseDrag(false);
  };

  const todayStr = new Date().toDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  let tAmt = 0, tCount = 0, mAmt = 0, mCount = 0;
  
  const sortedBills = [...bills].sort((a,b) => b.id - a.id);
  
  sortedBills.forEach(bill => {
    const d = new Date(bill.date);
    if(d.toDateString() === todayStr) { tAmt += bill.total; tCount++; }
    if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) { mAmt += bill.total; mCount++; }
  });

  const downloadExcel = () => {
    if(bills.length === 0) return alert("No data to export.");
    const exportData = bills.map(b => {
        const d = new Date(b.date);
        return {
            "Date": d.toLocaleDateString(),
            "Time": d.toLocaleTimeString(),
            "Items Sold": b.summary,
            "Total Amount (INR)": b.total
        };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `Sakthi_Electricals_Sales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadPDF = () => {
    if(bills.length === 0) return alert("No data to export.");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Sakthi Electricals - Sales Report", 10, 20);
    doc.setFontSize(12);
    
    let y = 35;
    bills.forEach((b) => {
        const d = new Date(b.date);
        const line = `${d.toLocaleDateString()} ${d.toLocaleTimeString()} - Rs.${b.total} - ${b.summary}`;
        const splitText = doc.splitTextToSize(line, 190);
        doc.text(splitText, 10, y);
        y += (splitText.length * 7) + 3;
        if (y >= 280) { doc.addPage(); y = 20; }
    });
    
    doc.save(`Sakthi_Electricals_Sales_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const printReceipt = (bill) => {
    // Basic approach: write to hidden div and trigger print. 
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
          <title>Receipt ${bill.id}</title>
          <style>
            @page { size: A6; margin: 0; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 10mm; margin: 0; color: #000; }
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
            <div style="margin-bottom: 5px;">Date: ${new Date(bill.date).toLocaleString()}</div>
            <div>Bill No: ${bill.id}</div>
          </div>
          <div class="items">
            ${bill.summary.split(', ').map((item) => `<div style="margin-bottom: 5px;">${item}</div>`).join('')}
          </div>
          <div class="total">
            <span>Total:</span> <span>₹${bill.total}</span>
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
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sales summaries and history</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={downloadExcel} className="btn-primary" style={{ padding: '0.5rem 1rem', background: '#059669', borderRadius: 'var(--radius-sm)' }}><Download size={16} /> Excel</button>
          <button onClick={downloadPDF} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}><Download size={16} /> PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Today</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>₹{tAmt}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{tCount} bills</p>
        </div>
        <div className="card">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>This Month</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>₹{mAmt}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{mCount} bills</p>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-dark)' }}>Bill History</h3>
      
      <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', overflowX: 'hidden' }}>
        {sortedBills.length > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {sortedBills.map((bill, i) => {
              const d = new Date(bill.date);
              const isSwiped = swipedId === bill.id;
              
              return (
                <li key={bill.id} style={{ position: 'relative', borderBottom: i === sortedBills.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                  {/* Background Delete Button */}
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100px', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => {
                        if (window.confirm("Move to Bin?")) {
                          moveToBin(bill.id);
                          setSwipedId(null);
                        }
                      }} 
                      style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', width: '100%', height: '100%', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Foreground Content */}
                  <div 
                    onTouchStart={(e) => handleTouchStart(e, bill.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={(e) => handleTouchStart(e, bill.id, true)}
                    onMouseMove={(e) => handleTouchMove(e, true)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    style={{ 
                      position: 'relative', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem 1.5rem', 
                      background: 'var(--card-bg)',
                      transform: `translateX(${isSwiped ? -100 : 0}px)`,
                      transition: touchStartX === null ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                      zIndex: 2
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {d.getDate()} {d.toLocaleString('default', { month: 'short' })} • {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{bill.summary}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{bill.total}</span>
                      <button onClick={() => printReceipt(bill)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-color)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text-dark)' }}>
                        <Printer size={14} /> Print
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No bills generated yet.</p>
          </div>
        )}
      </div>
      <div id="print-section"></div>
    </div>
  );
};

export default Reports;

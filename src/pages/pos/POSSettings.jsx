import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { QrCode, Lock, Trash2, Grid3X3 } from 'lucide-react';
import PatternLock from '../../components/PatternLock';

const POSSettings = () => {
  const { savedQR, setSavedQR, setAppPin, setAppPattern } = usePOS();
  
  const [newPin, setNewPinLocal] = useState('');
  const [isChangingPattern, setIsChangingPattern] = useState(false);

  const handleNewPattern = (pattern) => {
    if (pattern.length < 4) {
      alert("Pattern too short! Connect at least 4 dots.");
      return;
    }
    setAppPattern(pattern);
    alert("New pattern saved successfully!");
    setIsChangingPattern(false);
  };
  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; 
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width; width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height; height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setSavedQR(canvas.toDataURL('image/jpeg', 0.8));
        alert("QR Code Saved Successfully!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePin = () => {
    if (newPin.length >= 4) {
      setAppPin(newPin);
      alert("PIN Updated Successfully!");
      setNewPinLocal('');
    } else {
      alert("Enter at least 4 digits.");
    }
  };



  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure POS application</p>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '50%', color: 'var(--primary)' }}><QrCode size={24} /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Payment QR Code</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload your UPI QR code to display during checkout.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {savedQR && (
              <div style={{ width: '100px', height: '100px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={savedQR} alt="Saved QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <label className="btn-primary" style={{ display: 'inline-flex', cursor: 'pointer', fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}>
              Upload New QR
              <input type="file" accept="image/*" onChange={handleQRUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '50%', color: 'var(--primary)' }}><Lock size={24} /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Security PIN & Pattern</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Change the 4-digit PIN required to unlock the POS system.</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter new 4-digit PIN" 
              maxLength="4" 
              value={newPin}
              onChange={(e) => setNewPinLocal(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ flex: 1 }}
            />
            <button onClick={handleUpdatePin} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Update PIN</button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '1rem' }}>Change the unlock pattern.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isChangingPattern ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsChangingPattern(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                  Set New Pattern
                </button>
                <button onClick={() => {
                  const newP = window.prompt("To reset pattern to default (Z shape), type RESET");
                  if (newP === 'RESET') {
                    setAppPattern([0, 1, 2, 4, 6, 7, 8]);
                    alert("Pattern reset to default.");
                  }
                }} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', background: 'var(--bg-color)', color: 'var(--text-dark)' }}>
                  Reset to Default
                </button>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '1rem', background: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Draw new pattern (min 4 dots)</p>
                  <button onClick={() => setIsChangingPattern(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                </div>
                <div style={{ width: '250px', height: '250px', margin: '0 auto', background: 'var(--card-bg)', borderRadius: 'var(--radius)' }}>
                  <PatternLock onComplete={handleNewPattern} />
                </div>
              </div>
            )}
          </div>
        </div>



      </div>
    </div>
  );
};

export default POSSettings;

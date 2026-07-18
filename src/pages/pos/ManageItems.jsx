import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Trash2, ImagePlus } from 'lucide-react';

const ManageItems = () => {
  const { items, addItem, deleteItem } = usePOS();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300; 
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
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    if (!name || isNaN(parseInt(price))) return alert("Enter valid name and price");
    
    const newItem = {
      id: Date.now(),
      name,
      price: parseInt(price),
      photo: photoUrl
    };
    
    addItem(newItem);
    setName('');
    setPrice('');
    setPhotoUrl('');
    alert("Product Added!");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)' }}>Manage Inventory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Add or remove products</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Add New Product</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Product Name</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. LED Bulb 9W" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Price (₹)</label>
            <input type="number" className="input-field" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Photo</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '500' }}>
                <ImagePlus size={20} /> Select Image
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {photoUrl && <img src={photoUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button onClick={handleAddItem} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>+ Add Item</button>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-dark)' }}>Current Inventory</h3>
      <div className="scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.photo ? <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🔌</span>}
                </div>
                <div>
                  <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{item.price}</p>
                </div>
              </div>
              <button onClick={() => { if(window.confirm("Delete this product?")) deleteItem(item.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageItems;

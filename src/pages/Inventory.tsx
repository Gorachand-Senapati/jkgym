import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../context/GymContext';
import { Plus, Edit2, ShoppingCart } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { inventory, addProduct, updateProduct, sellProduct } = useGym();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<any>({
    id: '', name: '', stockQty: '', purchasePrice: '', sellingPrice: ''
  });

  const [sellData, setSellData] = useState<{ productId: string, qty: number, method: 'cash'|'online'|'split', cashAmount: string, onlineAmount: string }>({ productId: '', qty: 1, method: 'cash', cashAmount: '', onlineAmount: '' });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...formData, stockQty: Number(formData.stockQty), purchasePrice: Number(formData.purchasePrice), sellingPrice: Number(formData.sellingPrice) });
    } else {
      addProduct({ ...formData, id: `P${Date.now()}`, stockQty: Number(formData.stockQty), purchasePrice: Number(formData.purchasePrice), sellingPrice: Number(formData.sellingPrice) });
    }
    setShowModal(false);
  };

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory.find(p => p.id === sellData.productId);
    if (!product) return;
    
    const totalAmount = product.sellingPrice * sellData.qty;
    let finalCashAmount: number | undefined = undefined;
    let finalOnlineAmount: number | undefined = undefined;

    if (sellData.method === 'split') {
      finalCashAmount = Number(sellData.cashAmount);
      finalOnlineAmount = Number(sellData.onlineAmount);
      
      if (finalCashAmount + finalOnlineAmount !== totalAmount) {
        showAlert('Cash and Online amounts must equal the Total Amount', 'error');
        return;
      }
    }

    sellProduct(sellData.productId, sellData.qty, sellData.method, currentUser?.id, finalCashAmount, finalOnlineAmount);
    showAlert('Product sold successfully! Stock decreased automatically.', 'success');
    setShowSellModal(false);
    setSellData({ productId: '', qty: 1, method: 'cash', cashAmount: '', onlineAmount: '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Supplement Products</h1>
          <p>Manage gym inventory and sales</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={() => { 
            const firstAvailable = inventory.find(p => p.stockQty > 0);
            setSellData({...sellData, productId: firstAvailable?.id || '', qty: 1}); 
            setShowSellModal(true); 
          }}>
            <ShoppingCart size={18} /> Sell Product
          </button>
          <button className="btn btn-primary" onClick={() => {
            setEditingProduct(null);
            setFormData({ id: '', name: '', stockQty: '', purchasePrice: '', sellingPrice: '' });
            setShowModal(true);
          }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Stock Qty</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Total Stock Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(p => (
              <tr key={p.id}>
                <td className="font-bold text-accent">{p.id}</td>
                <td>{p.name}</td>
                <td>
                  <span className={`badge ${p.stockQty > 10 ? 'badge-success' : 'badge-danger'}`}>
                    {p.stockQty} units
                  </span>
                </td>
                <td>₹{p.purchasePrice}</td>
                <td>₹{p.sellingPrice}</td>
                <td className="font-bold text-success">₹{p.stockQty * p.purchasePrice}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEditClick(p)}>
                    <Edit2 size={16} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="m-0">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group m-0 mb-4">
                <label>Product Name *</label>
                <input type="text" className="input-field" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="input-group m-0">
                  <label>Stock Qty *</label>
                  <input type="number" className="input-field" required 
                    value={formData.stockQty} onChange={e => setFormData({...formData, stockQty: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Purchase Price (₹) *</label>
                  <input type="number" className="input-field" required 
                    value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Selling Price (₹) *</label>
                  <input type="number" className="input-field" required 
                    value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="m-0">Sell Product</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowSellModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSell}>
              <div className="input-group">
                <label>Select Product</label>
                <select className="input-field" required value={sellData.productId} onChange={e => setSellData({...sellData, productId: e.target.value})}>
                  {inventory.filter(p=>p.stockQty > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQty})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Quantity</label>
                <input type="number" className="input-field" required min="1" max={inventory.find(p=>p.id===sellData.productId)?.stockQty || 1}
                  value={sellData.qty} onChange={e => setSellData({...sellData, qty: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Payment Method</label>
                <select className="input-field" value={sellData.method} onChange={e => {
                  const method = e.target.value as any;
                  const product = inventory.find(p => p.id === sellData.productId);
                  const totalAmount = product ? product.sellingPrice * sellData.qty : 0;
                  setSellData({
                    ...sellData, 
                    method, 
                    cashAmount: method === 'split' ? totalAmount.toString() : '',
                    onlineAmount: method === 'split' ? '0' : ''
                  });
                }}>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="split">Cash + Online (Split)</option>
                </select>
              </div>

              {sellData.method === 'split' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="input-group">
                    <label>Cash Amount (₹)</label>
                    <input type="number" className="input-field" required 
                      value={sellData.cashAmount} 
                      onChange={e => {
                        const product = inventory.find(p => p.id === sellData.productId);
                        const total = product ? product.sellingPrice * sellData.qty : 0;
                        const cash = Number(e.target.value) || 0;
                        setSellData({...sellData, cashAmount: e.target.value, onlineAmount: Math.max(0, total - cash).toString()});
                      }} 
                    />
                  </div>
                  <div className="input-group">
                    <label>Online Amount (₹)</label>
                    <input type="number" className="input-field" required 
                      value={sellData.onlineAmount} 
                      onChange={e => {
                        const product = inventory.find(p => p.id === sellData.productId);
                        const total = product ? product.sellingPrice * sellData.qty : 0;
                        const online = Number(e.target.value) || 0;
                        setSellData({...sellData, onlineAmount: e.target.value, cashAmount: Math.max(0, total - online).toString()});
                      }} 
                    />
                  </div>
                </div>
              )}
              
              {inventory.find(p=>p.id===sellData.productId) && (
                <div className="mt-4 mb-2 font-bold text-success text-center border-t border-gray-700 pt-3">
                  Total Bill: ₹{inventory.find(p=>p.id===sellData.productId)!.sellingPrice * sellData.qty}
                </div>
              )}

              <button type="submit" className="btn btn-success w-full mt-2">Confirm Sale</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

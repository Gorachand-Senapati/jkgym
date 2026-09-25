import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import type { TherapySession } from '../context/GymContext';
import { Plus, Send, Download } from 'lucide-react';
import { generateTherapyPDF } from '../utils/pdfGenerator';

export const Therapy: React.FC = () => {
  const { therapySessions, addTherapySession } = useGym();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TherapySession>({
    id: '', date: new Date().toISOString().split('T')[0], clientName: '', whatsapp: '', therapyName: '', amount: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'online'|'split'>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [onlineAmount, setOnlineAmount] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalCashAmount: number | undefined = undefined;
    let finalOnlineAmount: number | undefined = undefined;

    if (paymentMethod === 'split') {
      finalCashAmount = Number(cashAmount);
      finalOnlineAmount = Number(onlineAmount);
      
      if (finalCashAmount + finalOnlineAmount !== formData.amount) {
        alert('Cash and Online amounts must equal the Total Amount');
        return;
      }
    }

    const newSession = { ...formData, id: `TS${Date.now()}` };
    addTherapySession(newSession, paymentMethod, currentUser?.id, finalCashAmount, finalOnlineAmount);
    
    // Generate PDF First
    await generateTherapyPDF(newSession);

    // Simulate sending PDF via WhatsApp
    const msg = `Hello ${formData.clientName},\n\nYour Therapy Session (${formData.therapyName}) bill for Rs.${formData.amount} has been generated.\n\nPlease find the PDF bill attached.\n\n- JK Multi Gym & Pain Rehab`;
    const waLink = `https://wa.me/${formData.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    
    setShowModal(false);
    setFormData({ id: '', date: new Date().toISOString().split('T')[0], clientName: '', whatsapp: '', therapyName: '', amount: 0 });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Therapy Sessions</h1>
          <p>Record sessions and send WhatsApp bills</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Session
        </button>
      </div>

      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client Name</th>
              <th>WhatsApp No</th>
              <th>Therapy Name</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {therapySessions.map(ts => (
              <tr key={ts.id}>
                <td>{ts.date}</td>
                <td className="font-bold">{ts.clientName}</td>
                <td>{ts.whatsapp}</td>
                <td>{ts.therapyName}</td>
                <td className="text-success font-bold">₹{ts.amount}</td>
                <td>
                  <button className="btn btn-secondary flex items-center gap-1" style={{ padding: '0.4rem 0.8rem' }} onClick={async () => {
                    await generateTherapyPDF(ts);
                    const msg = `Reminder: Therapy Session (${ts.therapyName}) bill for Rs.${ts.amount}.\n\nPlease find attached the PDF copy.\n- JK Multi Gym`;
                    window.open(`https://wa.me/${ts.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}>
                    <Download size={16} /> Bill & Send
                  </button>
                </td>
              </tr>
            ))}
            {therapySessions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-muted">No therapy sessions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="m-0">New Therapy Session</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="input-group m-0">
                  <label>Client Name *</label>
                  <input type="text" className="input-field" required 
                    value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>WhatsApp Number * (incl. country code)</label>
                  <input type="text" className="input-field" required placeholder="e.g. 918585007016"
                    value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Therapy Name *</label>
                  <input type="text" className="input-field" required 
                    value={formData.therapyName} onChange={e => setFormData({...formData, therapyName: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Amount (₹) *</label>
                  <input type="number" className="input-field" required 
                    value={formData.amount} onChange={e => {
                      setFormData({...formData, amount: Number(e.target.value)});
                      if (paymentMethod === 'split') {
                        setCashAmount(e.target.value);
                        setOnlineAmount('0');
                      }
                    }} />
                </div>
                <div className="input-group m-0">
                  <label>Payment Method</label>
                  <select className="input-field" value={paymentMethod} onChange={e => {
                    const method = e.target.value as any;
                    setPaymentMethod(method);
                    if (method === 'split') {
                      setCashAmount(formData.amount.toString());
                      setOnlineAmount('0');
                    }
                  }}>
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="split">Cash + Online (Split)</option>
                  </select>
                </div>

                {paymentMethod === 'split' && (
                  <>
                    <div className="input-group m-0">
                      <label>Cash Amount (₹)</label>
                      <input type="number" className="input-field" required 
                        value={cashAmount} 
                        onChange={e => {
                          setCashAmount(e.target.value);
                          const total = formData.amount || 0;
                          const cash = Number(e.target.value) || 0;
                          setOnlineAmount(Math.max(0, total - cash).toString());
                        }} 
                      />
                    </div>
                    <div className="input-group m-0">
                      <label>Online Amount (₹)</label>
                      <input type="number" className="input-field" required 
                        value={onlineAmount} 
                        onChange={e => {
                          setOnlineAmount(e.target.value);
                          const total = formData.amount || 0;
                          const online = Number(e.target.value) || 0;
                          setCashAmount(Math.max(0, total - online).toString());
                        }} 
                      />
                    </div>
                  </>
                )}
                <div className="input-group m-0">
                  <label>Date *</label>
                  <input type="date" className="input-field" required 
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">
                <Send size={18} /> Save & Send WhatsApp Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

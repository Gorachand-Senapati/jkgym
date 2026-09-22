import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../context/GymContext';
import { IndianRupee, Send, Download } from 'lucide-react';
import { generateBillingPDF } from '../utils/pdfGenerator';

export const Billing: React.FC = () => {
  const { members, addTransaction } = useGym();
  const { showAlert } = useAlert();
  const { currentUser } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [offer, setOffer] = useState('Monthly Fees Payment');
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'online'>('cash');
  const [lastPayment, setLastPayment] = useState<{ member: any, amount: number, offer: string, date: string, paymentMethod: string } | null>(null);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    const member = members.find(m => m.id === memberId);
    if (!member) {
      showAlert('Member not found', 'error');
      return;
    }

    const tx: Transaction = {
      id: `TX${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'monthly_fee',
      amount: Number(amount),
      paymentMethod,
      description: `${offer} for ${member.name}`,
      userId: currentUser?.id
    };

    addTransaction(tx);
    
    // Save last payment details for the success modal
    setLastPayment({
      member,
      amount: Number(amount),
      offer,
      date: tx.date,
      paymentMethod
    });

    setMemberId('');
    setAmount('');
  };
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1>Billing & Offers Entry</h1>
        <p>Record member payments and apply offers</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl mb-4">New Payment Entry</h2>
          <form onSubmit={handlePayment}>
            <div className="input-group">
              <label>Select Member</label>
              <select className="input-field" required value={memberId} onChange={e => setMemberId(e.target.value)}>
                <option value="">-- Select Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Payment Type / Offer</label>
              <select className="input-field" value={offer} onChange={e => setOffer(e.target.value)}>
                <option value="New Admission">Add New Admission</option>
                <option value="Re-admission">Re-admission</option>
                <option value="Monthly Fees Payment">Monthly Fees Payment</option>
                <option value="Quarterly Offer">Quarterly Offer</option>
                <option value="Half Year Offer">Half Year Offer</option>
                <option value="Yearly Offer">Yearly Offer</option>
                <option value="Manual Entry">Full Manual Entry</option>
              </select>
            </div>

            <div className="input-group">
              <label>Amount (₹)</label>
              <input type="number" className="input-field" required 
                value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                <option value="cash">Cash (Updates Cash Balance)</option>
                <option value="online">Online (Updates Bank Balance)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4">
              <IndianRupee size={18} /> Record Payment
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="mb-4" style={{ width: '100%', maxWidth: '400px' }}>
             {/* Mocking the billing page receipt requirement */}
             <div style={{ border: '2px dashed var(--border-light)', padding: '2rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                <h3 className="text-accent mb-2">JK Multi Gym & Pain Rehab</h3>
                <p className="text-sm text-muted mb-4">Payment Receipt Preview</p>
                <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                  <span>Member:</span> <span>{members.find(m=>m.id===memberId)?.name || '---'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                  <span>Particulars:</span> <span>{offer}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total:</span> <span className="text-success">₹{amount || '0'}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {lastPayment && (
        <div className="modal-overlay">
          <div className="modal-content text-center" style={{ maxWidth: '400px' }}>
            <div className="flex justify-center mb-4">
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '30px' }}>✅</span>
              </div>
            </div>
            <h2 className="text-success mb-2" style={{ marginTop: 0 }}>Payment Recorded!</h2>
            <p className="mb-6 text-muted">The transaction has been successfully saved to the ledger. What would you like to do next?</p>
            
            <div className="flex flex-col gap-3">
              <button 
                className="btn btn-secondary w-full flex justify-center items-center gap-2" 
                onClick={async () => {
                  await generateBillingPDF(lastPayment.member, lastPayment.amount, lastPayment.offer, lastPayment.date, lastPayment.paymentMethod);
                }}
              >
                <Download size={18} /> Download Receipt PDF
              </button>
              
              <button 
                className="btn btn-primary w-full flex justify-center items-center gap-2" 
                style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}
                onClick={() => {
                  const msg = `Hello ${lastPayment.member.name},\n\nYour JK Multi Gym payment receipt for ${lastPayment.offer} (Rs.${lastPayment.amount}) has been generated.\n\nPlease find the PDF receipt attached.\n\nThank you!`;
                  const waLink = `https://wa.me/${lastPayment.member.whatsapp || lastPayment.member.phone}?text=${encodeURIComponent(msg)}`;
                  window.open(waLink, '_blank');
                }}
              >
                <Send size={18} /> Send via WhatsApp
              </button>
              
              <button className="btn mt-2 w-full" onClick={() => setLastPayment(null)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

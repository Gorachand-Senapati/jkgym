import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, ArrowRightLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Reports: React.FC = () => {
  const { transactions, members, cashBalance, bankBalance, addTransaction, employeeCashBalances } = useGym();
  const { showAlert } = useAlert();
  const { currentUser, users } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'expenses' | 'bank_deposit'>('summary');
  
  // Bank deposit states
  const [depositAmount, setDepositAmount] = useState('');
  
  // Expense states
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseMethod, setExpenseMethod] = useState<'cash'|'online'>('cash');

  const handleBankDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    const safeEmployeeCashBalances = employeeCashBalances || {};
    const availableCash = currentUser?.role === 'owner' ? cashBalance : (safeEmployeeCashBalances[currentUser?.id || ''] || 0);
    
    if (amount > availableCash) {
      showAlert('Insufficient cash balance for deposit', 'error');
      return;
    }
    
    addTransaction({
      id: `DEP${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'bank_deposit',
      category: 'deposit',
      amount: amount,
      paymentMethod: 'cash',
      description: 'Cash Deposit to Bank',
      userId: currentUser?.id
    });
    setDepositAmount('');
    showAlert('Bank deposit recorded. Cash deducted, Bank credited.', 'success');
  };

  const handleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expenseAmount);
    
    addTransaction({
      id: `EXP${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'gym_expense',
      amount: amount,
      paymentMethod: expenseMethod,
      description: expenseDesc,
      userId: currentUser?.id
    });
    setExpenseDesc('');
    setExpenseAmount('');
    showAlert('Expense recorded.', 'success');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Gym_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const safeEmployeeCashBalances = employeeCashBalances || {};
  const userAvailableCash = currentUser?.role === 'owner' ? cashBalance : (safeEmployeeCashBalances[currentUser?.id || ''] || 0);
  const displayTransactions = currentUser?.role === 'owner' ? transactions : transactions.filter(t => t.userId === currentUser?.id);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Reports & Accounting</h1>
          <p>View summaries, add expenses, and deposit to bank</p>
        </div>
        {currentUser?.role === 'owner' && (
          <button className="btn btn-success" onClick={exportToExcel}>
            <Download size={18} /> Export All to Excel
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('summary')}>
          <FileText size={18} /> Dashboard Summary
        </button>
        {currentUser?.role === 'owner' && (
          <button className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('expenses')}>
            <IndianRupeeIcon /> Gym Expenses
          </button>
        )}
        <button className={`btn ${activeTab === 'bank_deposit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('bank_deposit')}>
          <ArrowRightLeft size={18} /> Bank Deposit
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl mb-4">{currentUser?.role === 'owner' ? 'Financial Overview' : 'Your Closing Balance'}</h2>
            
            <div className="flex justify-between border-b border-gray-700 py-3">
              <span className="text-muted">{currentUser?.role === 'owner' ? 'Total Gym Cash' : 'Your Cash on Hand'}</span>
              <span className="font-bold text-xl text-success">₹{userAvailableCash.toLocaleString()}</span>
            </div>
            
            {currentUser?.role === 'owner' && (
              <>
                <div className="flex justify-between border-b border-gray-700 py-3">
                  <span className="text-muted">Total Bank Balance</span>
                  <span className="font-bold text-xl text-primary">₹{bankBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted">Active Members</span>
                  <span className="font-bold text-xl">{members.filter(m=>m.status === 'active').length}</span>
                </div>
                <div className="mt-4 pt-2 border-t border-gray-700">
                  <h3 className="text-sm text-muted mb-2">Employee Cash Breakdown</h3>
                  {Object.entries(safeEmployeeCashBalances).map(([empId, amount]) => {
                    const emp = users.find(u => u.id === empId);
                    if (!emp || amount <= 0) return null;
                    return (
                      <div key={empId} className="flex justify-between py-1 text-sm">
                        <span>{emp.name}</span>
                        <span className="font-bold">₹{amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl mb-4">Transactions Log</h2>
            <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
                <tbody>
                  {[...displayTransactions].reverse().map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass-panel p-6 max-w-2xl">
          <h2 className="text-xl mb-4">Add Gym Expense</h2>
          <form onSubmit={handleExpense}>
            <div className="input-group">
              <label>Expense Description</label>
              <input type="text" className="input-field" required 
                value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input type="number" className="input-field" required 
                value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Paid Via</label>
              <select className="input-field" value={expenseMethod} onChange={e => setExpenseMethod(e.target.value as any)}>
                <option value="cash">Cash (Deducts from Cash Balance)</option>
                <option value="online">Online (Deducts from Bank Balance)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-danger mt-4 w-full">Record Expense</button>
          </form>
        </div>
      )}

      {activeTab === 'bank_deposit' && (
        <div className="glass-panel p-6 max-w-2xl">
          <h2 className="text-xl mb-4">Cash to Bank Deposit</h2>
          <p className="text-muted mb-4">Current Cash Available to Deposit: <strong className="text-primary">₹{userAvailableCash.toLocaleString()}</strong></p>
          <form onSubmit={handleBankDeposit}>
            <div className="input-group">
              <label>Amount to Deposit (₹)</label>
              <input type="number" className="input-field" required max={userAvailableCash}
                value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-full">Process Deposit</button>
          </form>
        </div>
      )}
    </div>
  );
};

// Helper for lucide missing icon
const IndianRupeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
);

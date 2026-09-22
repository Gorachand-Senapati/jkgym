import React, { useState } from 'react';
import { useGym, type Transaction } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { IndianRupee, Users, ShoppingBag, Activity, ArrowDownToLine } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { cashBalance, bankBalance, members, inventory, transactions, employeeCashBalances, addTransaction } = useGym();
  const { currentUser, users } = useAuth();
  const { showAlert } = useAlert();

  const [depositModal, setDepositModal] = useState({ isOpen: false, employeeId: '', employeeName: '', amount: '' });

  const totalMembers = members.filter(m => m.status === 'active').length;
  const lowStockItems = inventory.filter(p => p.stockQty < 10).length;
  
  const safeEmployeeCashBalances = employeeCashBalances || {};
  const displayTransactions = currentUser?.role === 'owner' ? transactions : transactions.filter(t => t.userId === currentUser?.id);
  const userAvailableCash = currentUser?.role === 'owner' ? cashBalance : (safeEmployeeCashBalances[currentUser?.id || ''] || 0);

  // Recent transactions
  const recentTx = [...displayTransactions].reverse().slice(0, 5);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(depositModal.amount);
    const maxAmount = safeEmployeeCashBalances[depositModal.employeeId] || 0;
    
    if (amountNum > maxAmount) {
      showAlert(`Cannot deposit more than the collected cash (₹${maxAmount})`, 'error');
      return;
    }

    const tx: Transaction = {
      id: `TX${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'bank_deposit',
      category: 'deposit',
      amount: amountNum,
      paymentMethod: 'cash',
      description: `Cash deposited to bank from ${depositModal.employeeName}`,
      userId: depositModal.employeeId
    };
    
    addTransaction(tx);
    setDepositModal({ isOpen: false, employeeId: '', employeeName: '', amount: '' });
    showAlert('Cash deposited successfully! Bank balance increased and employee cash reduced.', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to JK Multi Gym & Pain Rehab Centre Admin Panel</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="glass-panel stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-card-title">{currentUser?.role === 'owner' ? 'Total Gym Cash' : 'Your Collected Cash'}</div>
            <div className="stat-card-value">₹{userAvailableCash.toLocaleString()}</div>
          </div>
        </div>

        {currentUser?.role === 'owner' && (
          <div className="glass-panel stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <IndianRupee size={24} />
            </div>
            <div>
              <div className="stat-card-title">Bank Balance</div>
              <div className="stat-card-value">₹{bankBalance.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="glass-panel stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-card-title">Active Members</div>
            <div className="stat-card-value">{totalMembers}</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-card-title">Low Stock Items</div>
            <div className="stat-card-value">{lowStockItems}</div>
          </div>
        </div>
      </div>

      {currentUser?.role === 'owner' && (
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-xl mb-4">Employee Cash Collections</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Collected Cash</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const balance = safeEmployeeCashBalances[user.id] || 0;
                  return (
                    <tr key={user.id}>
                      <td className="font-bold">{user.name}</td>
                      <td className="text-muted capitalize">{user.role}</td>
                      <td className={balance > 0 ? "text-success font-bold" : ""}>₹{balance.toLocaleString()}</td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem' }}
                          disabled={balance <= 0}
                          onClick={() => setDepositModal({ isOpen: true, employeeId: user.id, employeeName: user.name, amount: '' })}
                        >
                          <ArrowDownToLine size={16} /> Deposit Cash
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl mb-4">Recent Transactions</h2>
          {recentTx.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td>
                        <span className={`badge ${tx.paymentMethod === 'online' ? 'badge-success' : 'badge-warning'}`}>
                          {tx.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent transactions.</p>
          )}
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn btn-primary w-full" onClick={() => window.location.href='/billing'}>
              <IndianRupee size={18} /> New Payment
            </button>
            <button className="btn btn-secondary w-full" onClick={() => window.location.href='/members'}>
              <Users size={18} /> Add Member
            </button>
            <button className="btn btn-secondary w-full" onClick={() => window.location.href='/therapy'}>
              <Activity size={18} /> Therapy Session
            </button>
            <button className="btn btn-secondary w-full" onClick={() => window.location.href='/inventory'}>
              <ShoppingBag size={18} /> Sell Product
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="m-0">Deposit Cash to Bank</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setDepositModal({ ...depositModal, isOpen: false })}>✕</button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <p className="text-muted text-sm mb-1">Depositing cash from</p>
                <p className="font-bold">{depositModal.employeeName}</p>
                <p className="text-sm text-success mt-1">Available Cash: ₹{(safeEmployeeCashBalances[depositModal.employeeId] || 0).toLocaleString()}</p>
              </div>
              <div className="input-group">
                <label>Amount to Deposit (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  min="1"
                  max={safeEmployeeCashBalances[depositModal.employeeId] || 0}
                  value={depositModal.amount} 
                  onChange={e => setDepositModal({ ...depositModal, amount: e.target.value })} 
                  placeholder="Enter amount"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

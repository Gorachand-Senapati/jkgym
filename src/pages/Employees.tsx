import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import type { Employee } from '../context/GymContext';
import { Plus, Edit2, Search, Trash2 } from 'lucide-react';

export const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useGym();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<{id: string, name: string} | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const defaultForm: Employee = {
    id: `E${Date.now()}`, name: '', dob: '', joiningDate: new Date().toISOString().split('T')[0],
    phone: '', whatsapp: '', accountNo: '', panCard: '', branchName: '', ifscCode: '',
    salary: 0, bloodGroup: '', height: '', weight: ''
  };
  const [formData, setFormData] = useState<Employee>(defaultForm);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData(emp);
    setPassword('');
    setPasswordError('');
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({ ...defaultForm, id: `E${Date.now()}` });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setEmployeeToDelete({ id, name });
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      if (password !== 'admin123') {
        setPasswordError('Invalid security code');
        return;
      }
      updateEmployee(formData);
    } else {
      addEmployee(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Employees Ledger</h1>
          <p>Manage gym staff and trainers</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      <div className="glass-panel p-6 mb-6">
        <div className="input-group m-0" style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', color: 'var(--text-muted)' }} />
          <input type="text" className="input-field" placeholder="Search employees..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>

      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id}>
                <td className="font-bold text-accent">{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.phone}</td>
                <td>₹{emp.salary.toLocaleString()}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-1" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEditClick(emp)}>
                      <Edit2 size={16} /> Edit
                    </button>
                    <button className="btn btn-danger flex items-center gap-1" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleDeleteClick(emp.id, emp.name)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
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
              <h2 className="m-0">{editingEmployee ? 'Edit Employee' : 'New Employee Entry'}</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="input-group m-0">
                  <label>Employee ID</label>
                  <input type="text" className="input-field" value={formData.id} disabled />
                </div>
                <div className="input-group m-0">
                  <label>Full Name *</label>
                  <input type="text" className="input-field" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Phone No *</label>
                  <input type="tel" className="input-field" required 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Salary (₹) *</label>
                  <input type="number" className="input-field" required 
                    value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
                </div>
                {/* Simplified for brevity, add other fields as needed */}
              </div>
              
              {editingEmployee && (
                <div className="p-4 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div className="input-group m-0">
                    <label className="text-danger font-bold">Security Code Required *</label>
                    <input type="password" className="input-field" required placeholder="admin123"
                      value={password} onChange={e => setPassword(e.target.value)} />
                    {passwordError && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{passwordError}</span>}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {employeeToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="flex justify-center mb-4">
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={30} style={{ color: '#ef4444' }} />
              </div>
            </div>
            <h2 className="mb-2 m-0 text-xl font-bold">Delete Employee?</h2>
            <p className="text-muted mb-6">
              Are you sure you want to permanently delete <strong>{employeeToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button className="btn btn-secondary flex-1" onClick={() => setEmployeeToDelete(null)}>Cancel</button>
              <button className="btn btn-danger flex-1" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

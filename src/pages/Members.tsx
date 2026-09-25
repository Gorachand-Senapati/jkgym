import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import type { Member } from '../context/GymContext';
import { Plus, Edit2, Search, Eye } from 'lucide-react';
import { saveImageToDB, getImageFromDB } from '../utils/db';

export const Members: React.FC = () => {
  const { members, addMember, updateMember } = useGym();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [viewAadharUrl, setViewAadharUrl] = useState<string | null>(null);

  // Default form state
  const defaultForm = {
    id: `M${Date.now()}`, name: '', dob: '', joiningDate: new Date().toISOString().split('T')[0],
    phone: '', whatsapp: '', admissionFees: '', bloodGroup: '',
    height: '', weight: '', guardianName: '', guardianPhone: '',
    admissionPersonName: '', status: 'active' as const
  };
  const [formData, setFormData] = useState<any>(defaultForm);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const currentMonthDay = todayStr.substring(5); // MM-DD

  const isBirthday = (dob?: string) => dob && dob.substring(5) === currentMonthDay;
  const isDue = (expiryDate?: string) => expiryDate && expiryDate < todayStr;

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setPassword('');
    setPasswordError('');
    setPhotoFile(null);
    setAadharFile(null);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setFormData({ ...defaultForm, id: `M${Date.now()}` });
    setPhotoFile(null);
    setAadharFile(null);
    setShowModal(true);
  };

  const handleViewClick = async (member: Member) => {
    setViewingMember(member);
    setViewPhotoUrl(member.photoId ? await getImageFromDB(member.photoId) : null);
    setViewAadharUrl(member.aadharId ? await getImageFromDB(member.aadharId) : null);
  };

  const closeViewModal = () => {
    setViewingMember(null);
    if (viewPhotoUrl) URL.revokeObjectURL(viewPhotoUrl);
    if (viewAadharUrl) URL.revokeObjectURL(viewAadharUrl);
    setViewPhotoUrl(null);
    setViewAadharUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = { ...formData, admissionFees: Number(formData.admissionFees) };

    if (photoFile) {
      const photoId = `photo_${finalFormData.id}_${Date.now()}`;
      await saveImageToDB(photoId, photoFile);
      finalFormData.photoId = photoId;
    }
    
    if (aadharFile) {
      const aadharId = `aadhar_${finalFormData.id}_${Date.now()}`;
      await saveImageToDB(aadharId, aadharFile);
      finalFormData.aadharId = aadharId;
    }

    if (editingMember) {
      if (password !== 'admin123') { // Dummy password for now
        setPasswordError('Invalid security code');
        return;
      }
      
      // WhatsApp notification for status change
      if (editingMember.status === 'active' && finalFormData.status === 'inactive') {
        const msg = `Dear ${finalFormData.name},\n\nYour JK Multi Gym membership has been deactivated. Please contact the management for further assistance.\n\nThank you!`;
        window.open(`https://wa.me/${finalFormData.whatsapp || finalFormData.phone}?text=${encodeURIComponent(msg)}`, '_blank');
      } else if (editingMember.status === 'inactive' && finalFormData.status === 'active') {
        const msg = `Dear ${finalFormData.name},\n\nYour JK Multi Gym membership has been successfully re-activated. Welcome back!\n\nThank you!`;
        window.open(`https://wa.me/${finalFormData.whatsapp || finalFormData.phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
      
      updateMember(finalFormData);
    } else {
      addMember(finalFormData);
    }
    
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Members Ledger</h1>
          <p>Manage all gym members</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={18} /> Add New Member
        </button>
      </div>

      <div className="glass-panel p-6 mb-6 flex gap-4 items-center">
        <div className="flex-1 input-group m-0" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-2" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, ID or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td className="font-bold text-accent">{member.id}</td>
                <td>{member.name}</td>
                <td>{member.phone}</td>
                <td>{member.joiningDate}</td>
                <td>
                  <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-1" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleViewClick(member)}>
                      <Eye size={16} /> View
                    </button>
                    <button className="btn btn-secondary flex items-center gap-1" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEditClick(member)}>
                      <Edit2 size={16} /> Edit
                    </button>
                    {isDue(member.expiryDate) && (
                      <button 
                        className="btn btn-danger flex items-center gap-1" 
                        style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }} 
                        onClick={() => {
                          const msg = `Hi ${member.name}, your gym membership expired on ${member.expiryDate}. Please renew your membership.`;
                          window.open(`https://wa.me/91${member.whatsapp || member.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                      >
                        Due
                      </button>
                    )}
                    {isBirthday(member.dob) && (
                      <button 
                        className="btn btn-success flex items-center gap-1" 
                        style={{ padding: '0.4rem 0.8rem', backgroundColor: '#eab308', color: 'white', border: 'none' }} 
                        onClick={() => {
                          const msg = `Happy Birthday ${member.name}! Wishing you a great day from JK Multi Gym!`;
                          window.open(`https://wa.me/91${member.whatsapp || member.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                      >
                        Birthday
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-muted">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="m-0">{editingMember ? 'Edit Member' : 'New Member Admission'}</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="input-group m-0">
                  <label>Member ID</label>
                  <input type="text" className="input-field" value={formData.id} disabled />
                </div>
                <div className="input-group m-0">
                  <label>Full Name *</label>
                  <input type="text" className="input-field" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Date of Birth *</label>
                  <input type="date" className="input-field" required 
                    value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Joining Date *</label>
                  <input type="date" className="input-field" required 
                    value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Phone No *</label>
                  <input type="tel" className="input-field" required 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>WhatsApp No</label>
                  <input type="tel" className="input-field" 
                    value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Admission Fees (₹) *</label>
                  <input type="number" className="input-field" required 
                    value={formData.admissionFees} onChange={e => setFormData({...formData, admissionFees: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Blood Group</label>
                  <input type="text" className="input-field" 
                    value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Height (cm)</label>
                  <input type="text" className="input-field" 
                    value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Body Weight (kg)</label>
                  <input type="text" className="input-field" 
                    value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Guardian Name</label>
                  <input type="text" className="input-field" 
                    value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Guardian Phone</label>
                  <input type="tel" className="input-field" 
                    value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} />
                </div>
                <div className="input-group m-0">
                  <label>Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active'|'inactive'})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="input-group m-0">
                  <label>Profile Photo</label>
                  <input type="file" accept="image/*" className="input-field" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                  {editingMember?.photoId && !photoFile && <span className="text-muted" style={{fontSize: '0.8rem', display: 'block', marginTop: '0.2rem'}}>Photo saved in database</span>}
                </div>
                <div className="input-group m-0">
                  <label>Aadhar Card</label>
                  <input type="file" accept="image/*" className="input-field" onChange={e => setAadharFile(e.target.files?.[0] || null)} />
                  {editingMember?.aadharId && !aadharFile && <span className="text-muted" style={{fontSize: '0.8rem', display: 'block', marginTop: '0.2rem'}}>Aadhar saved in database</span>}
                </div>
              </div>
              
              {editingMember && (
                <div className="p-4 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div className="input-group m-0">
                    <label className="text-danger font-bold">Security Code Required for Changes *</label>
                    <input type="password" className="input-field" required placeholder="Enter password to save changes (admin123)"
                      value={password} onChange={e => setPassword(e.target.value)} />
                    {passwordError && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{passwordError}</span>}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for View Profile */}
      {viewingMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="m-0">Member Profile</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={closeViewModal}>✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col gap-4">
                <div className="p-4 glass-panel m-0">
                  <h3 className="text-accent mb-4" style={{marginTop: 0}}>Personal Details</h3>
                  <div className="flex flex-col gap-2">
                    <p className="m-0"><strong>ID:</strong> {viewingMember.id}</p>
                    <p className="m-0"><strong>Name:</strong> {viewingMember.name}</p>
                    <p className="m-0"><strong>Phone:</strong> {viewingMember.phone}</p>
                    <p className="m-0"><strong>DOB:</strong> {viewingMember.dob}</p>
                    <p className="m-0"><strong>Expiry Date:</strong> {viewingMember.expiryDate ? <span className={isDue(viewingMember.expiryDate) ? 'text-danger' : 'text-success'}>{viewingMember.expiryDate}</span> : 'N/A'}</p>
                    <p className="m-0"><strong>Blood Group:</strong> {viewingMember.bloodGroup || 'N/A'}</p>
                    <p className="m-0">
                      <strong>Status:</strong> 
                      <span className={`badge ${viewingMember.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{marginLeft: '0.5rem'}}>
                        {viewingMember.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="p-4 glass-panel m-0 flex flex-col items-center">
                  <h3 className="text-accent mb-4 w-full text-left" style={{marginTop: 0}}>Profile Photo</h3>
                  {viewPhotoUrl ? (
                     <img src={viewPhotoUrl} alt="Profile" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '3px solid var(--accent)' }} />
                  ) : (
                     <div className="flex items-center justify-center text-muted" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--surface-light)', border: '1px dashed var(--border)' }}>No Photo</div>
                  )}
                </div>
                
                <div className="p-4 glass-panel m-0">
                  <h3 className="text-accent mb-4 w-full text-left" style={{marginTop: 0}}>Aadhar Card</h3>
                  {viewAadharUrl ? (
                     <img src={viewAadharUrl} alt="Aadhar" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                     <div className="flex items-center justify-center text-muted p-4" style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-light)', border: '1px dashed var(--border)' }}>No Aadhar Uploaded</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
               <button className="btn btn-primary" onClick={closeViewModal}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

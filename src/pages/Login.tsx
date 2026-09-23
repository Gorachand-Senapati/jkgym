import React, { useState } from 'react';
import { useAuth, type User, type UserRole } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export const Login: React.FC = () => {
  const { login, registerUser, users } = useAuth();
  const { showAlert } = useAlert();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [secretCode, setSecretCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const user = users.find(u => u.username === username);
      if (user) {
        if (user.role === 'owner' && secretCode !== 'jk7016') {
          showAlert('Incorrect Owner Secret Code! Access Denied.', 'error');
          return;
        }
        login(user);
        showAlert(`Welcome back, ${user.name}!`, 'success');
      } else {
        showAlert('User not found. Please check your username or sign up.', 'error');
      }
    } else {
      if (users.some(u => u.username === username)) {
        showAlert('Username already exists. Please choose another one.', 'error');
        return;
      }
      if (role === 'owner' && secretCode !== 'jk7016') {
        showAlert('Incorrect Owner Secret Code! Cannot create Owner account.', 'error');
        return;
      }
      const newUser: User = {
        id: `U${Date.now()}`,
        username,
        name,
        role,
      };
      registerUser(newUser);
      login(newUser);
      showAlert(`Account created successfully! Welcome, ${name}.`, 'success');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Left Side - Image and Gym Details */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        textAlign: 'center',
        boxShadow: 'inset -10px 0px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '3rem',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img src="/whitelogo.jpeg" alt="JK Multi Gym" style={{ width: '150px', height: '150px', objectFit: 'contain', margin: '0 auto 1.5rem auto' }} />
          <h1 className="text-4xl mb-2 text-white font-extrabold tracking-wider" style={{ fontFamily: '"Montserrat", sans-serif' }}>JK MULTI GYM</h1>
          <h2 className="text-xl text-accent mb-6 font-bold tracking-widest uppercase">& Pain Rehab Centre</h2>

          <div style={{ marginTop: '2rem', textAlign: 'left', display: 'inline-block' }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-white text-xl">📍</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Branch: Belghoria</p>
                <p className="text-gray-300 text-sm">Sreepally Milon Samity Club Belghoria D.P Nagar Kolkata -56</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-white text-xl">📞</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Contact Us</p>
                <p className="text-gray-300 text-sm">+91 9876543210</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="text-3xl mb-2 font-bold" style={{ color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-muted">
              {isLogin ? 'Enter your details to access your dashboard' : 'Sign up to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group mb-5">
                <label style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input type="text" className="input-field" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
            )}

            <div className="input-group mb-5">
              <label style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input type="text" className="input-field" required value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" />
            </div>

            {isLogin && (
              <div className="input-group mb-5">
                <label style={{ color: 'var(--text-secondary)' }}>Owner Secret Code <span className="text-sm">(Required for Owners)</span></label>
                <input type="password" className="input-field" value={secretCode} onChange={e => setSecretCode(e.target.value)} placeholder="Leave blank if Employee" />
              </div>
            )}

            {!isLogin && (
              <div className="input-group mb-6">
                <label style={{ color: 'var(--text-secondary)' }}>Role</label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                    <input type="radio" name="role" value="employee" checked={role === 'employee'} onChange={() => setRole('employee')} className="accent-primary" style={{ width: '1.2rem', height: '1.2rem' }} />
                    <span className="font-medium">Employee</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                    <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={() => setRole('owner')} className="accent-primary" style={{ width: '1.2rem', height: '1.2rem' }} />
                    <span className="font-medium">Owner</span>
                  </label>
                </div>
              </div>
            )}

            {!isLogin && role === 'owner' && (
              <div className="input-group mb-5">
                <label style={{ color: 'var(--text-secondary)' }}>Owner Secret Code</label>
                <input type="password" className="input-field" required value={secretCode} onChange={e => setSecretCode(e.target.value)} placeholder="Enter Master PIN" />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isLogin ? 'Log In to Dashboard' : 'Sign Up & Continue'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-700 pt-6 text-center">
            <p className="text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="text-accent ml-2 hover:underline font-bold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1rem' }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up here' : 'Log In here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

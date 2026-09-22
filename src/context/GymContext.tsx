import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- Types ---
export interface Member {
  id: string;
  name: string;
  dob: string;
  joiningDate: string;
  phone: string;
  whatsapp: string;
  admissionFees: number;
  bloodGroup: string;
  height: string;
  weight: string;
  guardianName: string;
  guardianPhone: string;
  admissionPersonName: string;
  status: 'active' | 'inactive';
  photoId?: string;
  aadharId?: string;
}

export interface Employee {
  id: string;
  name: string;
  dob: string;
  joiningDate: string;
  phone: string;
  whatsapp: string;
  accountNo: string;
  panCard: string;
  branchName: string;
  ifscCode: string;
  salary: number;
  bloodGroup: string;
  height: string;
  weight: string;
}

export interface Product {
  id: string;
  name: string;
  stockQty: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface TherapySession {
  id: string;
  date: string;
  clientName: string;
  whatsapp: string;
  therapyName: string;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'bank_deposit';
  category: 'monthly_fee' | 'admission' | 'supplement_sale' | 'therapy' | 'gym_expense' | 'deposit';
  amount: number;
  paymentMethod: 'cash' | 'online';
  description: string;
  userId?: string;
}

interface GymState {
  members: Member[];
  employees: Employee[];
  inventory: Product[];
  therapySessions: TherapySession[];
  transactions: Transaction[];
  cashBalance: number;
  bankBalance: number;
  employeeCashBalances: Record<string, number>;
}

interface GymContextType extends GymState {
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  sellProduct: (productId: string, qty: number, paymentMethod: 'cash' | 'online', userId?: string) => void;
  addTherapySession: (session: TherapySession, paymentMethod: 'cash' | 'online', userId?: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateBalances: () => void;
}

const initialDummyState: GymState = {
  members: [],
  employees: [],
  inventory: [],
  therapySessions: [],
  transactions: [],
  cashBalance: 0,
  bankBalance: 0,
  employeeCashBalances: {}
};

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GymState>(() => {
    const saved = localStorage.getItem('gymData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local storage data', e);
      }
    }
    return initialDummyState;
  });

  useEffect(() => {
    localStorage.setItem('gymData', JSON.stringify(state));
  }, [state]);

  const updateBalances = () => {
    const cash = state.transactions.filter(t => t.paymentMethod === 'cash').reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense' || t.type === 'bank_deposit') return acc - t.amount;
      return acc;
    }, 0);

    const bank = state.transactions.filter(t => t.paymentMethod === 'online' || t.type === 'bank_deposit').reduce((acc, t) => {
      if (t.type === 'income' || t.type === 'bank_deposit') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);

    const employeeCash: Record<string, number> = {};
    state.transactions.forEach(t => {
      if (t.userId && t.paymentMethod === 'cash') {
        if (!employeeCash[t.userId]) employeeCash[t.userId] = 0;
        if (t.type === 'income') employeeCash[t.userId] += t.amount;
        if (t.type === 'expense' || t.type === 'bank_deposit') employeeCash[t.userId] -= t.amount;
      }
    });

    setState(prev => ({ ...prev, cashBalance: cash, bankBalance: bank, employeeCashBalances: employeeCash }));
  };

  useEffect(() => {
    // Recalculate balances whenever transactions change
    const cash = state.transactions.filter(t => t.paymentMethod === 'cash').reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense' || t.type === 'bank_deposit') return acc - t.amount;
      return acc;
    }, 0);

    const bank = state.transactions.filter(t => t.paymentMethod === 'online' || t.type === 'bank_deposit').reduce((acc, t) => {
      if (t.type === 'income' || t.type === 'bank_deposit') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);
    
    const employeeCash: Record<string, number> = {};
    state.transactions.forEach(t => {
      if (t.userId && t.paymentMethod === 'cash') {
        if (!employeeCash[t.userId]) employeeCash[t.userId] = 0;
        if (t.type === 'income') employeeCash[t.userId] += t.amount;
        if (t.type === 'expense' || t.type === 'bank_deposit') employeeCash[t.userId] -= t.amount;
      }
    });
    
    // Check deep equality for employeeCash? For simplicity, we just update it.
    setState(prev => ({ ...prev, cashBalance: cash, bankBalance: bank, employeeCashBalances: employeeCash }));
  }, [state.transactions]);


  const addMember = (member: Member) => setState(p => ({ ...p, members: [...p.members, member] }));
  const updateMember = (member: Member) => {
    setState(p => {
      const oldMember = p.members.find(m => m.id === member.id);
      if (oldMember && oldMember.status === 'active' && member.status === 'inactive') {
        // Asynchronously delete images to save space
        import('../utils/db').then(({ deleteImageFromDB }) => {
          if (oldMember.photoId) deleteImageFromDB(oldMember.photoId);
          if (oldMember.aadharId) deleteImageFromDB(oldMember.aadharId);
        });
        member = { ...member, photoId: undefined, aadharId: undefined };
      }
      return { ...p, members: p.members.map(m => m.id === member.id ? member : m) };
    });
  };
  
  const addEmployee = (emp: Employee) => setState(p => ({ ...p, employees: [...p.employees, emp] }));
  const updateEmployee = (emp: Employee) => setState(p => ({ ...p, employees: p.employees.map(e => e.id === emp.id ? emp : e) }));
  
  const addProduct = (product: Product) => setState(p => ({ ...p, inventory: [...p.inventory, product] }));
  const updateProduct = (product: Product) => setState(p => ({ ...p, inventory: p.inventory.map(pr => pr.id === product.id ? product : pr) }));
  
  const sellProduct = (productId: string, qty: number, paymentMethod: 'cash' | 'online', userId?: string) => {
    setState(p => {
      const product = p.inventory.find(pr => pr.id === productId);
      if (!product || product.stockQty < qty) return p;
      
      const newInventory = p.inventory.map(pr => pr.id === productId ? { ...pr, stockQty: pr.stockQty - qty } : pr);
      const newTx: Transaction = {
        id: `T${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'supplement_sale',
        amount: product.sellingPrice * qty,
        paymentMethod,
        description: `Sold ${qty}x ${product.name}`,
        userId
      };
      
      return { ...p, inventory: newInventory, transactions: [...p.transactions, newTx] };
    });
  };

  const addTherapySession = (session: TherapySession, paymentMethod: 'cash' | 'online', userId?: string) => {
    setState(p => {
      const newTx: Transaction = {
        id: `T${Date.now()}`,
        date: session.date,
        type: 'income',
        category: 'therapy',
        amount: session.amount,
        paymentMethod,
        description: `Therapy: ${session.therapyName} for ${session.clientName}`,
        userId
      };
      return { ...p, therapySessions: [...p.therapySessions, session], transactions: [...p.transactions, newTx] };
    });
  };

  const addTransaction = (transaction: Transaction) => setState(p => ({ ...p, transactions: [...p.transactions, transaction] }));

  return (
    <GymContext.Provider value={{
      ...state,
      addMember, updateMember, addEmployee, updateEmployee,
      addProduct, updateProduct, sellProduct, addTherapySession,
      addTransaction, updateBalances
    }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

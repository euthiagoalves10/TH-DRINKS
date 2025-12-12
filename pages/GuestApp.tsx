import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { User, EventConfig, Drink, Order } from '../types';
import { getCurrentUser, getEvent, getDrinks, addOrder, saveUser, logoutUser, getOrders, redeemCoinCode } from '../services/storage';
import { Home, ClipboardList, ScanLine, User as UserIcon, LogOut, Clock, PlusCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Used for mock display if needed, mostly we need scanner

// --- Sub Components ---

const Menu: React.FC<{ user: User; onOrder: (drink: Drink) => void }> = ({ user, onOrder }) => {
  const drinks = getDrinks();
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  return (
    <div className="pb-24 pt-4 px-4">
      <h2 className="text-2xl font-bold mb-6 tracking-wider text-[var(--accent-color)] drop-shadow-md">CARDÁPIO</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {drinks.map(drink => (
          <div 
            key={drink.id} 
            onClick={() => setSelectedDrink(drink)}
            className="group relative bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-lg border border-[var(--border-color)] cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_var(--accent-color)]"
          >
            <div className="h-48 w-full overflow-hidden">
               <img src={drink.imageUrl} alt={drink.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-[var(--text-color)]">{drink.name}</h3>
                <span className="bg-[var(--accent-color)] text-[var(--bg-color)] text-xs font-bold px-2 py-1 rounded-full">{drink.cost} Coin</span>
              </div>
              <p className="text-sm opacity-80 line-clamp-2 text-[var(--text-color)]">{drink.shortDesc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedDrink && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative animate-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setSelectedDrink(null)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 z-10"
            >
              ✕
            </button>
            
            <div className="h-64 w-full relative">
               <img src={selectedDrink.imageUrl} alt={selectedDrink.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent"></div>
               <div className="absolute bottom-4 left-4">
                 <h2 className="text-3xl font-bold text-[var(--text-color)] drop-shadow-lg">{selectedDrink.name}</h2>
               </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-[var(--accent-color)] font-bold mb-1">Sensorial</h4>
                <p className="text-[var(--text-color)] leading-relaxed italic border-l-2 border-[var(--accent-color)] pl-3">
                  "{selectedDrink.description}"
                </p>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-widest text-[var(--text-color)] opacity-70 font-bold mb-2">Ingredientes</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrink.ingredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full text-xs text-[var(--text-color)]">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                {user.coins >= selectedDrink.cost ? (
                  <button 
                    onClick={() => {
                      onOrder(selectedDrink);
                      setSelectedDrink(null);
                    }}
                    className="w-full py-4 bg-[var(--accent-color)] text-[var(--bg-color)] font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_var(--accent-color)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    Pedir Agora ({selectedDrink.cost} Coin)
                  </button>
                ) : (
                  <div className="w-full py-4 bg-gray-700 text-gray-400 font-bold text-center rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-600">
                     <AlertCircle size={20} />
                     Você não tem coins
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersList: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const allOrders = getOrders();
    const myOrders = allOrders.filter(o => o.userId === user.id).sort((a, b) => b.timestamp - a.timestamp);
    setOrders(myOrders);
    
    const interval = setInterval(() => {
       const fresh = getOrders().filter(o => o.userId === user.id).sort((a, b) => b.timestamp - a.timestamp);
       setOrders(fresh);
    }, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-yellow-500';
      case 'preparing': return 'text-blue-500 animate-pulse';
      case 'ready': return 'text-green-500 font-bold';
      case 'delivered': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Aguardando';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto para Retirar!';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  return (
    <div className="pb-24 pt-4 px-4">
      <h2 className="text-2xl font-bold mb-6 tracking-wider text-[var(--text-color)]">MEUS PEDIDOS</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-color)] opacity-50">
          <p>Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl flex items-center gap-4 shadow-sm">
               <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img src={order.drinkImage} className="w-full h-full object-cover" alt="" />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-[var(--text-color)]">{order.drinkName}</h3>
                 <p className="text-xs text-[var(--text-color)] opacity-70">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
               <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                 {getStatusLabel(order.status)}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Profile: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className="pb-24 pt-8 px-6">
      <div className="flex flex-col items-center">
        <div className="h-24 w-24 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-[var(--bg-color)] mb-4 shadow-[0_0_20px_var(--accent-color)]">
          <UserIcon size={48} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-color)]">{user.name}</h2>
        <p className="text-[var(--text-color)] opacity-70 mb-8">Convidado VIP</p>

        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
             <div className="text-3xl font-bold text-[var(--accent-color)]">{user.coins}</div>
             <div className="text-xs text-[var(--text-color)] uppercase tracking-wide">Coins Disponíveis</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
             <div className="text-3xl font-bold text-[var(--text-color)]">{getOrders().filter(o => o.userId === user.id).length}</div>
             <div className="text-xs text-[var(--text-color)] uppercase tracking-wide">Drinks Pedidos</div>
          </div>
        </div>

        <button 
          onClick={() => {
            logoutUser();
            navigate('/');
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Sair do Evento
        </button>
      </div>
    </div>
  );
};

const CoinScanner: React.FC<{ user: User, refreshUser: () => void }> = ({ user, refreshUser }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRedeem = () => {
    if (!code) return;
    const result = redeemCoinCode(code.toUpperCase(), user.id);
    
    if (result === null) {
      setMessage("Código inválido.");
      setSuccess(false);
    } else if (result === -1) {
      setMessage("Você já usou este código.");
      setSuccess(false);
    } else {
      const updatedUser = { ...user, coins: user.coins + result };
      saveUser(updatedUser);
      refreshUser();
      setMessage(`Sucesso! +${result} Coins adicionados.`);
      setSuccess(true);
      setCode('');
    }
  };

  return (
    <div className="pb-24 pt-8 px-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8 tracking-wider text-[var(--text-color)]">RECARREGAR COINS</h2>
      
      <div className="w-full max-w-xs aspect-square bg-black rounded-3xl border-2 border-[var(--accent-color)] relative overflow-hidden flex items-center justify-center mb-6 shadow-[0_0_30px_var(--accent-color)]">
        {/* Mock Camera View */}
        <div className="absolute inset-0 bg-gray-900 opacity-50 flex items-center justify-center">
           <span className="text-gray-500 text-xs">Simulação de Câmera</span>
        </div>
        <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-lg animate-pulse"></div>
        <ScanLine className="absolute text-[var(--accent-color)] animate-bounce" size={48} />
      </div>

      <div className="w-full max-w-xs space-y-4">
        <p className="text-center text-sm text-[var(--text-color)] opacity-70">Aponte para o QR Code do ADM ou digite o código abaixo:</p>
        
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código (ex: A1B2C3)"
          className="w-full p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-center text-xl font-mono text-[var(--text-color)] uppercase focus:outline-none focus:border-[var(--accent-color)]"
        />
        
        <button 
          onClick={handleRedeem}
          className="w-full py-3 bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
        >
          RESGATAR
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-center font-bold ${success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Guest App ---

const GuestApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [event] = useState<EventConfig | null>(getEvent());
  const [timeLeft, setTimeLeft] = useState('');

  // Timer Logic
  useEffect(() => {
    if (!event) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const endTime = event.startTime + (event.durationHours * 60 * 60 * 1000);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        logoutUser();
        navigate('/');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event, navigate]);

  const refreshUser = () => {
    setUser(getCurrentUser());
  };

  const handleCreateOrder = (drink: Drink) => {
    if (!user) return;
    if (user.coins < drink.cost) {
      alert("Você não tem coins suficientes!");
      return;
    }

    const newCoins = user.coins - drink.cost;
    const updatedUser = { ...user, coins: newCoins };
    saveUser(updatedUser);
    setUser(updatedUser);

    const order: Order = {
      id: Date.now().toString(),
      drinkId: drink.id,
      drinkName: drink.name,
      drinkImage: drink.imageUrl,
      userId: user.id,
      userName: user.name,
      status: 'pending',
      timestamp: Date.now()
    };
    addOrder(order);
    navigate('/app/orders');
  };

  if (!user || !event) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 flex justify-between items-center bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-40">
        <div>
          <h1 className="text-sm font-bold text-[var(--text-color)] opacity-60 tracking-wider">SEJA BEM VINDO</h1>
          <p className="text-lg font-bold text-[var(--accent-color)] leading-none">{event.location}</p>
        </div>
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-[var(--border-color)]">
          <Clock size={14} className="text-[var(--accent-color)]" />
          <span className="font-mono text-sm text-[var(--text-color)]">{timeLeft}</span>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/app/menu" />} />
          <Route path="/menu" element={<Menu user={user} onOrder={handleCreateOrder} />} />
          <Route path="/orders" element={<OrdersList user={user} />} />
          <Route path="/scan" element={<CoinScanner user={user} refreshUser={refreshUser} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </main>

      {/* Bottom Nav */}
      <nav className="flex-shrink-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link to="/app/menu" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname.includes('menu') ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
            <Home size={24} />
            <span className="text-[10px] font-bold">MENU</span>
          </Link>
          <Link to="/app/orders" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname.includes('orders') ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
            <ClipboardList size={24} />
            <span className="text-[10px] font-bold">PEDIDOS</span>
          </Link>
          <Link to="/app/scan" className="relative -top-5">
            <div className="bg-[var(--accent-color)] h-14 w-14 rounded-full flex items-center justify-center shadow-[0_0_15px_var(--accent-color)] text-[var(--bg-color)] transform transition-transform active:scale-95">
              <ScanLine size={28} />
            </div>
          </Link>
          <div className="flex flex-col items-center gap-1 p-2 text-[var(--text-color)] opacity-90">
             <span className="text-sm font-bold text-[var(--accent-color)]">{user.coins}</span>
             <span className="text-[10px] font-bold">COINS</span>
          </div>
          <Link to="/app/profile" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname.includes('profile') ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
            <UserIcon size={24} />
            <span className="text-[10px] font-bold">PERFIL</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default GuestApp;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, logoutUser } from '../services/storage';
import { Order } from '../types';
import { ChefHat, CheckCircle, Clock, Check, LogOut } from 'lucide-react';

const KitchenDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Polling for orders
    const fetchOrders = () => {
      const all = getOrders();
      // Filter out delivered
      setOrders(all.filter(o => o.status !== 'delivered').sort((a, b) => a.timestamp - b.timestamp));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const advanceStatus = (order: Order) => {
    let nextStatus: Order['status'] = 'preparing';
    if (order.status === 'pending') nextStatus = 'preparing';
    else if (order.status === 'preparing') nextStatus = 'ready';
    else if (order.status === 'ready') nextStatus = 'delivered';
    
    updateOrderStatus(order.id, nextStatus);
    
    // Immediate local update for snappiness
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o).filter(o => nextStatus !== 'delivered' || o.id !== order.id));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <header className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-orange-500">
          <ChefHat /> KDS - COZINHA
        </h1>
        <button onClick={() => { logoutUser(); navigate('/'); }} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <LogOut size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
            <CheckCircle size={64} className="mb-4" />
            <h2 className="text-2xl font-bold">Sem pedidos pendentes</h2>
          </div>
        )}
        
        {orders.map(order => (
          <div 
            key={order.id} 
            className={`
              relative p-4 rounded-xl border-l-8 shadow-lg flex flex-col justify-between min-h-[200px]
              ${order.status === 'pending' ? 'bg-gray-800 border-yellow-500' : ''}
              ${order.status === 'preparing' ? 'bg-blue-900/20 border-blue-500' : ''}
              ${order.status === 'ready' ? 'bg-green-900/20 border-green-500' : ''}
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="bg-black/30 px-2 py-1 rounded text-xs font-mono text-gray-300">#{order.id.slice(-4)}</span>
                <span className="text-xs font-bold opacity-70 flex items-center gap-1">
                  <Clock size={12} /> {Math.floor((Date.now() - order.timestamp) / 60000)}m
                </span>
              </div>
              
              <h3 className="text-xl font-bold leading-tight mb-1">{order.drinkName}</h3>
              <p className="text-sm text-gray-400 mb-4">Cliente: {order.userName}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <img src={order.drinkImage} className="w-12 h-12 rounded bg-black object-cover" alt="" />
                <span className={`text-sm font-bold uppercase px-2 py-1 rounded ${
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  order.status === 'preparing' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                  {order.status === 'pending' ? 'NOVO' : order.status}
                </span>
              </div>
            </div>

            <button 
              onClick={() => advanceStatus(order)}
              className={`
                w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                ${order.status === 'pending' ? 'bg-blue-600 hover:bg-blue-500 text-white' : ''}
                ${order.status === 'preparing' ? 'bg-green-600 hover:bg-green-500 text-white' : ''}
                ${order.status === 'ready' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : ''}
              `}
            >
              {order.status === 'pending' && 'INICIAR PREPARO'}
              {order.status === 'preparing' && 'MARCAR PRONTO'}
              {order.status === 'ready' && <><Check /> ENTREGUE</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDisplay;

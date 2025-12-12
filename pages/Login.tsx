import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getEvent, saveEvent } from '../services/storage';
import { User, EventConfig, ThemeType } from '../types';
import { GlassWater, Lock, User as UserIcon, ChefHat } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [eventExists, setEventExists] = useState(false);

  // Admin Setup State
  const [eventName, setEventName] = useState('TH DRINKS Party');
  const [eventTheme, setEventTheme] = useState<ThemeType>('neon');
  const [eventLocation, setEventLocation] = useState('Bar do Joel');

  useEffect(() => {
    const event = getEvent();
    setEventExists(!!event);
  }, []);

  const handleGuestLogin = () => {
    const event = getEvent();
    if (!event) {
      alert("Nenhum evento ativo no momento. Peça ao ADM para configurar.");
      return;
    }

    // Check expiration
    const now = Date.now();
    const endTime = event.startTime + (event.durationHours * 60 * 60 * 1000);
    if (now > endTime) {
      alert("Este evento já encerrou.");
      return;
    }

    if (!name.trim()) return;

    const user: User = {
      id: Date.now().toString(),
      name,
      role: 'guest',
      coins: 3, // Start with 3 coins
      eventId: event.id
    };
    saveUser(user);
    navigate('/app');
  };

  const handleAdminLogin = () => {
    // Simplified Admin/Kitchen creation
    if (name.toLowerCase() === 'cozinha') {
      const user: User = { id: 'kitchen', name: 'Cozinha', role: 'kitchen', coins: 0, eventId: 'admin' };
      saveUser(user);
      navigate('/kitchen');
      return;
    }

    // If event doesn't exist, Create it
    let currentEvent = getEvent();
    if (!currentEvent) {
      currentEvent = {
        id: Date.now().toString(),
        name: eventName,
        theme: eventTheme,
        location: eventLocation,
        date: new Date().toLocaleDateString(),
        startTime: Date.now(),
        durationHours: 5
      };
      saveEvent(currentEvent);
    }

    const user: User = { id: 'admin', name: 'Administrador', role: 'admin', coins: 9999, eventId: currentEvent.id };
    saveUser(user);
    navigate('/admin');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 mb-4 animate-pulse-fast">
            <GlassWater className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            TH DRINKS
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {eventExists ? "Bem-vindo à festa!" : "Configuração do Sistema"}
          </p>
        </div>

        {!isAdminLogin ? (
          <div className="space-y-6">
            {eventExists ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Seu Nome
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Como quer ser chamado?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleGuestLogin}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform hover:scale-[1.02] transition-all"
                >
                  Entrar na Festa
                </button>
              </>
            ) : (
              <div className="text-center py-4 text-gray-400 bg-gray-900/30 rounded-lg">
                <p>Nenhum evento configurado.</p>
                <p className="text-xs mt-2">Acesse como ADM para criar.</p>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-500">Acesso Restrito</span>
              </div>
            </div>

            <button
              onClick={() => setIsAdminLogin(true)}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Lock className="h-4 w-4 mr-2" />
              Área Administrativa
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             {!eventExists ? (
               <div className="space-y-4 mb-4 border-b border-gray-700 pb-4">
                 <h3 className="text-lg font-medium text-white">Criar Novo Evento</h3>
                 <input
                    type="text"
                    placeholder="Nome do Evento"
                    className="w-full p-2 bg-gray-900 rounded border border-gray-600 text-white"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                 />
                 <input
                    type="text"
                    placeholder="Local (Ex: Bar do Joel)"
                    className="w-full p-2 bg-gray-900 rounded border border-gray-600 text-white"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                 />
                 <select 
                    className="w-full p-2 bg-gray-900 rounded border border-gray-600 text-white"
                    value={eventTheme}
                    onChange={(e) => setEventTheme(e.target.value as ThemeType)}
                 >
                   <option value="clean">Clean</option>
                   <option value="neon">Neon</option>
                   <option value="sunset">Sunset</option>
                   <option value="black">Black</option>
                   <option value="heavie">Heavie</option>
                 </select>
               </div>
             ) : (
               <p className="text-center text-green-400 text-sm">Evento Ativo: {getEvent()?.name}</p>
             )}

             <p className="text-xs text-gray-500 text-center">Para login da cozinha digite "Cozinha"</p>

             <button
              onClick={handleAdminLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {eventExists ? "Acessar Painel" : "Criar Evento & Acessar"}
            </button>
             <button
              onClick={() => setIsAdminLogin(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-white"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

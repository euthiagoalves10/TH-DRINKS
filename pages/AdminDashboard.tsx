import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, getEvent, getDrinks, saveDrink, deleteDrink, createCoinCode, getCoinCodes } from '../services/storage';
import { generateDrinkDescription } from '../services/geminiService';
import { Drink, CoinCode } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, Plus, Trash2, Sparkles, Coins, GlassWater, Image as ImageIcon, PlusCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'drinks' | 'coins'>('drinks');
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [codes, setCodes] = useState<CoinCode[]>([]);
  const event = getEvent();

  // New Drink Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newDrink, setNewDrink] = useState<Partial<Drink>>({
    name: '',
    ingredients: [],
    shortDesc: '',
    description: '',
    cost: 1,
    imageUrl: 'https://picsum.photos/400/400'
  });
  const [tempIngredient, setTempIngredient] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setDrinks(getDrinks());
    setCodes(getCoinCodes().reverse());
  };

  const handleAddIngredient = () => {
    if (tempIngredient.trim()) {
      setNewDrink(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), tempIngredient.trim()]
      }));
      setTempIngredient('');
    }
  };

  const handleGenerateDescription = async () => {
    if (!newDrink.name || !newDrink.ingredients?.length) {
      alert("Preencha o nome e ingredientes primeiro.");
      return;
    }
    setIsGeneratingAI(true);
    const desc = await generateDrinkDescription(newDrink.name, newDrink.ingredients);
    setNewDrink(prev => ({ ...prev, description: desc }));
    setIsGeneratingAI(false);
  };

  const handleSaveDrink = () => {
    if (!newDrink.name || !newDrink.cost) return;
    
    const drink: Drink = {
      id: Date.now().toString(),
      name: newDrink.name,
      shortDesc: newDrink.shortDesc || 'Bebida Refrescante',
      description: newDrink.description || 'Sem descrição.',
      ingredients: newDrink.ingredients || [],
      imageUrl: newDrink.imageUrl || 'https://picsum.photos/400/400',
      cost: newDrink.cost
    };

    saveDrink(drink);
    setIsAdding(false);
    setNewDrink({ name: '', ingredients: [], cost: 1, imageUrl: 'https://picsum.photos/400/400' });
    refreshData();
  };

  const handleDeleteDrink = (id: string) => {
    if(window.confirm('Deletar drink?')) {
      deleteDrink(id);
      refreshData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Warning: LocalStorage has limit. In real app, upload to cloud.
        setNewDrink(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCode = (amount: number) => {
    createCoinCode(amount);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">PAINEL ADMINISTRATIVO</h1>
            <p className="text-gray-400 mt-1">Evento: {event?.name} | Tema: {event?.theme}</p>
          </div>
          <button onClick={() => { logoutUser(); navigate('/'); }} className="flex items-center gap-2 text-red-400 hover:text-red-300">
            <LogOut size={20} /> Sair
          </button>
        </header>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('drinks')}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'drinks' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <GlassWater size={20} /> Drinks
          </button>
          <button 
            onClick={() => setActiveTab('coins')}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'coins' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <Coins size={20} /> Coins & QR Codes
          </button>
        </div>

        {activeTab === 'drinks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Drink List */}
             <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-200">Catálogo de Drinks</h2>
                  <button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                    <Plus size={18} /> Novo Drink
                  </button>
                </div>
                
                {drinks.map(drink => (
                  <div key={drink.id} className="bg-gray-800 p-4 rounded-xl flex gap-4 items-center border border-gray-700">
                    <img src={drink.imageUrl} alt={drink.name} className="w-16 h-16 rounded-lg object-cover bg-gray-900" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{drink.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-1">{drink.shortDesc}</p>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-blue-300 mt-1 inline-block">{drink.cost} Coins</span>
                    </div>
                    <button onClick={() => handleDeleteDrink(drink.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
             </div>

             {/* Add/Edit Form */}
             {isAdding && (
               <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl h-fit sticky top-4">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                   <PlusCircle size={20} className="text-green-500" /> Adicionar Drink
                 </h3>
                 
                 <div className="space-y-4">
                    {/* Image Upload */}
                    <div className="relative group cursor-pointer h-40 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {newDrink.imageUrl && !newDrink.imageUrl.includes('picsum') ? (
                        <img src={newDrink.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="mx-auto mb-2" />
                          <span className="text-xs">Clique para upload</span>
                        </div>
                      )}
                    </div>

                    <input 
                      className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-blue-500 outline-none" 
                      placeholder="Nome do Drink"
                      value={newDrink.name}
                      onChange={e => setNewDrink(prev => ({...prev, name: e.target.value}))}
                    />
                    
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input 
                          className="flex-1 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm"
                          placeholder="Ingrediente (ex: Vodka)"
                          value={tempIngredient}
                          onChange={e => setTempIngredient(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && handleAddIngredient()}
                        />
                        <button onClick={handleAddIngredient} className="bg-gray-700 px-3 rounded-lg hover:bg-gray-600">+</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newDrink.ingredients?.map((ing, i) => (
                          <span key={i} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-800">{ing}</span>
                        ))}
                      </div>
                    </div>

                    <textarea
                      className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-blue-500 outline-none h-24 text-sm"
                      placeholder="Descrição Sensorial"
                      value={newDrink.description}
                      onChange={e => setNewDrink(prev => ({...prev, description: e.target.value}))}
                    />
                    
                    <button 
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingAI}
                      className="w-full py-2 bg-purple-600/20 text-purple-300 border border-purple-500/50 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-600/30"
                    >
                      <Sparkles size={16} /> 
                      {isGeneratingAI ? "Gerando..." : "Gerar Descrição com IA"}
                    </button>

                    <div className="flex justify-between gap-4 pt-4">
                       <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                       <button onClick={handleSaveDrink} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold shadow-lg">Salvar Drink</button>
                    </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'coins' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Gerar Novo QR Code</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 3, 5, 10].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => handleCreateCode(amt)}
                      className="py-4 bg-gray-700 hover:bg-yellow-600/20 border border-gray-600 hover:border-yellow-500 rounded-xl font-bold text-lg transition-all"
                    >
                      {amt} Coins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-h-[600px] overflow-y-auto">
               <h3 className="text-xl font-bold mb-4">Códigos Ativos</h3>
               <div className="space-y-4">
                 {codes.map((code, idx) => (
                   <div key={idx} className="bg-white text-black p-4 rounded-xl flex items-center gap-6">
                     <QRCodeSVG value={code.code} size={80} />
                     <div className="flex-1">
                       <div className="text-3xl font-mono font-bold tracking-widest">{code.code}</div>
                       <div className="font-bold text-yellow-600">{code.amount} Coins</div>
                       <div className="text-xs text-gray-500 mt-1">Resgatado por {code.redeemedBy.length} pessoas</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
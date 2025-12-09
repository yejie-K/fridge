
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Refrigerator, Beef, Carrot, Fish, Cherry, Package, Trash2, 
  Search, Plus, RotateCcw, X, HelpCircle, ArchiveRestore 
} from 'lucide-react';
import { Category, InventoryItem } from './types';
import { AddItemModal } from './components/AddItemForm';

const STORAGE_KEY = 'smart-fridge-inventory-v2';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  
  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    } else {
        // Demo Data
        setItems([
            { id: '1', name: '全脂牛奶', quantity: 1, unit: 'L', category: Category.OTHER, addedDate: new Date(Date.now() - 86400000 * 1).toISOString(), isDeleted: false },
            { id: '2', name: '基围虾', quantity: 20, unit: '只', category: Category.SEAFOOD, addedDate: new Date(Date.now() - 86400000 * 0).toISOString(), isDeleted: false },
            { id: '3', name: '上海青', quantity: 3, unit: '把', category: Category.VEGETABLE, addedDate: new Date(Date.now() - 86400000 * 4).toISOString(), isDeleted: false },
            { id: '4', name: '牛排', quantity: 2, unit: '块', category: Category.MEAT, addedDate: new Date(Date.now() - 86400000 * 8).toISOString(), isDeleted: false },
        ]);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleAddItem = (newItem: Omit<InventoryItem, 'id' | 'addedDate'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: crypto.randomUUID(),
      addedDate: new Date().toISOString(),
      isDeleted: false
    };
    setItems(prev => [item, ...prev]);
  };

  const moveToTrash = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true } : item));
  };

  const restoreFromTrash = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isDeleted: false } : item));
  };

  const deleteForever = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
    }));
  };

  // Calculate days since added
  const getDaysStored = (dateStr: string) => {
    const added = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - added.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // Format date as yyyymmdd
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Color logic: Fresh (0-3 days) -> Medium (4-7 days) -> Old (7+ days)
  const getFreshnessColor = (days: number) => {
    if (days <= 3) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: '新鲜' };
    if (days <= 7) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: '良' };
    return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: '久置' };
  };

  const getCategoryTheme = (cat: Category) => {
      switch (cat) {
          case Category.MEAT: return { icon: Beef, bg: 'bg-red-100', text: 'text-red-600' };
          case Category.VEGETABLE: return { icon: Carrot, bg: 'bg-green-100', text: 'text-green-600' };
          case Category.FRUIT: return { icon: Cherry, bg: 'bg-pink-100', text: 'text-pink-600' };
          case Category.SEAFOOD: return { icon: Fish, bg: 'bg-blue-100', text: 'text-blue-600' };
          default: return { icon: Package, bg: 'bg-slate-100', text: 'text-slate-600' };
      }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Trash Logic
      if (showTrash) return item.isDeleted;
      if (item.isDeleted) return false;

      // Filter Logic
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()); // Newest first
  }, [items, filterCategory, searchTerm, showTrash]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans pb-32">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
            {/* Logo area */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className={`p-2 rounded-xl transition-colors ${showTrash ? 'bg-red-100 text-red-600' : 'bg-slate-900 text-white'}`}>
                   {showTrash ? <Trash2 size={20} /> : <Refrigerator size={20} />}
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">
                    {showTrash ? '回收站' : '我的冰箱'}
                </h1>
            </div>
            
            {/* Right Side: Search + Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                {/* Search Bar - Moved here */}
                {!showTrash && (
                    <div className="relative w-full max-w-[200px] transition-all">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm font-medium transition-all placeholder:text-slate-400"
                        />
                    </div>
                )}

                <button 
                    onClick={() => setShowTrash(!showTrash)}
                    className={`p-2 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center gap-2 ${
                        showTrash 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                        : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title={showTrash ? "返回冰箱" : "回收站"}
                >
                    {showTrash ? (
                         <RotateCcw size={20} />
                    ) : (
                        <Trash2 size={20} />
                    )}
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Controls (Only in Main View) - Only Categories now */}
        {!showTrash && (
            <div className="mb-6">
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                    <button 
                        onClick={() => setFilterCategory('ALL')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            filterCategory === 'ALL' 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'
                        }`}
                    >
                        全部
                    </button>
                    {Object.values(Category).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                filterCategory === cat 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* List */}
        <div className="space-y-3">
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${showTrash ? 'bg-red-50' : 'bg-slate-100'}`}>
                        {showTrash ? <Trash2 className="w-8 h-8 text-red-300" /> : <Package className="w-8 h-8 text-slate-300" />}
                    </div>
                    <p className="text-slate-500 font-medium">
                        {showTrash ? "回收站是空的" : "未找到相关食材"}
                    </p>
                </div>
            ) : (
                filteredItems.map(item => {
                    const daysStored = getDaysStored(item.addedDate);
                    const freshStatus = getFreshnessColor(daysStored);
                    const theme = getCategoryTheme(item.category);
                    const Icon = theme.icon;
                    
                    return (
                        <div key={item.id} className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-3">
                            {/* Left Side: Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Category Icon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.bg} ${theme.text}`}>
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2 w-full">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                                            {item.name}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {/* Date moved here */}
                                        <span className="text-[10px] text-slate-400 font-mono font-medium whitespace-nowrap flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            {formatDate(item.addedDate)}
                                        </span>
                                        {!showTrash && (
                                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${freshStatus.bg} ${freshStatus.text} ${freshStatus.border}`}>
                                                已存 {daysStored} 天
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Fixed Actions */}
                            <div className="flex items-center pl-2 flex-shrink-0">
                                {showTrash ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => restoreFromTrash(item.id)}
                                            className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                                            title="恢复"
                                        >
                                            <ArchiveRestore size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteForever(item.id)}
                                            className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                            title="彻底删除"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 sm:gap-4">
                                         {/* Quantity Controls - Fixed container */}
                                         <div className="flex items-center bg-slate-50 rounded-xl p-1 h-10 w-[110px] justify-between">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                                className="w-7 h-full flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all font-bold text-lg leading-none pb-0.5"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center flex flex-col items-center justify-center leading-none">
                                                <span className="font-bold text-slate-700 text-sm block">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-normal block -mt-0.5 truncate max-w-[40px]">
                                                    {item.unit}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                                className="w-7 h-full flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all font-bold text-lg leading-none pb-0.5"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => moveToTrash(item.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </main>

      {/* Floating Action Button */}
      {!showTrash && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-[20px] shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 group"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
      )}

      {/* Add Item Modal */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddItem}
      />
    </div>
  );
};

export default App;

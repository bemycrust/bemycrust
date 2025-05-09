
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type CrustType = 'Classic' | 'Thin' | 'Neopolitan' | 'Cheese Filled' | 'Whole Wheat';
export type PizzaSize = 'Small' | 'Medium' | 'Large' | 'Extra-Large';

export interface InventoryItem {
  id: string;
  name: string;
  startingWeight: number;
  endingWeight: number;
  unit: string;
  lastUpdated: string;
  updateFrequency: 'daily' | 'weekly';
}

export interface PizzaMenuItem {
  id: string;
  name: string;
  size: PizzaSize;
  crustType: CrustType;
  ingredients: { itemId: string; amount: number }[];
}

export interface SaleRecord {
  id: string;
  pizzaId: string;
  pizzaName: string;
  pizzaSize: PizzaSize;
  crustType: CrustType;
  quantity: number;
  date: string;
  staffName: string;
}

export interface DailyReport {
  date: string;
  inventoryUsage: {
    itemId: string;
    itemName: string;
    used: number;
    expected: number;
    difference: number;
  }[];
  sales: SaleRecord[];
  staffName: string;
}

interface AppContextType {
  inventory: InventoryItem[];
  menuItems: PizzaMenuItem[];
  sales: SaleRecord[];
  reports: DailyReport[];
  currentDate: string;
  selectedTab: string;
  staffName: string;
  setStaffName: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  addMenuItem: (item: Omit<PizzaMenuItem, 'id'>) => void;
  addSale: (sale: Omit<SaleRecord, 'id' | 'date'>) => void;
  generateReport: () => void;
  isPasswordRequired: (section: string) => boolean;
  checkPassword: (password: string) => boolean;
  saveData: () => void;
  searchPizzas: (query: string) => PizzaMenuItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const PASSWORD = "bemycrust@123";
const PASSWORD_PROTECTED_SECTIONS = ["Report", "History", "Menu Items"];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize state from localStorage or with defaults
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState<PizzaMenuItem[]>(() => {
    const saved = localStorage.getItem('menuItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTab, setSelectedTab] = useState<string>('Inventory');
  const [staffName, setStaffName] = useState<string>('');

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Check if a section requires password
  const isPasswordRequired = (section: string): boolean => {
    return PASSWORD_PROTECTED_SECTIONS.includes(section);
  };

  // Check if the password is correct
  const checkPassword = (password: string): boolean => {
    return password === PASSWORD;
  };

  // Save all data to localStorage
  const saveData = () => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('reports', JSON.stringify(reports));
    console.log("All data saved successfully");
  };

  // Add inventory item
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: currentDate
    };
    setInventory(prev => [...prev, newItem]);
  };

  // Update inventory item
  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...data, lastUpdated: currentDate } : item
    ));
  };

  // Add menu item
  const addMenuItem = (item: Omit<PizzaMenuItem, 'id'>) => {
    const newItem: PizzaMenuItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  // Add sale record
  const addSale = (sale: Omit<SaleRecord, 'id' | 'date'>) => {
    const newSale: SaleRecord = {
      ...sale,
      id: Date.now().toString(),
      date: currentDate
    };
    setSales(prev => [...prev, newSale]);
  };

  // Generate report based on inventory and sales
  const generateReport = () => {
    // Simple report generation logic
    const dailyInventoryUsage = inventory.map(item => {
      const usedAmount = item.startingWeight - item.endingWeight;
      
      // Calculate expected usage based on sales
      const relevantMenuItems = menuItems.filter(menuItem => 
        menuItem.ingredients.some(ing => ing.itemId === item.id)
      );
      
      let expectedUsage = 0;
      
      relevantMenuItems.forEach(menuItem => {
        const ingredientAmount = menuItem.ingredients.find(ing => ing.itemId === item.id)?.amount || 0;
        const salesCount = sales.filter(sale => 
          sale.date === currentDate && sale.pizzaId === menuItem.id
        ).reduce((total, sale) => total + sale.quantity, 0);
        
        expectedUsage += ingredientAmount * salesCount;
      });
      
      return {
        itemId: item.id,
        itemName: item.name,
        used: usedAmount,
        expected: expectedUsage,
        difference: usedAmount - expectedUsage
      };
    });
    
    const todaySales = sales.filter(sale => sale.date === currentDate);
    
    const newReport: DailyReport = {
      date: currentDate,
      inventoryUsage: dailyInventoryUsage,
      sales: todaySales,
      staffName: staffName
    };
    
    setReports(prev => [...prev, newReport]);
  };

  // Search pizzas by name, crust type, or size
  const searchPizzas = (query: string): PizzaMenuItem[] => {
    const lowercaseQuery = query.toLowerCase();
    return menuItems.filter(pizza => 
      pizza.name.toLowerCase().includes(lowercaseQuery) || 
      pizza.crustType.toLowerCase().includes(lowercaseQuery) ||
      pizza.size.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('reports', JSON.stringify(reports));
  }, [reports]);

  // Clean up data older than 1 month
  useEffect(() => {
    const cleanupOldData = () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const cutoffDate = oneMonthAgo.toISOString().split('T')[0];

      const filteredSales = sales.filter(sale => sale.date >= cutoffDate);
      const filteredReports = reports.filter(report => report.date >= cutoffDate);

      if (filteredSales.length !== sales.length) {
        setSales(filteredSales);
      }

      if (filteredReports.length !== reports.length) {
        setReports(filteredReports);
      }
    };

    cleanupOldData();
  }, [sales, reports]);

  const value = {
    inventory,
    menuItems,
    sales,
    reports,
    currentDate,
    selectedTab,
    staffName,
    setStaffName,
    setSelectedTab,
    addInventoryItem,
    updateInventoryItem,
    addMenuItem,
    addSale,
    generateReport,
    isPasswordRequired,
    checkPassword,
    saveData,
    searchPizzas
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

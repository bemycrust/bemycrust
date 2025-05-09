
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type CrustType = 'Classic' | 'Thin' | 'Neopolitan' | 'Cheese Filled' | 'Whole Wheat';
export type PizzaSize = 'Small' | 'Medium' | 'Large' | 'Extra-Large';
export type ItemType = 'Pizza' | 'Fries' | 'Drink' | 'Extra';

export interface InventoryItem {
  id: string;
  name: string;
  startingWeight: number;
  endingWeight: number;
  unit: string;
  lastUpdated: string;
  updateFrequency: 'daily' | 'weekly';
}

export interface PackagingItem {
  id: string;
  name: string;
  size: string;
  cost: number;
}

export interface MenuItem {
  id: string;
  name: string;
  type: ItemType;
  ingredients: { itemId: string; amount: number }[];
}

export interface PizzaMenuItem extends MenuItem {
  size: PizzaSize;
  crustType: CrustType;
  packagingId: string;
}

export interface FriesMenuItem extends MenuItem {
  variant: string;
  packagingId: string;
}

export interface DrinkMenuItem extends MenuItem {
  variant: string;
  size: string;
  packagingIds: string[]; // For glass, lid, straw
}

export interface ExtraItem {
  id: string;
  name: string;
  type: 'Extra';
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  quantity: number;
  date: string;
  staffName: string;
  price: number;
  details?: {
    size?: string;
    variant?: string;
    crustType?: string;
  };
}

export interface MiscSaleRecord {
  id: string;
  name: string;
  amount: number;
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
  miscSales: MiscSaleRecord[];
  packagingUsed: {
    id: string;
    name: string;
    count: number;
    cost: number;
  }[];
  staffName: string;
}

interface ReportTimeframe {
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

interface AppContextType {
  inventory: InventoryItem[];
  menuItems: (PizzaMenuItem | FriesMenuItem | DrinkMenuItem)[];
  extraItems: ExtraItem[];
  packaging: PackagingItem[];
  sales: SaleRecord[];
  miscSales: MiscSaleRecord[];
  reports: DailyReport[];
  currentDate: string;
  selectedTab: string;
  staffName: string;
  reportTimeframe: ReportTimeframe;
  setStaffName: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  setReportTimeframe: (timeframe: ReportTimeframe) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  addMenuItem: (item: Omit<PizzaMenuItem | FriesMenuItem | DrinkMenuItem, 'id'>) => void;
  addMiscSale: (sale: Omit<MiscSaleRecord, 'id'>) => void;
  addExtraItem: (item: Omit<ExtraItem, 'id'>) => void;
  addPackaging: (item: Omit<PackagingItem, 'id'>) => void;
  addSale: (sale: Omit<SaleRecord, 'id' | 'date'>) => void;
  generateReport: () => void;
  generateTimeframeReport: (timeframe: ReportTimeframe) => DailyReport;
  isPasswordRequired: (section: string) => boolean;
  checkPassword: (password: string) => boolean;
  saveData: () => void;
  searchItems: (query: string, type?: ItemType) => (PizzaMenuItem | FriesMenuItem | DrinkMenuItem)[];
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

  const [menuItems, setMenuItems] = useState<(PizzaMenuItem | FriesMenuItem | DrinkMenuItem)[]>(() => {
    const saved = localStorage.getItem('menuItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [extraItems, setExtraItems] = useState<ExtraItem[]>(() => {
    const saved = localStorage.getItem('extraItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [packaging, setPackaging] = useState<PackagingItem[]>(() => {
    const saved = localStorage.getItem('packaging');
    return saved ? JSON.parse(saved) : [
      { id: "pkg-1", name: "Small Pizza Box", size: "Small", cost: 5 },
      { id: "pkg-2", name: "Medium Pizza Box", size: "Medium", cost: 8 },
      { id: "pkg-3", name: "Large Pizza Box", size: "Large", cost: 10 },
      { id: "pkg-4", name: "Fries Box", size: "Standard", cost: 3 },
      { id: "pkg-5", name: "Glass", size: "Standard", cost: 2 },
      { id: "pkg-6", name: "Lid", size: "Standard", cost: 1 },
      { id: "pkg-7", name: "Straw", size: "Standard", cost: 0.5 }
    ];
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [miscSales, setMiscSales] = useState<MiscSaleRecord[]>(() => {
    const saved = localStorage.getItem('miscSales');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTab, setSelectedTab] = useState<string>('Inventory');
  const [staffName, setStaffName] = useState<string>('');
  const [reportTimeframe, setReportTimeframe] = useState<ReportTimeframe>({
    type: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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
    localStorage.setItem('extraItems', JSON.stringify(extraItems));
    localStorage.setItem('packaging', JSON.stringify(packaging));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('miscSales', JSON.stringify(miscSales));
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

  // Add menu item (pizza, fries, or drink)
  const addMenuItem = (item: Omit<PizzaMenuItem | FriesMenuItem | DrinkMenuItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  // Add extra item
  const addExtraItem = (item: Omit<ExtraItem, 'id'>) => {
    const newItem: ExtraItem = {
      ...item,
      id: Date.now().toString()
    };
    setExtraItems(prev => [...prev, newItem]);
  };

  // Add packaging item
  const addPackaging = (item: Omit<PackagingItem, 'id'>) => {
    const newItem: PackagingItem = {
      ...item,
      id: Date.now().toString()
    };
    setPackaging(prev => [...prev, newItem]);
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

  // Add miscellaneous sale
  const addMiscSale = (sale: Omit<MiscSaleRecord, 'id'>) => {
    const newMiscSale: MiscSaleRecord = {
      ...sale,
      id: Date.now().toString()
    };
    setMiscSales(prev => [...prev, newMiscSale]);
  };

  // Calculate packaging usage for a timeframe
  const calculatePackagingUsage = (salesData: SaleRecord[]) => {
    const packagingUsage = packaging.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      count: 0,
      cost: pkg.cost
    }));

    salesData.forEach(sale => {
      const menuItem = menuItems.find(item => item.id === sale.itemId);
      if (!menuItem) return;

      if (menuItem.type === 'Pizza') {
        const pizzaItem = menuItem as PizzaMenuItem;
        const pkg = packaging.find(p => p.id === pizzaItem.packagingId);
        if (pkg) {
          const packagingIndex = packagingUsage.findIndex(p => p.id === pkg.id);
          if (packagingIndex >= 0) {
            packagingUsage[packagingIndex].count += sale.quantity;
          }
        }
      } else if (menuItem.type === 'Fries') {
        const friesItem = menuItem as FriesMenuItem;
        const pkg = packaging.find(p => p.id === friesItem.packagingId);
        if (pkg) {
          const packagingIndex = packagingUsage.findIndex(p => p.id === pkg.id);
          if (packagingIndex >= 0) {
            packagingUsage[packagingIndex].count += sale.quantity;
          }
        }
      } else if (menuItem.type === 'Drink') {
        const drinkItem = menuItem as DrinkMenuItem;
        drinkItem.packagingIds.forEach(pkgId => {
          const pkg = packaging.find(p => p.id === pkgId);
          if (pkg) {
            const packagingIndex = packagingUsage.findIndex(p => p.id === pkg.id);
            if (packagingIndex >= 0) {
              packagingUsage[packagingIndex].count += sale.quantity;
            }
          }
        });
      }
    });

    return packagingUsage;
  };

  // Generate daily report based on inventory and sales
  const generateReport = () => {
    // Calculate inventory usage
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
          sale.date === currentDate && sale.itemId === menuItem.id
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
    
    // Get today's sales
    const todaySales = sales.filter(sale => sale.date === currentDate);
    const todayMiscSales = miscSales.filter(sale => sale.date === currentDate);
    
    // Calculate packaging usage
    const packagingUsed = calculatePackagingUsage(todaySales);
    
    // Create report
    const newReport: DailyReport = {
      date: currentDate,
      inventoryUsage: dailyInventoryUsage,
      sales: todaySales,
      miscSales: todayMiscSales,
      packagingUsed: packagingUsed,
      staffName: staffName
    };
    
    setReports(prev => [...prev, newReport]);
  };

  // Generate report for specific timeframe (weekly/monthly)
  const generateTimeframeReport = (timeframe: ReportTimeframe): DailyReport => {
    const { startDate, endDate } = timeframe;
    
    // Get sales within the timeframe
    const timeframeSales = sales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    );
    
    const timeframeMiscSales = miscSales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    );
    
    // Calculate packaging usage for the timeframe
    const packagingUsed = calculatePackagingUsage(timeframeSales);
    
    // For inventory usage, we'll aggregate data from daily reports in this timeframe
    const timeframeReports = reports.filter(report => 
      report.date >= startDate && report.date <= endDate
    );
    
    // Aggregate inventory usage across reports
    const inventoryUsage: {[key: string]: {
      itemId: string;
      itemName: string;
      used: number;
      expected: number;
      difference: number;
    }} = {};
    
    timeframeReports.forEach(report => {
      report.inventoryUsage.forEach(item => {
        if (!inventoryUsage[item.itemId]) {
          inventoryUsage[item.itemId] = {
            itemId: item.itemId,
            itemName: item.itemName,
            used: 0,
            expected: 0,
            difference: 0
          };
        }
        
        inventoryUsage[item.itemId].used += item.used;
        inventoryUsage[item.itemId].expected += item.expected;
        inventoryUsage[item.itemId].difference += item.difference;
      });
    });
    
    // Create aggregated report
    return {
      date: `${startDate} to ${endDate}`,
      inventoryUsage: Object.values(inventoryUsage),
      sales: timeframeSales,
      miscSales: timeframeMiscSales,
      packagingUsed,
      staffName: staffName
    };
  };

  // Search menu items by name, type, variant, etc.
  const searchItems = (query: string, type?: ItemType): (PizzaMenuItem | FriesMenuItem | DrinkMenuItem)[] => {
    const lowercaseQuery = query.toLowerCase();
    return menuItems.filter(item => {
      // Filter by type if specified
      if (type && item.type !== type) {
        return false;
      }
      
      // Search by name
      if (item.name.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search by specific properties based on item type
      if (item.type === 'Pizza') {
        const pizzaItem = item as PizzaMenuItem;
        return (
          pizzaItem.size.toLowerCase().includes(lowercaseQuery) ||
          pizzaItem.crustType.toLowerCase().includes(lowercaseQuery)
        );
      } else if (item.type === 'Fries') {
        const friesItem = item as FriesMenuItem;
        return friesItem.variant.toLowerCase().includes(lowercaseQuery);
      } else if (item.type === 'Drink') {
        const drinkItem = item as DrinkMenuItem;
        return (
          drinkItem.variant.toLowerCase().includes(lowercaseQuery) ||
          drinkItem.size.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      return false;
    });
  };

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('extraItems', JSON.stringify(extraItems));
  }, [extraItems]);

  useEffect(() => {
    localStorage.setItem('packaging', JSON.stringify(packaging));
  }, [packaging]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('miscSales', JSON.stringify(miscSales));
  }, [miscSales]);

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
      const filteredMiscSales = miscSales.filter(sale => sale.date >= cutoffDate);
      const filteredReports = reports.filter(report => {
        // Handle both daily reports and timeframe reports
        if (report.date.includes(' to ')) {
          const [_, endDate] = report.date.split(' to ');
          return endDate >= cutoffDate;
        }
        return report.date >= cutoffDate;
      });

      if (filteredSales.length !== sales.length) {
        setSales(filteredSales);
      }

      if (filteredMiscSales.length !== miscSales.length) {
        setMiscSales(filteredMiscSales);
      }

      if (filteredReports.length !== reports.length) {
        setReports(filteredReports);
      }
    };

    cleanupOldData();
  }, [sales, miscSales, reports]);

  const value = {
    inventory,
    menuItems,
    extraItems,
    packaging,
    sales,
    miscSales,
    reports,
    currentDate,
    selectedTab,
    staffName,
    reportTimeframe,
    setStaffName,
    setSelectedTab,
    setReportTimeframe,
    addInventoryItem,
    updateInventoryItem,
    addMenuItem,
    addMiscSale,
    addExtraItem,
    addPackaging,
    addSale,
    generateReport,
    generateTimeframeReport,
    isPasswordRequired,
    checkPassword,
    saveData,
    searchItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

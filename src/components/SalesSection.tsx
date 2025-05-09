
import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SalesSection: React.FC = () => {
  const { 
    menuItems, 
    addSale, 
    addMiscSale,
    currentDate, 
    staffName, 
    setStaffName, 
    searchItems, 
    saveData 
  } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pizza');
  const [savedRecords, setSavedRecords] = useState<boolean>(false);
  
  const handleSaveAllData = () => {
    saveData();
    setSavedRecords(true);
    
    toast({
      title: "Data Saved",
      description: "All sales and inventory data has been saved",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Sales</h2>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </div>
      <p className="text-gray-600">Record sales of menu items</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
          <Input
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
      </div>
      
      <Tabs defaultValue="pizza" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pizza">Pizza</TabsTrigger>
          <TabsTrigger value="fries">Fries</TabsTrigger>
          <TabsTrigger value="drinks">Drinks</TabsTrigger>
          <TabsTrigger value="misc">Misc Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pizza">
          <PizzaSalesTab />
        </TabsContent>
        
        <TabsContent value="fries">
          <FriesSalesTab />
        </TabsContent>
        
        <TabsContent value="drinks">
          <DrinksSalesTab />
        </TabsContent>
        
        <TabsContent value="misc">
          <MiscSalesTab />
        </TabsContent>
      </Tabs>

      <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button 
            onClick={handleSaveAllData} 
            variant={savedRecords ? "outline" : "default"}
            className="md:w-auto"
            size="lg"
          >
            {savedRecords ? "Data Saved" : "Save All Data"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PizzaSalesTab: React.FC = () => {
  const { menuItems, addSale, staffName, searchItems } = useAppContext();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPizzaId, setSelectedPizzaId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const pizzaItems = useMemo(() => 
    menuItems.filter(item => item.type === 'Pizza'), 
    [menuItems]
  );
  
  const filteredPizzas = useMemo(() => {
    if (searchQuery) {
      return searchItems(searchQuery, 'Pizza');
    }
    return pizzaItems;
  }, [searchQuery, pizzaItems, searchItems]);

  // Group pizzas by name for easier selection
  const pizzaGroups: Record<string, {id: string, name: string, variants: string[]}> = useMemo(() => {
    const groups: Record<string, {id: string, name: string, variants: string[]}> = {};
    
    filteredPizzas.forEach(pizza => {
      if (pizza.type !== 'Pizza') return;
      
      const key = pizza.name;
      if (!groups[key]) {
        groups[key] = {
          id: pizza.id,
          name: pizza.name,
          variants: []
        };
      }
      const pizzaItem = pizza as any;
      groups[key].variants.push(`${pizzaItem.size} - ${pizzaItem.crustType}`);
    });
    
    return groups;
  }, [filteredPizzas]);

  const selectedPizza = menuItems.find(p => p.id === selectedPizzaId);

  const handleRecordSale = () => {
    if (!selectedPizzaId) {
      toast({
        title: "Error",
        description: "Please select a pizza",
        variant: "destructive",
      });
      return;
    }

    if (!staffName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPizza) return;

    const typedPizza = selectedPizza as any;

    addSale({
      itemId: selectedPizza.id,
      itemName: selectedPizza.name,
      itemType: selectedPizza.type,
      quantity,
      staffName,
      price: typedPizza.price * quantity,
      details: {
        size: typedPizza.size,
        crustType: typedPizza.crustType
      }
    });

    toast({
      title: "Success",
      description: `Recorded sale of ${quantity} ${selectedPizza.name}`,
    });

    setSelectedPizzaId('');
    setQuantity(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Pizza Sales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Pizza</label>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, size, or crust..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pizza</label>
          <Select value={selectedPizzaId} onValueChange={setSelectedPizzaId}>
            <SelectTrigger>
              <SelectValue placeholder="Select pizza" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(pizzaGroups).map(([name, group]) => (
                <React.Fragment key={name}>
                  <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{name}</div>
                  {filteredPizzas
                    .filter(pizza => pizza.name === name && pizza.type === 'Pizza')
                    .map(pizza => {
                      const typedPizza = pizza as any;
                      return (
                        <SelectItem key={pizza.id} value={pizza.id}>
                          {typedPizza.size} - {typedPizza.crustType}
                        </SelectItem>
                      );
                    })}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleRecordSale} className="w-full">Record Sale</Button>
        </div>
      </div>

      {selectedPizza && selectedPizza.type === 'Pizza' && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium text-lg mb-2">Selected Pizza Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500 text-sm block">Name</span>
              <span className="font-medium">{selectedPizza.name}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Size</span>
              <span className="font-medium">{(selectedPizza as any).size}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Crust</span>
              <span className="font-medium">{(selectedPizza as any).crustType}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Price</span>
              <span className="font-medium">₹{(selectedPizza as any).price}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FriesSalesTab: React.FC = () => {
  const { menuItems, addSale, staffName, searchItems } = useAppContext();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriesId, setSelectedFriesId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const friesItems = useMemo(() => 
    menuItems.filter(item => item.type === 'Fries'), 
    [menuItems]
  );
  
  const filteredFries = useMemo(() => {
    if (searchQuery) {
      return searchItems(searchQuery, 'Fries');
    }
    return friesItems;
  }, [searchQuery, friesItems, searchItems]);

  const selectedFries = menuItems.find(p => p.id === selectedFriesId);

  const handleRecordSale = () => {
    if (!selectedFriesId) {
      toast({
        title: "Error",
        description: "Please select a fries item",
        variant: "destructive",
      });
      return;
    }

    if (!staffName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFries) return;

    const typedFries = selectedFries as any;

    addSale({
      itemId: selectedFries.id,
      itemName: selectedFries.name,
      itemType: selectedFries.type,
      quantity,
      staffName,
      price: typedFries.price * quantity,
      details: {
        variant: typedFries.variant
      }
    });

    toast({
      title: "Success",
      description: `Recorded sale of ${quantity} ${typedFries.variant} Fries`,
    });

    setSelectedFriesId('');
    setQuantity(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Fries Sales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Fries</label>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fries variants..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fries</label>
          <Select value={selectedFriesId} onValueChange={setSelectedFriesId}>
            <SelectTrigger>
              <SelectValue placeholder="Select fries" />
            </SelectTrigger>
            <SelectContent>
              {filteredFries.map(fries => {
                const typedFries = fries as any;
                return (
                  <SelectItem key={fries.id} value={fries.id}>
                    {typedFries.variant} Fries
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleRecordSale} className="w-full">Record Sale</Button>
        </div>
      </div>

      {selectedFries && selectedFries.type === 'Fries' && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium text-lg mb-2">Selected Fries Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 text-sm block">Variant</span>
              <span className="font-medium">{(selectedFries as any).variant}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Price</span>
              <span className="font-medium">₹{(selectedFries as any).price}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Total</span>
              <span className="font-medium">₹{(selectedFries as any).price * quantity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DrinksSalesTab: React.FC = () => {
  const { menuItems, addSale, staffName, searchItems } = useAppContext();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const drinkItems = useMemo(() => 
    menuItems.filter(item => item.type === 'Drink'), 
    [menuItems]
  );
  
  const filteredDrinks = useMemo(() => {
    if (searchQuery) {
      return searchItems(searchQuery, 'Drink');
    }
    return drinkItems;
  }, [searchQuery, drinkItems, searchItems]);

  // Group drinks by name
  const drinkGroups: Record<string, any[]> = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    filteredDrinks.forEach(drink => {
      const key = drink.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(drink);
    });
    
    return groups;
  }, [filteredDrinks]);

  const selectedDrink = menuItems.find(p => p.id === selectedDrinkId);

  const handleRecordSale = () => {
    if (!selectedDrinkId) {
      toast({
        title: "Error",
        description: "Please select a drink",
        variant: "destructive",
      });
      return;
    }

    if (!staffName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDrink) return;

    const typedDrink = selectedDrink as any;

    addSale({
      itemId: selectedDrink.id,
      itemName: selectedDrink.name,
      itemType: selectedDrink.type,
      quantity,
      staffName,
      price: typedDrink.price * quantity,
      details: {
        variant: typedDrink.variant,
        size: typedDrink.size
      }
    });

    toast({
      title: "Success",
      description: `Recorded sale of ${quantity} ${selectedDrink.name}`,
    });

    setSelectedDrinkId('');
    setQuantity(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Drinks Sales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Drinks</label>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, variant, or size..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Drink</label>
          <Select value={selectedDrinkId} onValueChange={setSelectedDrinkId}>
            <SelectTrigger>
              <SelectValue placeholder="Select drink" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(drinkGroups).map(([name, variants]) => (
                <React.Fragment key={name}>
                  <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">{name}</div>
                  {variants.map(drink => (
                    <SelectItem key={drink.id} value={drink.id}>
                      {drink.variant} - {drink.size}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleRecordSale} className="w-full">Record Sale</Button>
        </div>
      </div>

      {selectedDrink && selectedDrink.type === 'Drink' && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium text-lg mb-2">Selected Drink Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500 text-sm block">Name</span>
              <span className="font-medium">{selectedDrink.name}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Variant</span>
              <span className="font-medium">{(selectedDrink as any).variant}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Size</span>
              <span className="font-medium">{(selectedDrink as any).size}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Price</span>
              <span className="font-medium">₹{(selectedDrink as any).price}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MiscSalesTab: React.FC = () => {
  const { addMiscSale, staffName, currentDate } = useAppContext();
  const { toast } = useToast();
  
  const [miscItem, setMiscItem] = useState({
    name: '',
    amount: 0
  });

  const handleRecordMiscSale = () => {
    if (!miscItem.name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    if (!miscItem.amount || miscItem.amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!staffName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    addMiscSale({
      name: miscItem.name,
      amount: miscItem.amount,
      staffName,
      date: currentDate
    });

    toast({
      title: "Success",
      description: `Recorded ${miscItem.name} sale for ₹${miscItem.amount}`,
    });

    setMiscItem({
      name: '',
      amount: 0
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Miscellaneous Sales</h3>
      <p className="text-gray-600 mb-4">Record extra items like extra cheese, toppings, or other items not in the menu</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <Input
            value={miscItem.name}
            onChange={(e) => setMiscItem({ ...miscItem, name: e.target.value })}
            placeholder="e.g., Extra Cheese, Special Topping, etc."
          />
        </div>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <Input
            type="number"
            value={miscItem.amount || ''}
            onChange={(e) => setMiscItem({ ...miscItem, amount: Number(e.target.value) })}
            placeholder="Enter amount"
          />
        </div>

        <div className="md:col-span-2">
          <Button onClick={handleRecordMiscSale} className="w-full">Record Miscellaneous Sale</Button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Common Miscellaneous Items:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={() => setMiscItem({ name: "Extra Cheese", amount: 30 })}
          >
            Extra Cheese (₹30)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMiscItem({ name: "Special Toppings", amount: 50 })}
          >
            Special Toppings (₹50)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMiscItem({ name: "Garlic Dip", amount: 15 })}
          >
            Garlic Dip (₹15)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMiscItem({ name: "Oregano", amount: 5 })}
          >
            Oregano (₹5)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesSection;

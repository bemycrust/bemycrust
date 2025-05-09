
import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

const SalesSection: React.FC = () => {
  const { menuItems, addSale, currentDate, staffName, setStaffName, searchPizzas, saveData } = useAppContext();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPizzaId, setSelectedPizzaId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [savedRecords, setSavedRecords] = useState<boolean>(false);
  
  const filteredPizzas = useMemo(() => {
    if (searchQuery) {
      return searchPizzas(searchQuery);
    }
    return menuItems;
  }, [searchQuery, menuItems, searchPizzas]);

  // Group pizzas by name for easier selection
  const pizzaGroups: Record<string, {id: string, name: string, variants: string[]}> = useMemo(() => {
    const groups: Record<string, {id: string, name: string, variants: string[]}> = {};
    
    filteredPizzas.forEach(pizza => {
      const key = pizza.name;
      if (!groups[key]) {
        groups[key] = {
          id: pizza.id,
          name: pizza.name,
          variants: []
        };
      }
      groups[key].variants.push(`${pizza.size} - ${pizza.crustType}`);
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

    addSale({
      pizzaId: selectedPizza.id,
      pizzaName: selectedPizza.name,
      pizzaSize: selectedPizza.size,
      crustType: selectedPizza.crustType,
      quantity,
      staffName
    });

    toast({
      title: "Success",
      description: `Recorded sale of ${quantity} ${selectedPizza.name}`,
    });

    setSelectedPizzaId('');
    setQuantity(1);
    setSavedRecords(false);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
            <Input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </div>

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
                      .filter(pizza => pizza.name === name)
                      .map(pizza => (
                        <SelectItem key={pizza.id} value={pizza.id}>
                          {pizza.size} - {pizza.crustType}
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
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
          <Button onClick={handleRecordSale} className="md:w-auto">Record Sale</Button>
          <Button 
            onClick={handleSaveAllData} 
            variant={savedRecords ? "outline" : "default"}
            className="md:w-auto"
          >
            {savedRecords ? "Data Saved" : "Save All Data"}
          </Button>
        </div>
      </div>

      {selectedPizza && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-medium text-lg mb-2">Selected Pizza Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 text-sm block">Name</span>
              <span className="font-medium">{selectedPizza.name}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Size</span>
              <span className="font-medium">{selectedPizza.size}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Crust</span>
              <span className="font-medium">{selectedPizza.crustType}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesSection;

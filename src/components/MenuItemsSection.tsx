
import React, { useState } from 'react';
import { useAppContext, PizzaMenuItem } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const MenuItemsSection: React.FC = () => {
  const { menuItems, addMenuItem, inventory } = useAppContext();
  const { toast } = useToast();
  
  const [newPizza, setNewPizza] = useState({
    name: '',
    size: 'Medium' as const,
    crustType: 'Classic' as const,
  });

  const crustOptions = ['Classic', 'Thin', 'Neopolitan', 'Cheese Filled', 'Whole Wheat'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra-Large'];

  const handleAddPizza = () => {
    if (!newPizza.name) {
      toast({
        title: "Error",
        description: "Please enter a pizza name",
        variant: "destructive",
      });
      return;
    }

    // Simple ingredients placeholder - in a real app, you'd allow selecting ingredients
    const ingredients = inventory.slice(0, 3).map(item => ({
      itemId: item.id,
      amount: Math.floor(Math.random() * 100) + 50 // Random amount between 50-150
    }));

    addMenuItem({
      name: newPizza.name,
      size: newPizza.size,
      crustType: newPizza.crustType,
      ingredients: ingredients
    });

    toast({
      title: "Success",
      description: "Pizza menu item added",
    });

    setNewPizza({
      name: '',
      size: 'Medium',
      crustType: 'Classic',
    });
  };

  // Group pizzas by name
  const pizzaGroups: Record<string, PizzaMenuItem[]> = {};
  menuItems.forEach(pizza => {
    if (!pizzaGroups[pizza.name]) {
      pizzaGroups[pizza.name] = [];
    }
    pizzaGroups[pizza.name].push(pizza);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Pizza Menu Items</h2>
        <p className="text-gray-600">Add and manage pizza menu items and their recipes</p>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">New Pizza Name</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pizza Name</label>
              <Input
                value={newPizza.name}
                onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                placeholder="Enter pizza name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <RadioGroup 
                value={newPizza.size} 
                onValueChange={(value) => setNewPizza({ ...newPizza, size: value as any })}
                className="flex flex-wrap gap-4"
              >
                {sizeOptions.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <Label htmlFor={`size-${size}`}>{size}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crust Type</label>
              <RadioGroup 
                value={newPizza.crustType} 
                onValueChange={(value) => setNewPizza({ ...newPizza, crustType: value as any })}
                className="flex flex-wrap gap-4"
              >
                {crustOptions.map(crust => (
                  <div key={crust} className="flex items-center space-x-2">
                    <RadioGroupItem value={crust} id={`crust-${crust}`} />
                    <Label htmlFor={`crust-${crust}`}>{crust}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button onClick={handleAddPizza} className="w-full">Add Pizza to Menu</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Select a pizza to edit:</h3>
          {Object.keys(pizzaGroups).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(pizzaGroups).map(([pizzaName, variants]) => (
                <div key={pizzaName} className="border p-4 rounded-md">
                  <h4 className="font-medium text-lg">{pizzaName}</h4>
                  <div className="mt-2 space-y-1">
                    {variants.map(pizza => (
                      <div key={pizza.id} className="text-sm text-gray-600">
                        {pizza.size} - {pizza.crustType}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No menu items added yet.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
        <h3 className="text-lg font-medium mb-4">Recipe</h3>
        <p className="text-gray-600 mb-4">Select a menu item on the left to edit its recipe.</p>
        
        <div className="text-center py-12">
          <p className="text-gray-500">Select a pizza on the left to edit its recipe.</p>
        </div>
      </div>
    </div>
  );
};

export default MenuItemsSection;

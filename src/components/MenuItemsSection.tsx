
import React, { useState } from 'react';
import { useAppContext, PizzaMenuItem, FriesMenuItem, DrinkMenuItem, PackagingItem } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const MenuItemsSection: React.FC = () => {
  const { menuItems, addMenuItem, inventory, packaging } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pizza');
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Menu Items</h2>
      <p className="text-gray-600">Add and manage menu items and their recipes</p>
      
      <Tabs defaultValue="pizza" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pizza">Pizza</TabsTrigger>
          <TabsTrigger value="fries">Fries</TabsTrigger>
          <TabsTrigger value="drinks">Drinks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pizza" className="space-y-4">
          <PizzaTab />
        </TabsContent>
        
        <TabsContent value="fries" className="space-y-4">
          <FriesTab />
        </TabsContent>
        
        <TabsContent value="drinks" className="space-y-4">
          <DrinksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PizzaTab: React.FC = () => {
  const { menuItems, addMenuItem, inventory, packaging } = useAppContext();
  const { toast } = useToast();
  
  const [newPizza, setNewPizza] = useState({
    name: '',
    size: 'Medium' as const,
    crustType: 'Classic' as const,
    packagingId: '',
    price: 0
  });

  const crustOptions = ['Classic', 'Thin', 'Neopolitan', 'Cheese Filled', 'Whole Wheat'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra-Large'];
  
  // Filter pizza related packaging
  const pizzaPackaging = packaging.filter(pkg => 
    pkg.name.toLowerCase().includes('pizza')
  );

  const handleAddPizza = () => {
    if (!newPizza.name) {
      toast({
        title: "Error",
        description: "Please enter a pizza name",
        variant: "destructive",
      });
      return;
    }

    if (!newPizza.packagingId) {
      toast({
        title: "Error",
        description: "Please select packaging type",
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
      type: 'Pizza',
      size: newPizza.size,
      crustType: newPizza.crustType,
      packagingId: newPizza.packagingId,
      price: newPizza.price,
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
      packagingId: '',
      price: 0
    });
  };

  // Group pizzas by name
  const pizzaMenuItems = menuItems.filter(item => item.type === 'Pizza') as PizzaMenuItem[];
  const pizzaGroups: Record<string, PizzaMenuItem[]> = {};
  pizzaMenuItems.forEach(pizza => {
    if (!pizzaGroups[pizza.name]) {
      pizzaGroups[pizza.name] = [];
    }
    pizzaGroups[pizza.name].push(pizza);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Add New Pizza</h3>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
              <Select 
                value={newPizza.packagingId}
                onValueChange={(value) => setNewPizza({ ...newPizza, packagingId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select packaging" />
                </SelectTrigger>
                <SelectContent>
                  {pizzaPackaging.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - ₹{pkg.cost}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <Input
                type="number"
                value={newPizza.price}
                onChange={(e) => setNewPizza({ ...newPizza, price: Number(e.target.value) })}
                placeholder="Enter price"
              />
            </div>
            
            <Button onClick={handleAddPizza} className="w-full">Add Pizza to Menu</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Existing Pizzas</h3>
          {Object.keys(pizzaGroups).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(pizzaGroups).map(([pizzaName, variants]) => (
                <div key={pizzaName} className="border p-4 rounded-md">
                  <h4 className="font-medium text-lg">{pizzaName}</h4>
                  <div className="mt-2 space-y-1">
                    {variants.map(pizza => (
                      <div key={pizza.id} className="text-sm text-gray-600 flex justify-between">
                        <span>{pizza.size} - {pizza.crustType}</span>
                        <span className="font-medium">₹{pizza.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No pizza items added yet.</p>
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

const FriesTab: React.FC = () => {
  const { menuItems, addMenuItem, inventory, packaging } = useAppContext();
  const { toast } = useToast();
  
  const [newFries, setNewFries] = useState({
    name: 'French Fries',
    variant: '',
    packagingId: '',
    price: 0
  });

  // Filter fries related packaging
  const friesPackaging = packaging.filter(pkg => 
    pkg.name.toLowerCase().includes('fries')
  );

  const handleAddFries = () => {
    if (!newFries.variant) {
      toast({
        title: "Error",
        description: "Please enter a fries variant",
        variant: "destructive",
      });
      return;
    }

    if (!newFries.packagingId) {
      toast({
        title: "Error",
        description: "Please select packaging type",
        variant: "destructive",
      });
      return;
    }

    // Ingredients for fries (potatoes)
    const ingredients = inventory
      .filter(item => item.name.toLowerCase().includes('potato'))
      .map(item => ({
        itemId: item.id,
        amount: 200 // 200g of potatoes per serving
      }));

    addMenuItem({
      name: newFries.name,
      type: 'Fries',
      variant: newFries.variant,
      packagingId: newFries.packagingId,
      price: newFries.price,
      ingredients: ingredients.length ? ingredients : [{
        itemId: 'placeholder',
        amount: 200
      }]
    });

    toast({
      title: "Success",
      description: `${newFries.variant} Fries added to menu`,
    });

    setNewFries({
      ...newFries,
      variant: '',
      packagingId: '',
      price: 0
    });
  };

  // Get all fries items
  const friesItems = menuItems.filter(item => item.type === 'Fries') as FriesMenuItem[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Add New Fries</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
              <Input
                value={newFries.variant}
                onChange={(e) => setNewFries({ ...newFries, variant: e.target.value })}
                placeholder="e.g., Classic, Masala, Cheese"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Packaging</label>
              <Select 
                value={newFries.packagingId}
                onValueChange={(value) => setNewFries({ ...newFries, packagingId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select packaging" />
                </SelectTrigger>
                <SelectContent>
                  {friesPackaging.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - ₹{pkg.cost}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <Input
                type="number"
                value={newFries.price}
                onChange={(e) => setNewFries({ ...newFries, price: Number(e.target.value) })}
                placeholder="Enter price"
              />
            </div>
            
            <Button onClick={handleAddFries} className="w-full">Add Fries to Menu</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Existing Fries</h3>
          {friesItems.length > 0 ? (
            <div className="space-y-2">
              {friesItems.map((item) => (
                <div key={item.id} className="border p-4 rounded-md flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{item.variant} Fries</h4>
                  </div>
                  <span className="font-medium">₹{item.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No fries items added yet.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
        <h3 className="text-lg font-medium mb-4">Recipe & Ingredients</h3>
        <p className="text-gray-600">Add ingredients for fries</p>
        
        <div className="mt-6">
          <p className="text-gray-500">Basic fries recipe:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Potatoes - 200g per serving</li>
            <li>Oil for frying</li>
            <li>Salt to taste</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DrinksTab: React.FC = () => {
  const { menuItems, addMenuItem, packaging } = useAppContext();
  const { toast } = useToast();
  
  const [newDrink, setNewDrink] = useState({
    name: '',
    variant: '',
    size: 'Medium',
    price: 0
  });

  const drinkSizes = ['Small', 'Medium', 'Large'];

  // Filter drink related packaging
  const drinkPackaging = packaging.filter(pkg => 
    ['Glass', 'Lid', 'Straw'].some(item => pkg.name.includes(item))
  );

  const handleAddDrink = () => {
    if (!newDrink.name) {
      toast({
        title: "Error",
        description: "Please enter a drink name",
        variant: "destructive",
      });
      return;
    }

    if (!newDrink.variant) {
      toast({
        title: "Error",
        description: "Please enter a drink variant",
        variant: "destructive",
      });
      return;
    }

    // Get IDs for glass, lid, and straw
    const glassId = packaging.find(pkg => pkg.name.includes('Glass'))?.id || '';
    const lidId = packaging.find(pkg => pkg.name.includes('Lid'))?.id || '';
    const strawId = packaging.find(pkg => pkg.name.includes('Straw'))?.id || '';

    addMenuItem({
      name: newDrink.name,
      type: 'Drink',
      variant: newDrink.variant,
      size: newDrink.size,
      price: newDrink.price,
      packagingIds: [glassId, lidId, strawId].filter(Boolean),
      ingredients: [] // Drinks typically don't have ingredients from inventory
    });

    toast({
      title: "Success",
      description: `${newDrink.variant} ${newDrink.name} added to menu`,
    });

    setNewDrink({
      name: '',
      variant: '',
      size: 'Medium',
      price: 0
    });
  };

  // Get all drink items
  const drinkItems = menuItems.filter(item => item.type === 'Drink') as DrinkMenuItem[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Add New Drink</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drink Name</label>
              <Input
                value={newDrink.name}
                onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                placeholder="e.g., Cola, Lemonade, Coffee"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
              <Input
                value={newDrink.variant}
                onChange={(e) => setNewDrink({ ...newDrink, variant: e.target.value })}
                placeholder="e.g., Diet, Zero Sugar, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <RadioGroup 
                value={newDrink.size} 
                onValueChange={(value) => setNewDrink({ ...newDrink, size: value })}
                className="flex flex-wrap gap-4"
              >
                {drinkSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`drink-size-${size}`} />
                    <Label htmlFor={`drink-size-${size}`}>{size}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <Input
                type="number"
                value={newDrink.price}
                onChange={(e) => setNewDrink({ ...newDrink, price: Number(e.target.value) })}
                placeholder="Enter price"
              />
            </div>
            
            <Button onClick={handleAddDrink} className="w-full">Add Drink to Menu</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Existing Drinks</h3>
          {drinkItems.length > 0 ? (
            <div className="space-y-2">
              {drinkItems.map((item) => (
                <div key={item.id} className="border p-4 rounded-md">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="font-medium">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.variant} - {item.size}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No drinks added yet.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Packaging</h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">Drink packaging items:</p>
          
          <div className="space-y-2 mt-4">
            {drinkPackaging.map(pkg => (
              <div key={pkg.id} className="flex justify-between items-center border-b pb-2">
                <span>{pkg.name}</span>
                <span className="text-gray-600">₹{pkg.cost}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500">All drinks include:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Glass</li>
              <li>Lid</li>
              <li>Straw</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemsSection;

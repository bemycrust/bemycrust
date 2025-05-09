
import React, { useState } from 'react';
import { useAppContext, InventoryItem } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import PasswordModal from './PasswordModal';

const InventorySection: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, updateStartingWeight, currentDate, checkPassword } = useAppContext();
  const { toast } = useToast();
  
  const [newItem, setNewItem] = useState({
    name: '',
    startingWeight: 0,
    endingWeight: 0,
    unit: 'g',
    updateFrequency: 'daily'
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newStartingWeight, setNewStartingWeight] = useState(0);

  const handleAddItem = () => {
    if (!newItem.name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    addInventoryItem({
      name: newItem.name,
      startingWeight: newItem.startingWeight,
      endingWeight: newItem.endingWeight,
      unit: newItem.unit,
      updateFrequency: newItem.updateFrequency as 'daily' | 'weekly'
    });

    toast({
      title: "Success",
      description: "Inventory item added",
    });

    setNewItem({
      name: '',
      startingWeight: 0,
      endingWeight: 0,
      unit: 'g',
      updateFrequency: 'daily'
    });
  };

  const handleEndingWeightChange = (id: string, value: number) => {
    updateInventoryItem(id, { endingWeight: value });
  };

  const handleStartingWeightChange = (id: string, value: number) => {
    setSelectedItemId(id);
    setNewStartingWeight(value);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    updateStartingWeight(selectedItemId, newStartingWeight);
    setShowPasswordModal(false);
    toast({
      title: "Success",
      description: "Starting weight updated",
    });
  };

  const getItemsToUpdateToday = () => {
    return inventory.filter(item => {
      if (item.updateFrequency === 'daily') return true;
      
      // For weekly items, check if it's been a week since last update
      if (item.updateFrequency === 'weekly') {
        const lastUpdate = new Date(item.lastUpdated);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
      }
      
      return false;
    });
  };

  const itemsToUpdate = getItemsToUpdateToday();
  const hasUpdatedToday = inventory.some(item => item.lastUpdated === currentDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Inventory</h2>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </div>
      <p className="text-gray-600">Record starting and ending weights for inventory items (in grams)</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">New Inventory Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Weight</label>
            <Input
              type="number"
              value={newItem.startingWeight || ''}
              onChange={(e) => setNewItem({ ...newItem, startingWeight: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <Select 
              value={newItem.unit} 
              onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">grams</SelectItem>
                <SelectItem value="kg">kilograms</SelectItem>
                <SelectItem value="lb">pounds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Frequency</label>
            <Select 
              value={newItem.updateFrequency} 
              onValueChange={(value) => setNewItem({ ...newItem, updateFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button onClick={handleAddItem} className="w-full md:w-auto">Add Item</Button>
          </div>
        </div>
      </div>

      {itemsToUpdate.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Update Inventory</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Starting Weight</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ending Weight</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Unit</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Last Updated</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {itemsToUpdate.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2 items-center">
                        <Input
                          type="number"
                          value={item.startingWeight || ''}
                          onChange={(e) => handleStartingWeightChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-xs text-gray-500">(Protected)</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={item.endingWeight || ''}
                        onChange={(e) => handleEndingWeightChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-2">{item.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.lastUpdated}</td>
                    <td className="px-4 py-2 text-sm">{item.updateFrequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          {hasUpdatedToday ? (
            <p>All inventory items have been updated for today.</p>
          ) : (
            <p>No inventory items to update. Add items using the form above.</p>
          )}
        </div>
      )}

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onSuccess={handlePasswordSuccess}
        checkPassword={checkPassword}
        title="Password Required to Update Starting Weight"
      />
    </div>
  );
};

export default InventorySection;

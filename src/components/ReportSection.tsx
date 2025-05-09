
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ReportSection: React.FC = () => {
  const { inventory, sales, reports, generateReport, currentDate } = useAppContext();
  const { toast } = useToast();
  
  const todayReport = reports.find(report => report.date === currentDate);
  const todaySales = sales.filter(sale => sale.date === currentDate);
  const allEndingWeightsEntered = inventory.every(item => item.endingWeight > 0);

  const handleGenerateReport = () => {
    if (!allEndingWeightsEntered) {
      toast({
        title: "Error",
        description: "Please enter all ending inventory weights first",
        variant: "destructive",
      });
      return;
    }

    generateReport();
    toast({
      title: "Success",
      description: "Daily report generated",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Report</h2>
        <span className="text-sm text-gray-500">{currentDate}</span>
      </div>
      <p className="text-gray-600">View inventory usage and compare with expected usage based on sales</p>

      {!todayReport ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p className="text-gray-600 mb-4">
            {!allEndingWeightsEntered 
              ? "Make sure you have entered all ending inventory weights." 
              : "No report generated for today yet. Generate a report to view inventory usage."}
          </p>
          <Button onClick={handleGenerateReport} className="mx-auto">
            Generate Report
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Inventory Usage</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Starting</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ending</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Used</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Expected</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {todayReport.inventoryUsage.map((item, index) => {
                    const inventoryItem = inventory.find(i => i.id === item.itemId);
                    const starting = inventoryItem?.startingWeight || 0;
                    const ending = inventoryItem?.endingWeight || 0;
                    
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2">{starting}</td>
                        <td className="px-4 py-2">{ending}</td>
                        <td className="px-4 py-2">{item.used}</td>
                        <td className="px-4 py-2">{item.expected.toFixed(1)}</td>
                        <td className={`px-4 py-2 ${item.difference > 0 ? 'text-red-500' : item.difference < 0 ? 'text-green-500' : ''}`}>
                          {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Sales Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Pizza</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Size</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Crust</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySales.map((sale) => (
                    <tr key={sale.id} className="border-t">
                      <td className="px-4 py-2">{sale.pizzaName}</td>
                      <td className="px-4 py-2">{sale.pizzaSize}</td>
                      <td className="px-4 py-2">{sale.crustType}</td>
                      <td className="px-4 py-2">{sale.quantity}</td>
                      <td className="px-4 py-2">{sale.staffName}</td>
                    </tr>
                  ))}
                  {todaySales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-center text-gray-500">No sales recorded today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportSection;


import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

const ReportSection: React.FC = () => {
  const { 
    inventory, 
    sales, 
    reports, 
    generateReport, 
    currentDate, 
    reportTimeframe, 
    setReportTimeframe, 
    generateTimeframeReport 
  } = useAppContext();
  const { toast } = useToast();
  
  const [reportType, setReportType] = React.useState('daily');
  const [activeTab, setActiveTab] = React.useState('sales');
  
  // Generate one-week timeframe
  const getOneWeekTimeframe = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days
    
    return {
      type: 'weekly' as const,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  // Generate one-month timeframe
  const getOneMonthTimeframe = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    
    return {
      type: 'monthly' as const,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  // Find the appropriate report based on selected timeframe
  const getReportForTimeframe = () => {
    if (reportType === 'daily') {
      return reports.find(report => report.date === currentDate);
    } else if (reportType === 'weekly') {
      const weekTimeframe = getOneWeekTimeframe();
      return generateTimeframeReport(weekTimeframe);
    } else if (reportType === 'monthly') {
      const monthTimeframe = getOneMonthTimeframe();
      return generateTimeframeReport(monthTimeframe);
    }
    return null;
  };
  
  const selectedReport = getReportForTimeframe();
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
  
  // Get total sales amount for the current report
  const getTotalSales = () => {
    if (!selectedReport) return 0;
    
    const itemSales = selectedReport.sales.reduce((total, sale) => total + sale.price, 0);
    const miscSales = selectedReport.miscSales.reduce((total, sale) => total + sale.amount, 0);
    
    return itemSales + miscSales;
  };
  
  // Get total packaging cost for the current report
  const getTotalPackagingCost = () => {
    if (!selectedReport) return 0;
    
    return selectedReport.packagingUsed.reduce((total, pkg) => total + (pkg.cost * pkg.count), 0);
  };
  
  // Prepare data for sales chart
  const getSalesChartData = () => {
    if (!selectedReport) return [];
    
    const itemCounts: Record<string, number> = {};
    selectedReport.sales.forEach(sale => {
      if (!itemCounts[sale.itemType]) {
        itemCounts[sale.itemType] = 0;
      }
      itemCounts[sale.itemType] += sale.quantity;
    });
    
    return Object.entries(itemCounts).map(([type, count]) => ({
      name: type,
      count
    }));
  };
  
  // Prepare data for packaging chart
  const getPackagingChartData = () => {
    if (!selectedReport) return [];
    
    return selectedReport.packagingUsed
      .filter(pkg => pkg.count > 0)
      .map(pkg => ({
        name: pkg.name,
        count: pkg.count,
        cost: pkg.cost * pkg.count
      }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report</h2>
        <div className="flex items-center space-x-2">
          <Select 
            value={reportType} 
            onValueChange={setReportType}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">
            {reportType === 'daily' ? currentDate : 
             reportType === 'weekly' ? `Last 7 Days` : 
             `This Month`}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600">
        {reportType === 'daily' 
          ? "View today's inventory usage and sales" 
          : reportType === 'weekly'
          ? "View data for the last 7 days" 
          : "View data for the current month"}
      </p>

      {!selectedReport && reportType === 'daily' ? (
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <p className="text-2xl font-bold">₹{getTotalSales()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Items Sold</h3>
              <p className="text-2xl font-bold">
                {selectedReport ? selectedReport.sales.reduce((total, sale) => total + sale.quantity, 0) : 0}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Packaging Cost</h3>
              <p className="text-2xl font-bold">₹{getTotalPackagingCost()}</p>
            </div>
          </div>
          
          <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventory Usage</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="packaging">Packaging</TabsTrigger>
            </TabsList>
            
            {/* Inventory Tab */}
            <TabsContent value="inventory" className="mt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Inventory Usage</h3>
                {selectedReport && selectedReport.inventoryUsage.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Used</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Expected</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.inventoryUsage.map((item, index) => {
                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{item.itemName}</td>
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
                ) : (
                  <p className="text-center text-gray-500">No inventory usage data available</p>
                )}
              </div>
            </TabsContent>
            
            {/* Sales Tab */}
            <TabsContent value="sales" className="mt-4 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Sales Summary</h3>
                
                {selectedReport && getSalesChartData().length > 0 && (
                  <div className="h-64 mb-6">
                    <ChartContainer config={{
                      Pizza: { color: '#4f46e5' },
                      Fries: { color: '#f59e0b' },
                      Drink: { color: '#10b981' },
                    }}>
                      <BarChart data={getSalesChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Items Sold" fill="var(--color-Pizza)" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
                
                {selectedReport && selectedReport.sales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.sales.map((sale) => (
                          <tr key={sale.id} className="border-t">
                            <td className="px-4 py-2">{sale.itemName}</td>
                            <td className="px-4 py-2">{sale.itemType}</td>
                            <td className="px-4 py-2">{sale.quantity}</td>
                            <td className="px-4 py-2">₹{sale.price}</td>
                            <td className="px-4 py-2">{sale.staffName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No sales recorded</p>
                )}
              </div>
              
              {/* Miscellaneous Sales */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Miscellaneous Sales</h3>
                {selectedReport && selectedReport.miscSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.miscSales.map((sale) => (
                          <tr key={sale.id} className="border-t">
                            <td className="px-4 py-2">{sale.name}</td>
                            <td className="px-4 py-2">₹{sale.amount}</td>
                            <td className="px-4 py-2">{sale.staffName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No miscellaneous sales recorded</p>
                )}
              </div>
            </TabsContent>
            
            {/* Packaging Tab */}
            <TabsContent value="packaging" className="mt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-4">Packaging Usage</h3>
                
                {selectedReport && getPackagingChartData().length > 0 && (
                  <div className="h-64 mb-6">
                    <ChartContainer config={{
                      count: { color: '#4f46e5' },
                      cost: { color: '#ef4444' }
                    }}>
                      <BarChart data={getPackagingChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Quantity" fill="var(--color-count)" />
                        <Bar yAxisId="right" dataKey="cost" name="Cost (₹)" fill="var(--color-cost)" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
                
                {selectedReport && selectedReport.packagingUsed.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Packaging</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity Used</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Cost per Unit</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.packagingUsed.map((pkg, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{pkg.name}</td>
                            <td className="px-4 py-2">{pkg.count}</td>
                            <td className="px-4 py-2">₹{pkg.cost}</td>
                            <td className="px-4 py-2">₹{pkg.cost * pkg.count}</td>
                          </tr>
                        ))}
                        <tr className="border-t font-medium">
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2">{selectedReport.packagingUsed.reduce((total, pkg) => total + pkg.count, 0)}</td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">₹{selectedReport.packagingUsed.reduce((total, pkg) => total + (pkg.cost * pkg.count), 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No packaging usage data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ReportSection;

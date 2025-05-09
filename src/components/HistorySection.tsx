
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const HistorySection: React.FC = () => {
  const { reports, currentDate } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Get the current month and year
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);
  
  // Get the first day of the month and the number of days in the month
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Get the previous month's days to display
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  
  // Get dates with reports
  const datesWithReports = new Set(reports.map(report => report.date));

  // Get the selected report
  const selectedReport = selectedDate ? reports.find(report => report.date === selectedDate) : null;
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`,
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        hasReport: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        hasReport: datesWithReports.has(date),
        isToday: date === currentDate,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // Always show 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: `${viewYear}-${String(viewMonth + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        day: i,
        isCurrentMonth: false,
        hasReport: false,
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };
  
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">History Calendar</h2>
        <p className="text-gray-600">Select a date to view the daily report</p>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
            <h3 className="text-lg font-medium">{months[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            <div className="text-sm font-medium text-gray-500 p-2">Su</div>
            <div className="text-sm font-medium text-gray-500 p-2">Mo</div>
            <div className="text-sm font-medium text-gray-500 p-2">Tu</div>
            <div className="text-sm font-medium text-gray-500 p-2">We</div>
            <div className="text-sm font-medium text-gray-500 p-2">Th</div>
            <div className="text-sm font-medium text-gray-500 p-2">Fr</div>
            <div className="text-sm font-medium text-gray-500 p-2">Sa</div>
            
            {calendarDays.map((day, i) => (
              <div 
                key={i}
                onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
                className={cn(
                  "p-2 text-center cursor-pointer rounded transition-colors",
                  !day.isCurrentMonth && "text-gray-400",
                  day.isCurrentMonth && day.hasReport && "calendar-day-with-data",
                  day.isToday && "font-bold border border-gray-300",
                  selectedDate === day.date && "calendar-day-selected",
                  day.isCurrentMonth && "hover:bg-gray-100"
                )}
              >
                {day.day}
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Days with reports are highlighted in green
          </div>
        </div>
      </div>
      
      <div>
        {selectedDate ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            
            {selectedReport ? (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Inventory Usage</h3>
                    <div className="text-sm text-gray-500">
                      Staff: {selectedReport.staffName}
                    </div>
                  </div>
                  
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
                        {selectedReport.inventoryUsage.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.itemName}</td>
                            <td className="px-4 py-2">{item.used}</td>
                            <td className="px-4 py-2">{item.expected.toFixed(1)}</td>
                            <td className={`px-4 py-2 ${item.difference > 0 ? 'text-red-500' : item.difference < 0 ? 'text-green-500' : ''}`}>
                              {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}
                            </td>
                          </tr>
                        ))}
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
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Size</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.sales.map((sale) => (
                          <tr key={sale.id} className="border-t">
                            <td className="px-4 py-2">{sale.itemName}</td>
                            <td className="px-4 py-2">{sale.details?.size || '-'}</td>
                            <td className="px-4 py-2">{sale.details?.crustType || sale.details?.variant || '-'}</td>
                            <td className="px-4 py-2">{sale.quantity}</td>
                          </tr>
                        ))}
                        {selectedReport.sales.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No sales recorded on this date</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No report available for this date.</p>
                {selectedDate === currentDate && (
                  <Button className="mt-4" variant="outline">
                    Generate Today's Report
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-xl font-medium">Select a date</p>
              <p className="text-gray-500 mt-1">Pick a date from the calendar to view the report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;


import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PasswordModal from './PasswordModal';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const { selectedTab, setSelectedTab, isPasswordRequired, checkPassword } = useAppContext();
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    targetTab: ''
  });

  const tabs = ['Inventory', 'Menu Items', 'Sales', 'Report', 'History'];

  const handleTabClick = (tab: string) => {
    if (isPasswordRequired(tab)) {
      setPasswordModal({
        isOpen: true,
        targetTab: tab
      });
    } else {
      setSelectedTab(tab);
    }
  };

  const handlePasswordSuccess = () => {
    setSelectedTab(passwordModal.targetTab);
    setPasswordModal({ isOpen: false, targetTab: '' });
  };

  return (
    <>
      <nav className={cn("flex justify-center border-b", className)}>
        <div className="flex max-w-screen-lg w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "px-6 py-3 font-medium transition-colors hover:bg-gray-50",
                selectedTab === tab ? "tab-active" : "text-gray-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      
      <PasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, targetTab: '' })}
        onSuccess={handlePasswordSuccess}
        checkPassword={checkPassword}
      />
    </>
  );
};

export default Navigation;

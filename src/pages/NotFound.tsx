
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container max-w-screen-lg mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-brand-blue">BE MY CRUST</h1>
          <p className="text-gray-600 text-center mt-1">Daily Inventory Management</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-4xl font-bold mb-4">404</h2>
          <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>

      <footer className="bg-white py-4 border-t">
        <div className="container max-w-screen-lg mx-auto px-4">
          <p className="text-center text-sm text-gray-500">BE MY CRUST © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;

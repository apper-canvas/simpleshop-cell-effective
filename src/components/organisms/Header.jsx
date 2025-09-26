import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AuthContext } from "../../../App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleLogout}
      className="flex items-center space-x-2"
    >
      <ApperIcon name="LogOut" className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Customers", href: "/customers", icon: "Users" },
    { name: "Products", href: "/products", icon: "Package" },
    { name: "Sales", href: "/sales", icon: "ShoppingCart" }
  ];

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 glass-effect sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                <ApperIcon name="Store" className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold gradient-text">SimpleShop CRM</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "primary" : "ghost"}
                onClick={() => handleNavigation(item.href)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name={item.icon} className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <LogoutButton />
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                <ApperIcon 
                  name={mobileMenuOpen ? "X" : "Menu"} 
                  className="h-6 w-6" 
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 bg-white"
        >
          <div className="px-4 py-3 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "primary" : "ghost"}
                onClick={() => handleNavigation(item.href)}
                className="w-full justify-start space-x-3"
              >
                <ApperIcon name={item.icon} className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            ))}
            
            <div className="pt-2 border-t border-gray-100">
              <LogoutButton />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
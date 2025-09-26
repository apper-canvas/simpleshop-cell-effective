import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, isToday, isThisMonth } from "date-fns";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Table from "@/components/molecules/Table";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { salesService } from "@/services/api/salesService";
import { customerService } from "@/services/api/customerService";
import { productService } from "@/services/api/productService";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    monthSales: 0,
    customerCount: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [allSales, allCustomers, allProducts] = await Promise.all([
        salesService.getAll(),
        customerService.getAll(),
        productService.getAll()
      ]);

      // Calculate metrics
      const todaySales = allSales
        .filter(sale => isToday(new Date(sale.date)))
        .reduce((total, sale) => total + sale.total, 0);

      const monthSales = allSales
        .filter(sale => isThisMonth(new Date(sale.date)))
        .reduce((total, sale) => total + sale.total, 0);

      const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);

      setMetrics({
        todaySales,
        monthSales,
        customerCount: allCustomers.length,
        lowStockCount: lowStockProducts.length
      });

      // Recent sales (last 10)
      const sortedSales = allSales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      
      setRecentSales(sortedSales);
      setLowStockProducts(lowStockProducts);
      setCustomers(allCustomers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { label: "Out of Stock", variant: "error" };
    } else if (product.stock <= product.lowStockThreshold) {
      return { label: "Low Stock", variant: "warning" };
    }
    return { label: "In Stock", variant: "success" };
  };

  if (loading) {
    return <Loading type="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SimpleShop CRM</h1>
        <p className="text-lg text-secondary-600">Manage your business with ease</p>
      </div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, staggerChildren: 0.1 }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <MetricCard
            title="Today's Sales"
            value={`$${metrics.todaySales.toFixed(2)}`}
            icon="DollarSign"
            color="primary"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <MetricCard
            title="This Month"
            value={`$${metrics.monthSales.toFixed(2)}`}
            icon="TrendingUp"
            color="success"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <MetricCard
            title="Total Customers"
            value={metrics.customerCount}
            icon="Users"
            color="primary"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <MetricCard
            title="Low Stock Alerts"
            value={metrics.lowStockCount}
            icon="AlertTriangle"
            color={metrics.lowStockCount > 0 ? "warning" : "success"}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="ShoppingCart" className="h-5 w-5 mr-2 text-primary-600" />
                Recent Sales
              </h2>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="ShoppingCart" className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-600">No recent sales</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSales.map(sale => (
                  <div key={sale.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900">
                        {getCustomerName(sale.customerId)}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {format(new Date(sale.date), "MMM dd, h:mm a")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success-600">
                        ${sale.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {sale.items?.length || 0} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="AlertTriangle" className="h-5 w-5 mr-2 text-warning-600" />
                Stock Alerts
              </h2>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle" className="h-12 w-12 text-success-500 mx-auto mb-4" />
                <p className="text-success-600 font-medium">All products well stocked!</p>
                <p className="text-sm text-secondary-600 mt-1">No low stock alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => {
                  const status = getStockStatus(product);
                  return (
                    <div key={product.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-secondary-600">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {product.stock} left
                          </div>
                          <div className="text-sm text-secondary-600">
                            Threshold: {product.lowStockThreshold}
                          </div>
                        </div>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
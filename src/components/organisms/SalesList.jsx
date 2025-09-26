import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Table from "@/components/molecules/Table";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { salesService } from "@/services/api/salesService";
import { customerService } from "@/services/api/customerService";
import { productService } from "@/services/api/productService";

const SalesList = ({ onAddSale, onViewSale }) => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [salesData, customersData, productsData] = await Promise.all([
        salesService.getAll(),
        customerService.getAll(),
        productService.getAll()
      ]);
      
      setSales(salesData);
      setCustomers(customersData);
      setProducts(productsData);
      setFilteredSales(salesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = sales.filter(sale => {
      const customer = customers.find(c => c.Id === sale.customerId);
      const customerName = customer?.name?.toLowerCase() || "";
      return customerName.includes(searchTerm.toLowerCase()) ||
             sale.total.toString().includes(searchTerm);
    });
    setFilteredSales(filtered);
  }, [searchTerm, sales, customers]);

  const handleDeleteSale = async (id) => {
    if (!confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
      return;
    }

    try {
      await salesService.delete(id);
      setSales(sales.filter(s => s.Id !== id));
      toast.success("Sale has been deleted successfully");
    } catch (err) {
      toast.error(`Failed to delete sale: ${err.message}`);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getSaleItemsSummary = (items) => {
    if (!items || items.length === 0) return "No items";
    if (items.length === 1) {
      const product = products.find(p => p.Id === items[0].productId);
      return `${items[0].quantity}x ${product?.name || "Unknown Product"}`;
    }
    return `${items.length} items`;
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (sales.length === 0) {
    return (
      <Empty
        title="No sales recorded yet"
        description="Start tracking your revenue by recording your first sale."
        icon="ShoppingCart"
        actionLabel="Record First Sale"
        onAction={onAddSale}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
          <p className="text-secondary-600">Track your transactions and revenue</p>
        </div>
        <Button onClick={onAddSale}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by customer or amount..."
            />
          </div>
          <div className="text-sm text-secondary-600">
            {filteredSales.length} of {sales.length} sales
          </div>
        </div>
      </Card>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card className="p-8 text-center">
          <ApperIcon name="Search" className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching sales</h3>
          <p className="text-secondary-600">Try adjusting your search terms</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Customer</Table.Head>
                <Table.Head>Items</Table.Head>
                <Table.Head>Total</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredSales
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((sale, index) => (
                  <motion.tr
                    key={sale.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <Table.Cell>
                      <div className="font-medium text-gray-900">
                        {getCustomerName(sale.customerId)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-secondary-600">
                        {getSaleItemsSummary(sale.items)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-lg font-semibold text-success-600">
                        ${sale.total.toFixed(2)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {format(new Date(sale.date), "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {format(new Date(sale.date), "h:mm a")}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewSale(sale)}
                          className="p-1"
                        >
                          <ApperIcon name="Eye" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.Id)}
                          className="p-1 text-error-600 hover:text-error-700"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </motion.tr>
                ))}
            </Table.Body>
          </Table>
        </motion.div>
      )}
    </div>
  );
};

export default SalesList;
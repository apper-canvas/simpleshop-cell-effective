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
import { customerService } from "@/services/api/customerService";

const CustomerList = ({ onEditCustomer, onViewCustomer, onAddCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleDeleteCustomer = async (id, customerName) => {
    if (!confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await customerService.delete(id);
      setCustomers(customers.filter(c => c.Id !== id));
      toast.success(`${customerName} has been deleted successfully`);
    } catch (err) {
      toast.error(`Failed to delete customer: ${err.message}`);
    }
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCustomers} />;
  }

  if (customers.length === 0) {
    return (
      <Empty
        title="No customers yet"
        description="Start building your customer base by adding your first customer."
        icon="Users"
        actionLabel="Add First Customer"
        onAction={onAddCustomer}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-secondary-600">Manage your customer relationships</p>
        </div>
        <Button onClick={onAddCustomer}>
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search customers by name, email, or phone..."
            />
          </div>
          <div className="text-sm text-secondary-600">
            {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center">
          <ApperIcon name="Search" className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching customers</h3>
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
                <Table.Head>Contact</Table.Head>
                <Table.Head>Total Purchases</Table.Head>
                <Table.Head>Joined</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <Table.Cell>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      {customer.notes && (
                        <div className="text-sm text-secondary-600">{customer.notes}</div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-secondary-600">{customer.phone}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-lg font-semibold text-primary-600">
                      ${customer.totalPurchases?.toFixed(2) || "0.00"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-secondary-600">
                      {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCustomer(customer)}
                        className="p-1"
                      >
                        <ApperIcon name="Eye" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCustomer(customer)}
                        className="p-1"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.Id, customer.name)}
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

export default CustomerList;
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Table from "@/components/molecules/Table";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { salesService } from "@/services/api/salesService";
import { productService } from "@/services/api/productService";

const CustomerDetails = ({ isOpen, onClose, customer, onEdit }) => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCustomerSales = async () => {
    if (!customer) return;
    
    try {
      setLoading(true);
      setError("");
      
      const [salesData, productsData] = await Promise.all([
        salesService.getSalesByCustomer(customer.Id),
        productService.getAll()
      ]);
      
      setSales(salesData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer) {
      loadCustomerSales();
    }
  }, [isOpen, customer]);

  const getProductName = (productId) => {
    const product = products.find(p => p.Id === productId);
    return product?.name || "Unknown Product";
  };

  const getSaleItemsSummary = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.map(item => 
      `${item.quantity}x ${getProductName(item.productId)}`
    ).join(", ");
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="lg">
      <div className="space-y-6">
        {/* Customer Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <ApperIcon name="User" className="h-8 w-8 text-primary-600" />
              </div>
              <div>
<h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-secondary-600">Customer since {format(new Date(customer.createdAt), "MMMM yyyy")}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => onEdit(customer)}>
              <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Mail" className="h-4 w-4 text-secondary-400" />
<span className="text-sm text-gray-900">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Phone" className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-gray-900">{customer.phone}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Purchase Summary</h4>
<div className="text-2xl font-bold text-primary-600 gradient-text">
                ${customer.totalPurchases?.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-secondary-600">Total spent</p>
            </div>
          </div>

{customer.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-900">{customer.notes}</p>
            </div>
          )}
        </Card>

        {/* Purchase History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h3>
          
          {loading ? (
            <Loading type="table" />
          ) : error ? (
            <Error message={error} onRetry={loadCustomerSales} />
          ) : sales.length === 0 ? (
            <Empty
              title="No purchases yet"
              description="This customer hasn't made any purchases."
              icon="ShoppingCart"
            />
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Items</Table.Head>
                  <Table.Head className="text-right">Total</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sales
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(sale => (
                    <Table.Row key={sale.Id}>
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
                      <Table.Cell>
                        <span className="text-sm text-secondary-600">
                          {getSaleItemsSummary(sale.items)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <span className="font-semibold text-success-600">
                          ${sale.total.toFixed(2)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerDetails;
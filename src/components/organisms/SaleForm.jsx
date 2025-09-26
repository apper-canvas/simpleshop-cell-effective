import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { salesService } from "@/services/api/salesService";
import { customerService } from "@/services/api/customerService";
import { productService } from "@/services/api/productService";

const SaleForm = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setDataLoading(true);
      setError("");
      
      const [customersData, productsData] = await Promise.all([
        customerService.getAll(),
        productService.getAll()
      ]);
      
      setCustomers(customersData);
      setProducts(productsData.filter(p => p.stock > 0)); // Only show products in stock
    } catch (err) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Reset form
      setSelectedCustomerId("");
      setSaleItems([]);
    }
  }, [isOpen]);

  const addSaleItem = (productId) => {
const product = products.find(p => p.Id === parseInt(productId));
    if (!product) return;

    const existingItem = saleItems.find(item => item.productId === product.Id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setSaleItems(items => 
          items.map(item => 
            item.productId === product.Id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        toast.warning(`Only ${product.stock} units available for ${product.name}`);
      }
    } else {
      setSaleItems(items => [...items, {
        productId: product.Id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find(p => p.Id === productId);
    if (quantity > product.stock) {
      toast.warning(`Only ${product.stock} units available`);
      return;
    }
    
    if (quantity <= 0) {
      setSaleItems(items => items.filter(item => item.productId !== productId));
    } else {
      setSaleItems(items => 
        items.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeSaleItem = (productId) => {
    setSaleItems(items => items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (saleItems.length === 0) {
      toast.error("Please add at least one item to the sale");
      return;
    }

    try {
      setLoading(true);
      
      const saleData = {
        customerId: parseInt(selectedCustomerId),
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal()
      };
      
      await salesService.create(saleData);
      toast.success("Sale recorded successfully");
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(`Failed to record sale: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="New Sale" size="lg">
        <Loading />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="New Sale" size="lg">
        <Error message={error} onRetry={loadData} />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Sale" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer <span className="text-error-500">*</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            required
          >
            <option value="">Select a customer</option>
{customers.map(customer => (
              <option key={customer.Id} value={customer.Id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Products
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addSaleItem(e.target.value);
                e.target.value = "";
              }
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          >
            <option value="">Select a product to add</option>
{products.map(product => (
              <option key={product.Id} value={product.Id}>
                {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Sale Items */}
        {saleItems.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Sale Items</h3>
            <div className="space-y-3">
              {saleItems.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-secondary-600">
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 h-8 w-8"
                      >
                        <ApperIcon name="Minus" className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[3ch] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 h-8 w-8"
                        disabled={item.quantity >= item.maxStock}
                      >
                        <ApperIcon name="Plus" className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="font-semibold text-primary-600 min-w-[5ch] text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSaleItem(item.productId)}
                      className="p-1 text-error-600 hover:text-error-700"
                    >
                      <ApperIcon name="X" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-primary-600 gradient-text">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || saleItems.length === 0 || !selectedCustomerId}
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Recording Sale...
              </>
            ) : (
              <>
                <ApperIcon name="ShoppingCart" className="h-4 w-4 mr-2" />
                Record Sale
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleForm;
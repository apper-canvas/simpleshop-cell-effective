import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Table from "@/components/molecules/Table";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { productService } from "@/services/api/productService";

const ProductList = ({ onEditProduct, onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDeleteProduct = async (id, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.Id !== id));
      toast.success(`"${productName}" has been deleted successfully`);
    } catch (err) {
      toast.error(`Failed to delete product: ${err.message}`);
    }
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
    return <Loading type="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProducts} />;
  }

  if (products.length === 0) {
    return (
      <Empty
        title="No products yet"
        description="Start managing your inventory by adding your first product."
        icon="Package"
        actionLabel="Add First Product"
        onAction={onAddProduct}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-secondary-600">Manage your inventory and pricing</p>
        </div>
        <Button onClick={onAddProduct}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search products by name..."
            />
          </div>
          <div className="text-sm text-secondary-600">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </Card>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <ApperIcon name="Search" className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching products</h3>
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
                <Table.Head>Product</Table.Head>
                <Table.Head>Price</Table.Head>
                <Table.Head>Stock</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Added</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product);
                return (
                  <motion.tr
                    key={product.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <Table.Cell>
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-lg font-semibold text-primary-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{product.stock}</span>
                        {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                          <ApperIcon name="AlertTriangle" className="h-4 w-4 text-warning-500" />
                        )}
                        {product.stock === 0 && (
                          <ApperIcon name="XCircle" className="h-4 w-4 text-error-500" />
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-secondary-600">
                        {format(new Date(product.createdAt), "MMM dd, yyyy")}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          className="p-1"
                        >
                          <ApperIcon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.Id, product.name)}
                          className="p-1 text-error-600 hover:text-error-700"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </motion.tr>
                );
              })}
            </Table.Body>
          </Table>
        </motion.div>
      )}
    </div>
  );
};

export default ProductList;
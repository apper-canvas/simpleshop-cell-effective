import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";
import { productService } from "@/services/api/productService";

const ProductForm = ({ isOpen, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    lowStockThreshold: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        lowStockThreshold: product.lowStockThreshold?.toString() || ""
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        lowStockThreshold: "5"
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    if (!formData.lowStockThreshold.trim()) {
      newErrors.lowStockThreshold = "Low stock threshold is required";
    } else if (isNaN(parseInt(formData.lowStockThreshold)) || parseInt(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = "Low stock threshold must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      };
      
      if (isEditing) {
        await productService.update(product.Id, productData);
        toast.success("Product updated successfully");
      } else {
        await productService.create(productData);
        toast.success("Product added successfully");
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? "update" : "add"} product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add New Product"}
      size="default"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter product name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              error={errors.price}
              placeholder="0.00"
            />

            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              error={errors.stock}
              placeholder="0"
            />
          </div>

          <Input
            label="Low Stock Threshold"
            type="number"
            min="0"
            required
            value={formData.lowStockThreshold}
            onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
            error={errors.lowStockThreshold}
            placeholder="5"
            className="sm:w-1/2"
          />
        </div>

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
            disabled={loading}
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <ApperIcon name={isEditing ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                {isEditing ? "Update Product" : "Add Product"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
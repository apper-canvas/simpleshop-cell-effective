import React, { useState } from "react";
import ProductList from "@/components/organisms/ProductList";
import ProductForm from "@/components/organisms/ProductForm";

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <ProductList
        key={refreshKey}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
      />

      <ProductForm
        isOpen={showForm}
        onClose={handleFormClose}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default ProductsPage;
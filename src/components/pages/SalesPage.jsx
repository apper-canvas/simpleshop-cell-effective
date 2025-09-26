import React, { useState } from "react";
import SalesList from "@/components/organisms/SalesList";
import SaleForm from "@/components/organisms/SaleForm";

const SalesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSale = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewSale = (sale) => {
    // Could implement sale details modal here if needed
    console.log("View sale:", sale);
  };

  return (
    <>
      <SalesList
        key={refreshKey}
        onAddSale={handleAddSale}
        onViewSale={handleViewSale}
      />

      <SaleForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default SalesPage;
import React, { useState } from "react";
import CustomerList from "@/components/organisms/CustomerList";
import CustomerForm from "@/components/organisms/CustomerForm";
import CustomerDetails from "@/components/organisms/CustomerDetails";

const CustomersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setViewingCustomer(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditFromDetails = (customer) => {
    setShowDetails(false);
    handleEditCustomer(customer);
  };

  return (
    <>
      <CustomerList
        key={refreshKey}
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onViewCustomer={handleViewCustomer}
      />

      <CustomerForm
        isOpen={showForm}
        onClose={handleFormClose}
        customer={editingCustomer}
        onSuccess={handleFormSuccess}
      />

      <CustomerDetails
        isOpen={showDetails}
        onClose={handleDetailsClose}
        customer={viewingCustomer}
        onEdit={handleEditFromDetails}
      />
    </>
  );
};

export default CustomersPage;
export const customerService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "total_purchases_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('customer_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Transform database fields to match UI expectations
      return (response.data || []).map(customer => ({
        Id: customer.Id,
        name: customer.name_c || '',
        email: customer.email_c || '',
        phone: customer.phone_c || '',
        notes: customer.notes_c || '',
        totalPurchases: customer.total_purchases_c || 0,
        createdAt: customer.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching customers:", error?.response?.data?.message || error.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "total_purchases_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('customer_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Customer not found");
      }

      // Transform database fields to match UI expectations
      const customer = response.data;
      return {
        Id: customer.Id,
        name: customer.name_c || '',
        email: customer.email_c || '',
        phone: customer.phone_c || '',
        notes: customer.notes_c || '',
        totalPurchases: customer.total_purchases_c || 0,
        createdAt: customer.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error?.response?.data?.message || error.message || error);
      throw new Error("Customer not found");
    }
  },

  async create(customerData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database field names (only updateable fields)
      const params = {
        records: [{
          name_c: customerData.name || '',
          email_c: customerData.email || '',
          phone_c: customerData.phone || '',
          notes_c: customerData.notes || '',
          total_purchases_c: 0
        }]
      };

      const response = await apperClient.createRecord('customer_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          // Transform database response back to UI format
          const customer = result.data;
          return {
            Id: customer.Id,
            name: customer.name_c || '',
            email: customer.email_c || '',
            phone: customer.phone_c || '',
            notes: customer.notes_c || '',
            totalPurchases: customer.total_purchases_c || 0,
            createdAt: customer.CreatedOn || new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'Failed to create customer');
        }
      }
      
      throw new Error('No response data received');
    } catch (error) {
      console.error("Error creating customer:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async update(id, customerData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database field names (only updateable fields)
      const params = {
        records: [{
          Id: parseInt(id),
          name_c: customerData.name || '',
          email_c: customerData.email || '',
          phone_c: customerData.phone || '',
          notes_c: customerData.notes || ''
        }]
      };

      const response = await apperClient.updateRecord('customer_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          // Transform database response back to UI format
          const customer = result.data;
          return {
            Id: customer.Id,
            name: customer.name_c || '',
            email: customer.email_c || '',
            phone: customer.phone_c || '',
            notes: customer.notes_c || '',
            totalPurchases: customer.total_purchases_c || 0,
            createdAt: customer.CreatedOn || new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'Failed to update customer');
        }
      }
      
      throw new Error('No response data received');
    } catch (error) {
      console.error("Error updating customer:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('customer_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return true;
        } else {
          throw new Error(result.message || 'Failed to delete customer');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting customer:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async updateTotalPurchases(customerId, amount) {
    try {
      // First get the current customer data
      const customer = await this.getById(customerId);
      const newTotal = (customer.totalPurchases || 0) + amount;
      
      // Update only the total purchases field
      await this.update(customerId, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        totalPurchases: newTotal
      });
    } catch (error) {
      console.error("Error updating customer total purchases:", error?.response?.data?.message || error.message || error);
    }
  }
};
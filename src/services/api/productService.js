export const productService = {
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
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "low_stock_threshold_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.fetchRecords('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Transform database fields to match UI expectations
      return (response.data || []).map(product => ({
        Id: product.Id,
        name: product.name_c || '',
        price: product.price_c || 0,
        stock: product.stock_c || 0,
        lowStockThreshold: product.low_stock_threshold_c || 0,
        createdAt: product.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching products:", error?.response?.data?.message || error.message || error);
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
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "low_stock_threshold_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('product_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Product not found");
      }

      // Transform database fields to match UI expectations
      const product = response.data;
      return {
        Id: product.Id,
        name: product.name_c || '',
        price: product.price_c || 0,
        stock: product.stock_c || 0,
        lowStockThreshold: product.low_stock_threshold_c || 0,
        createdAt: product.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error?.response?.data?.message || error.message || error);
      throw new Error("Product not found");
    }
  },

  async create(productData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database field names (only updateable fields)
      const params = {
        records: [{
          name_c: productData.name || '',
          price_c: productData.price || 0,
          stock_c: productData.stock || 0,
          low_stock_threshold_c: productData.lowStockThreshold || 0
        }]
      };

      const response = await apperClient.createRecord('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          // Transform database response back to UI format
          const product = result.data;
          return {
            Id: product.Id,
            name: product.name_c || '',
            price: product.price_c || 0,
            stock: product.stock_c || 0,
            lowStockThreshold: product.low_stock_threshold_c || 0,
            createdAt: product.CreatedOn || new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'Failed to create product');
        }
      }
      
      throw new Error('No response data received');
    } catch (error) {
      console.error("Error creating product:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async update(id, productData) {
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
          name_c: productData.name || '',
          price_c: productData.price || 0,
          stock_c: productData.stock || 0,
          low_stock_threshold_c: productData.lowStockThreshold || 0
        }]
      };

      const response = await apperClient.updateRecord('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          // Transform database response back to UI format
          const product = result.data;
          return {
            Id: product.Id,
            name: product.name_c || '',
            price: product.price_c || 0,
            stock: product.stock_c || 0,
            lowStockThreshold: product.low_stock_threshold_c || 0,
            createdAt: product.CreatedOn || new Date().toISOString()
          };
        } else {
          throw new Error(result.message || 'Failed to update product');
        }
      }
      
      throw new Error('No response data received');
    } catch (error) {
      console.error("Error updating product:", error?.response?.data?.message || error.message || error);
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

      const response = await apperClient.deleteRecord('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return true;
        } else {
          throw new Error(result.message || 'Failed to delete product');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async updateStock(productId, quantity) {
    try {
      // First get the current product data
      const product = await this.getById(productId);
      const newStock = Math.max(0, product.stock - quantity);
      
      // Update the stock
      const updatedProduct = await this.update(productId, {
        name: product.name,
        price: product.price,
        stock: newStock,
        lowStockThreshold: product.lowStockThreshold
      });
      
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product stock:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async getLowStockProducts() {
    try {
      const products = await this.getAll();
      return products.filter(p => p.stock <= p.lowStockThreshold);
    } catch (error) {
      console.error("Error fetching low stock products:", error?.response?.data?.message || error.message || error);
      return [];
    }
  }
};
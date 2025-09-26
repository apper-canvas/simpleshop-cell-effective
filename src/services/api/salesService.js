import { customerService } from "./customerService.js";
import { productService } from "./productService.js";

export const salesService = {
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
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const [salesResponse, saleItemsResponse] = await Promise.all([
        apperClient.fetchRecords('sale_c', params),
        apperClient.fetchRecords('sale_item_c', {
          fields: [
            {"field": {"Name": "Id"}},
            {"field": {"Name": "sale_id_c"}},
            {"field": {"Name": "product_id_c"}},
            {"field": {"Name": "quantity_c"}},
            {"field": {"Name": "price_c"}}
          ]
        })
      ]);
      
      if (!salesResponse.success) {
        console.error(salesResponse.message);
        return [];
      }

      const saleItems = saleItemsResponse.success ? saleItemsResponse.data || [] : [];

      // Transform database fields to match UI expectations and aggregate sale items
      return (salesResponse.data || []).map(sale => ({
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c,
        date: sale.date_c || sale.CreatedOn,
        total: sale.total_c || 0,
        items: saleItems
          .filter(item => (item.sale_id_c?.Id || item.sale_id_c) === sale.Id)
          .map(item => ({
            productId: item.product_id_c?.Id || item.product_id_c,
            quantity: item.quantity_c || 0,
            price: item.price_c || 0
          }))
      }));
    } catch (error) {
      console.error("Error fetching sales:", error?.response?.data?.message || error.message || error);
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
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const [saleResponse, saleItemsResponse] = await Promise.all([
        apperClient.getRecordById('sale_c', parseInt(id), params),
        apperClient.fetchRecords('sale_item_c', {
          fields: [
            {"field": {"Name": "Id"}},
            {"field": {"Name": "sale_id_c"}},
            {"field": {"Name": "product_id_c"}},
            {"field": {"Name": "quantity_c"}},
            {"field": {"Name": "price_c"}}
          ],
          where: [{"FieldName": "sale_id_c", "Operator": "EqualTo", "Values": [parseInt(id)]}]
        })
      ]);
      
      if (!saleResponse.success) {
        console.error(saleResponse.message);
        throw new Error("Sale not found");
      }

      const saleItems = saleItemsResponse.success ? saleItemsResponse.data || [] : [];
      const sale = saleResponse.data;

      // Transform database fields to match UI expectations
      return {
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c,
        date: sale.date_c || sale.CreatedOn,
        total: sale.total_c || 0,
        items: saleItems.map(item => ({
          productId: item.product_id_c?.Id || item.product_id_c,
          quantity: item.quantity_c || 0,
          price: item.price_c || 0
        }))
      };
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error?.response?.data?.message || error.message || error);
      throw new Error("Sale not found");
    }
  },

  async create(saleData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // First create the sale record
      const saleParams = {
        records: [{
          customer_id_c: parseInt(saleData.customerId),
          date_c: new Date().toISOString(),
          total_c: saleData.total || 0
        }]
      };

      const saleResponse = await apperClient.createRecord('sale_c', saleParams);
      
      if (!saleResponse.success) {
        console.error(saleResponse.message);
        throw new Error(saleResponse.message);
      }

      const saleResult = saleResponse.results?.[0];
      if (!saleResult?.success) {
        throw new Error(saleResult?.message || 'Failed to create sale');
      }

      const newSaleId = saleResult.data.Id;

      // Create sale items
      if (saleData.items && saleData.items.length > 0) {
        const itemParams = {
          records: saleData.items.map(item => ({
            sale_id_c: newSaleId,
            product_id_c: parseInt(item.productId),
            quantity_c: item.quantity || 0,
            price_c: item.price || 0
          }))
        };

        const itemsResponse = await apperClient.createRecord('sale_item_c', itemParams);
        
        if (!itemsResponse.success) {
          console.error('Failed to create sale items:', itemsResponse.message);
        }

        // Update product stock
        for (const item of saleData.items) {
          try {
            await productService.updateStock(item.productId, item.quantity);
          } catch (error) {
            console.error(`Failed to update stock for product ${item.productId}:`, error);
          }
        }
      }

      // Update customer total purchases
      try {
        await customerService.updateTotalPurchases(saleData.customerId, saleData.total);
      } catch (error) {
        console.error('Failed to update customer total purchases:', error);
      }

      // Return the created sale in UI format
      return {
        Id: newSaleId,
        customerId: saleData.customerId,
        date: new Date().toISOString(),
        total: saleData.total,
        items: saleData.items
      };
    } catch (error) {
      console.error("Error creating sale:", error?.response?.data?.message || error.message || error);
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

      // First delete associated sale items
      const saleItemsResponse = await apperClient.fetchRecords('sale_item_c', {
        fields: [{"field": {"Name": "Id"}}],
        where: [{"FieldName": "sale_id_c", "Operator": "EqualTo", "Values": [parseInt(id)]}]
      });

      if (saleItemsResponse.success && saleItemsResponse.data?.length > 0) {
        const itemIds = saleItemsResponse.data.map(item => item.Id);
        await apperClient.deleteRecord('sale_item_c', { RecordIds: itemIds });
      }

      // Then delete the sale
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('sale_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return true;
        } else {
          throw new Error(result.message || 'Failed to delete sale');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting sale:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async getSalesByCustomer(customerId) {
    try {
      const sales = await this.getAll();
      return sales.filter(s => s.customerId === parseInt(customerId));
    } catch (error) {
      console.error("Error fetching sales by customer:", error?.response?.data?.message || error.message || error);
      return [];
    }
  },

  async getSalesToday() {
    try {
      const sales = await this.getAll();
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      return sales.filter(s => s.date?.startsWith(todayStr));
    } catch (error) {
      console.error("Error fetching today's sales:", error?.response?.data?.message || error.message || error);
      return [];
    }
  },

  async getSalesThisMonth() {
    try {
      const sales = await this.getAll();
      const today = new Date();
      const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      return sales.filter(s => s.date?.startsWith(thisMonth));
    } catch (error) {
      console.error("Error fetching this month's sales:", error?.response?.data?.message || error.message || error);
      return [];
    }
  }
};
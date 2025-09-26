import salesData from "../mockData/sales.json";
import { customerService } from "./customerService.js";
import { productService } from "./productService.js";

let sales = [...salesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const salesService = {
  async getAll() {
    await delay(300);
    return [...sales];
  },

  async getById(id) {
    await delay(200);
    const sale = sales.find(s => s.Id === parseInt(id));
    if (!sale) {
      throw new Error("Sale not found");
    }
    return { ...sale };
  },

  async create(saleData) {
    await delay(500);
    const newSale = {
      ...saleData,
      Id: Math.max(...sales.map(s => s.Id), 0) + 1,
      date: new Date().toISOString()
    };
    
    // Update product stock
    for (const item of newSale.items) {
      await productService.updateStock(item.productId, item.quantity);
    }
    
    // Update customer total purchases
    await customerService.updateTotalPurchases(newSale.customerId, newSale.total);
    
    sales.push(newSale);
    return { ...newSale };
  },

  async delete(id) {
    await delay(250);
    const index = sales.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Sale not found");
    }
    sales.splice(index, 1);
    return true;
  },

  async getSalesByCustomer(customerId) {
    await delay(300);
    return sales.filter(s => s.customerId === parseInt(customerId)).map(s => ({ ...s }));
  },

  async getSalesToday() {
    await delay(250);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    return sales.filter(s => s.date.startsWith(todayStr)).map(s => ({ ...s }));
  },

  async getSalesThisMonth() {
    await delay(300);
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    return sales.filter(s => s.date.startsWith(thisMonth)).map(s => ({ ...s }));
  }
};
import productsData from "../mockData/products.json";

let products = [...productsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  async getAll() {
    await delay(300);
    return [...products];
  },

  async getById(id) {
    await delay(200);
    const product = products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  },

  async create(productData) {
    await delay(400);
    const newProduct = {
      ...productData,
      Id: Math.max(...products.map(p => p.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    return { ...newProduct };
  },

  async update(id, productData) {
    await delay(350);
    const index = products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    products[index] = { ...products[index], ...productData };
    return { ...products[index] };
  },

  async delete(id) {
    await delay(250);
    const index = products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    products.splice(index, 1);
    return true;
  },

  async updateStock(productId, quantity) {
    await delay(200);
    const product = products.find(p => p.Id === parseInt(productId));
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
      return { ...product };
    }
    throw new Error("Product not found");
  },

  async getLowStockProducts() {
    await delay(250);
    return products.filter(p => p.stock <= p.lowStockThreshold).map(p => ({ ...p }));
  }
};
import customersData from "../mockData/customers.json";

let customers = [...customersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const customerService = {
  async getAll() {
    await delay(300);
    return [...customers];
  },

  async getById(id) {
    await delay(200);
    const customer = customers.find(c => c.Id === parseInt(id));
    if (!customer) {
      throw new Error("Customer not found");
    }
    return { ...customer };
  },

  async create(customerData) {
    await delay(400);
    const newCustomer = {
      ...customerData,
      Id: Math.max(...customers.map(c => c.Id), 0) + 1,
      createdAt: new Date().toISOString(),
      totalPurchases: 0
    };
    customers.push(newCustomer);
    return { ...newCustomer };
  },

  async update(id, customerData) {
    await delay(350);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    customers[index] = { ...customers[index], ...customerData };
    return { ...customers[index] };
  },

  async delete(id) {
    await delay(250);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    customers.splice(index, 1);
    return true;
  },

  async updateTotalPurchases(customerId, amount) {
    await delay(200);
    const customer = customers.find(c => c.Id === parseInt(customerId));
    if (customer) {
      customer.totalPurchases = (customer.totalPurchases || 0) + amount;
    }
  }
};
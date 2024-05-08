import express from "express";
import { promisify } from "util";
import { createClient } from "redis";

const listProducts = [
  {
    itemId: 1,
    itemName: "Suitcase 250",
    price: 50,
    initialAvailableQuantity: 4,
  },
  {
    itemId: 2,
    itemName: "Suitcase 450",
    price: 100,
    initialAvailableQuantity: 10,
  },
  {
    itemId: 3,
    itemName: "Suitcase 650",
    price: 350,
    initialAvailableQuantity: 2,
  },
  {
    itemId: 4,
    itemName: "Suitcase 1050",
    price: 550,
    initialAvailableQuantity: 5,
  },
];

const app = express();
const client = createClient();
const PORT = 1245;

// Promisify Redis commands
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

const getItemById = (id) => {
  return listProducts.find((obj) => obj.itemId === id);
};

const reserveStockById = async (itemId, stock) => {
  try {
    await setAsync(`item.${itemId}`, stock);
  } catch (error) {
    console.error(`Error reserving stock for item ${itemId}: ${error.message}`);
  }
};

const getCurrentReservedStockById = async (itemId) => {
  const result = await getAsync(`item.${itemId}`);
  return parseInt(result || 0);
};

app.get("/list_products", (_, res) => {
  res.json(listProducts);
});

app.get("/list_products/:itemId(\\d+)", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const productItem = getItemById(itemId);

  if (!productItem) {
    res.status(404).json({ status: "Product not found" });
    return;
  }

  try {
    const reservedStock = await getCurrentReservedStockById(itemId);
    productItem.currentQuantity =
      productItem.initialAvailableQuantity - reservedStock;
    res.json(productItem);
  } catch (error) {
    console.error(
      `Error retrieving stock for item ${itemId}: ${error.message}`
    );
  }
});

app.get("/reserve_product/:itemId(\\d+)", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const productItem = getItemById(itemId);

  if (!productItem) {
    res.status(404).json({ status: "Product not found" });
    return;
  }

  try {
    const reservedStock = await getCurrentReservedStockById(itemId);
    if (reservedStock >= productItem.initialAvailableQuantity) {
      res.json({ status: "Not enough stock available", itemId: itemId });
      return;
    }
    await reserveStockById(itemId, reservedStock + 1);
    res.json({ status: "Reservation confirmed", itemId: itemId });
  } catch (error) {
    console.error(`Error reserving stock for item ${itemId}: ${error.message}`);
  }
});

const resetProductsStock = async () => {
  try {
    await Promise.all(
      listProducts.map((item) => setAsync(`item.${item.itemId}`, 0))
    );
  } catch (error) {
    console.error("Error resetting product stock:", error.message);
  }
};

app.listen(PORT, async () => {
  try {
    await resetProductsStock();
    console.log(`API available on localhost port ${PORT}`);
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
});

export default app;

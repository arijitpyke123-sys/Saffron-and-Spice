import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToMongoDB, Menu, Review, Order, migrateData, getMongoDBError } from "./src/mongodb.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  console.log('Environment Check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- VERCEL:', process.env.VERCEL);
  console.log('- MONGODB_URI present:', !!process.env.MONGODB_URI);

  // Load SQLite DB only if not on Vercel
  let db: any = null;
  if (!process.env.VERCEL) {
    try {
      const { getDb } = await import("./src/db.js");
      db = await getDb();
    } catch (err) {
      console.warn("Could not load SQLite DB:", err);
    }
  }

  // Connect to MongoDB
  console.log('Initializing MongoDB connection...');
  const mongoConnection = await connectToMongoDB();
  if (mongoConnection) {
    console.log('MongoDB connected successfully, checking for migration...');
    await migrateData(db);
  } else {
    console.error('MongoDB connection failed during startup. Check MONGODB_URI and Network Access rules.');
  }

  // API routes
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  app.get("/api/health", async (req, res) => {
    let migrationStatus = "not_started";
    const error = getMongoDBError();
    
    if (mongoConnection) {
      try {
        const menuCount = await Menu.countDocuments();
        const reviewCount = await Review.countDocuments();
        const orderCount = await Order.countDocuments();
        migrationStatus = `completed (Menu: ${menuCount}, Reviews: ${reviewCount}, Orders: ${orderCount})`;
      } catch (e) {
        migrationStatus = "error";
      }
    }
    res.json({ 
      status: "ok", 
      mongodb: !!mongoConnection,
      error: error || (process.env.MONGODB_URI ? null : "MONGODB_URI_MISSING"),
      migration: migrationStatus
    });
  });

  // Menu endpoints
  app.get("/api/menu", async (req, res) => {
    try {
      if (mongoConnection) {
        const menu = await Menu.find();
        return res.json(menu);
      }
      
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      const menu = db.prepare('SELECT * FROM menu').all();
      // Convert isVeg from 0/1 to boolean
      const formattedMenu = menu.map((item: any) => ({
        ...item,
        isVeg: !!item.isVeg
      }));
      res.json(formattedMenu);
    } catch (error: any) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews", async (req, res) => {
    try {
      const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
      
      // If Airtable is configured, use it
      if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_TABLE_NAME) {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedReviews = data.records.map((record: any) => ({
            id: record.id,
            name: record.fields.Name,
            rating: record.fields.Rating,
            comment: record.fields.Comment,
            dish: record.fields.Dish,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(record.fields.Name || 'A')}&background=random`,
            createdAt: record.createdTime
          }));
          return res.json(formattedReviews);
        }
      }

      // If MongoDB is configured, use it
      if (mongoConnection) {
        const reviews = await Review.find().sort({ createdAt: -1 });
        return res.json(reviews);
      }

      // Fallback to SQLite if Airtable and MongoDB are not configured or fail
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }
      const reviews = db.prepare('SELECT * FROM reviews ORDER BY createdAt DESC').all();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { name, rating, comment, dish, avatar } = req.body;
      const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

      // If Airtable is configured, post to it
      if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_TABLE_NAME) {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Name: name,
                  Rating: rating,
                  Comment: comment,
                  Dish: dish,
                },
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const record = data.records[0];
          return res.json({
            id: record.id,
            name: record.fields.Name,
            rating: record.fields.Rating,
            comment: record.fields.Comment,
            dish: record.fields.Dish,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(record.fields.Name || 'A')}&background=random`,
            createdAt: record.createdTime
          });
        }
      }

      // If MongoDB is configured, use it
      if (mongoConnection) {
        const newReview = new Review({
          name,
          rating,
          comment,
          dish,
          avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
        await newReview.save();
        return res.json(newReview);
      }

      // Fallback to SQLite
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }
      const result = db.prepare('INSERT INTO reviews (name, rating, comment, dish, avatar) VALUES (?, ?, ?, ?, ?)').run(
        name, rating, comment, dish, avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      );
      const newReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
      res.json(newReview);
    } catch (error: any) {
      console.error("Error adding review:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const { id, userId, total, type, items } = req.body;
      
      if (mongoConnection) {
        const newOrder = new Order({
          id,
          userId,
          total,
          type,
          items
        });
        await newOrder.save();
        return res.json(newOrder);
      }

      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      db.prepare('INSERT INTO orders (id, userId, total, type, items) VALUES (?, ?, ?, ?, ?)').run(
        id, userId, total, type, JSON.stringify(items)
      );
      const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      res.json({
        ...newOrder,
        items: JSON.parse(newOrder.items)
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (mongoConnection) {
        const orders = await Order.find({ userId }).sort({ date: -1 });
        return res.json(orders);
      }

      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      const orders = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY date DESC').all(userId);
      const formattedOrders = orders.map((order: any) => ({
        ...order,
        items: JSON.parse(order.items)
      }));
      res.json(formattedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const vite = await (new Function('return import("vite")'))().then((m: any) => m.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      }));
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite could not be loaded:", e);
    }
  } else if (process.env.NODE_ENV === "production") {
    app.use(express.static("dist"));
  }

  // Only listen if not in a serverless environment
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();

// Export the app for Vercel
export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("CRITICAL: Server failed to start:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

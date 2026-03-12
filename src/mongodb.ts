import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not defined in environment variables. MongoDB integration will be skipped.');
}

const MenuSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  desc: { type: String },
  price: { type: Number, required: true },
  img: { type: String },
  isVeg: { type: Boolean, default: false }
});

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  dish: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  date: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  status: { type: String, default: 'placed' },
  type: { type: String, required: true },
  items: { type: mongoose.Schema.Types.Mixed, required: true }
});

export interface IMenu {
  id: string;
  name: string;
  desc?: string;
  price: number;
  img?: string;
  isVeg: boolean;
}

export interface IReview {
  name: string;
  rating: number;
  comment?: string;
  dish?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface IOrder {
  id: string;
  userId?: string;
  date?: Date;
  total: number;
  status?: string;
  type: string;
  items: any;
}

export const Menu = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);
export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export async function migrateData(sqliteDb: any) {
  console.log('Starting data migration from SQLite to MongoDB...');

  try {
    // Migrate Menu
    const sqliteMenu = sqliteDb.prepare('SELECT * FROM menu').all();
    for (const item of sqliteMenu) {
      await Menu.updateOne(
        { id: item.id },
        { 
          $set: { 
            name: item.name,
            desc: item.desc,
            price: item.price,
            img: item.img,
            isVeg: !!item.isVeg
          } 
        },
        { upsert: true }
      );
    }
    console.log(`Migrated ${sqliteMenu.length} menu items.`);

    // Migrate Reviews
    const sqliteReviews = sqliteDb.prepare('SELECT * FROM reviews').all();
    for (const review of sqliteReviews) {
      // Check if review already exists to avoid duplicates (based on name and comment)
      const exists = await Review.findOne({ name: review.name, comment: review.comment });
      if (!exists) {
        await Review.create({
          name: review.name,
          rating: review.rating,
          comment: review.comment,
          dish: review.dish,
          avatar: review.avatar,
          createdAt: new Date(review.createdAt)
        });
      }
    }
    console.log(`Migrated ${sqliteReviews.length} reviews.`);

    // Migrate Orders
    const sqliteOrders = sqliteDb.prepare('SELECT * FROM orders').all();
    for (const order of sqliteOrders) {
      await Order.updateOne(
        { id: order.id },
        {
          $set: {
            userId: order.userId,
            date: new Date(order.date),
            total: order.total,
            status: order.status,
            type: order.type,
            items: JSON.parse(order.items)
          }
        },
        { upsert: true }
      );
    }
    console.log(`Migrated ${sqliteOrders.length} orders.`);

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
}

let lastError: string | null = null;

export async function connectToMongoDB() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing from environment variables');
    return null;
  }
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    const dbName = mongoose.connection.name;
    console.log(`Connected to MongoDB database: ${dbName}`);
    await seedData();
    lastError = null;
    return mongoose.connection;
  } catch (error: any) {
    lastError = error.message;
    console.error('MongoDB connection error:', error);
    return null;
  }
}

export function getMongoDBError() {
  return lastError;
}

async function seedData() {
  const menuCount = await Menu.countDocuments();
  if (menuCount === 0) {
    const initialMenu = [
      {
        id: '1',
        name: "Murgh Makhani",
        desc: "Tender chicken simmered in a velvety tomato and fenugreek sauce, finished with fresh cream.",
        price: 24,
        img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600&auto=format&fit=crop",
        isVeg: false
      },
      {
        id: '2',
        name: "Awadhi Lamb Biryani",
        desc: "Fragrant basmati rice slow-cooked with marinated lamb, saffron, and whole spices in a sealed pot.",
        price: 28,
        img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
        isVeg: false
      },
      {
        id: '3',
        name: "Palak Paneer",
        desc: "Fresh cottage cheese cubes in a smooth, spiced spinach puree with a hint of garlic and cumin.",
        price: 21,
        img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop",
        isVeg: true
      },
      {
        id: '4',
        name: "Tandoori Chicken",
        desc: "Classic bone-in chicken marinated in yogurt and traditional spices, roasted to perfection in a clay oven.",
        price: 22,
        img: "https://images.unsplash.com/photo-1599487405613-6080eb29b922?q=80&w=600&auto=format&fit=crop",
        isVeg: false
      },
      {
        id: '5',
        name: "Dal Makhani",
        desc: "Black lentils and kidney beans slow-cooked overnight with butter and cream for a rich, earthy flavor.",
        price: 18,
        img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
        isVeg: true
      },
      {
        id: '6',
        name: "Aloo Paratha",
        desc: "Fresh cottage cheese cubes in a smooth, spiced spinach puree with a hint of garlic and cumin.",
        price: 15,
        img: "https://media.istockphoto.com/id/1272429419/photo/aloo-paratha-with-butter.jpg?s=612x612&w=0&k=20&c=AfHH7Jtmzdzf7_-jLSYc_ka8J8aHkst5LC0SYI9-q-Y=",
        isVeg: true
      },
      {
        id: '7',
        name: "Garlic Naan",
        desc: "Soft and fluffy flatbread baked in a tandoor, brushed with melted butter and minced garlic.",
        price: 6,
        img: "https://images.unsplash.com/photo-1605493725785-f52119129524?q=80&w=600&auto=format&fit=crop",
        isVeg: true
      },
      {
        id: '8',
        name: "Kadai Paneer",
        desc: "Soft and fluffy flatbread baked in a tandoor, brushed with melted butter and minced garlic.",
        price: 40,
        img: "https://www.whiskaffair.com/wp-content/uploads/2020/08/Kadai-Paneer-Step-14.jpg",
        isVeg: true
      }
    ];
    await Menu.insertMany(initialMenu);
    console.log('Menu seeded');
  }

  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    const initialReviews = [
      {
        name: "Sarah Jenkins",
        rating: 5,
        comment: "Absolutely incredible! The Murgh Makhani is the best I've ever had. The ambiance and service were just as spectacular.",
        dish: "Murgh Makhani",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
      },
      { 
        name: "David Chen",
        rating: 5,
        comment: "A true culinary journey. The spices are perfectly balanced. Highly recommend the Awadhi Lamb Biryani for anyone visiting.",
        dish: "Awadhi Lamb Biryani",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
      },
      {
        name: "Emily Rodriguez",
        rating: 4,
        comment: "Beautiful presentation and authentic flavors. The modern twist on traditional dishes is prepared flawlessly.",
        dish: "Palak Paneer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
      }
    ];
    await Review.insertMany(initialReviews);
    console.log('Reviews seeded');
  }
}

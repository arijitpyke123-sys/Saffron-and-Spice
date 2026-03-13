import path from 'path';

let db: any = null;

const initDb = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    console.log('Skipping SQLite initialization on Vercel.');
    return;
  }

  if (process.env.VERCEL) {
    console.log('Running on Vercel, skipping SQLite initialization.');
    return null;
  }

  try {
    const { default: Database } = await (new Function('return import("better-sqlite3")'))();
    db = new Database('restaurant.db');

    // Initialize database
    db.exec(`
      CREATE TABLE IF NOT EXISTS menu (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        desc TEXT,
        price REAL NOT NULL,
        img TEXT,
        isVeg INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        dish TEXT,
        avatar TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        status TEXT DEFAULT 'placed',
        type TEXT NOT NULL,
        items TEXT NOT NULL -- JSON string of items
      );
    `);

    // Seed initial data if empty
    const menuCount = db.prepare('SELECT count(*) as count FROM menu').get() as { count: number };
    if (menuCount.count === 0) {
      const insertMenu = db.prepare('INSERT INTO menu (id, name, desc, price, img, isVeg) VALUES (?, ?, ?, ?, ?, ?)');
      
      const initialMenu = [
        {
          id: '1',
          name: "Murgh Makhani",
          desc: "Tender chicken simmered in a velvety tomato and fenugreek sauce, finished with fresh cream.",
          price: 24,
          img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600&auto=format&fit=crop",
          isVeg: 0
        },
        {
          id: '2',
          name: "Awadhi Lamb Biryani",
          desc: "Fragrant basmati rice slow-cooked with marinated lamb, saffron, and whole spices in a sealed pot.",
          price: 28,
          img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
          isVeg: 0
        },
        {
          id: '3',
          name: "Palak Paneer",
          desc: "Fresh cottage cheese cubes in a smooth, spiced spinach puree with a hint of garlic and cumin.",
          price: 21,
          img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop",
          isVeg: 1
        },
        {
          id: '4',
          name: "Tandoori Chicken",
          desc: "Classic bone-in chicken marinated in yogurt and traditional spices, roasted to perfection in a clay oven.",
          price: 22,
          img: "https://images.unsplash.com/photo-1599487405613-6080eb29b922?q=80&w=600&auto=format&fit=crop",
          isVeg: 0
        },
        {
          id: '5',
          name: "Dal Makhani",
          desc: "Black lentils and kidney beans slow-cooked overnight with butter and cream for a rich, earthy flavor.",
          price: 18,
          img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
          isVeg: 1
        },
        {
          id: '6',
          name: "Aloo Paratha",
          desc: "Fresh cottage cheese cubes in a smooth, spiced spinach puree with a hint of garlic and cumin.",
          price: 15,
          img: "https://media.istockphoto.com/id/1272429419/photo/aloo-paratha-with-butter.jpg?s=612x612&w=0&k=20&c=AfHH7Jtmzdzf7_-jLSYc_ka8J8aHkst5LC0SYI9-q-Y=",
          isVeg: 1
        },
        {
          id: '7',
          name: "Garlic Naan",
          desc: "Soft and fluffy flatbread baked in a tandoor, brushed with melted butter and minced garlic.",
          price: 6,
          img: "https://images.unsplash.com/photo-1605493725785-f52119129524?q=80&w=600&auto=format&fit=crop",
          isVeg: 1
        },
        {
          id: '8',
          name: "Kadai Paneer",
          desc: "Soft and fluffy flatbread baked in a tandoor, brushed with melted butter and minced garlic.",
          price: 40,
          img: "https://www.whiskaffair.com/wp-content/uploads/2020/08/Kadai-Paneer-Step-14.jpg",
          isVeg: 1
        }
      ];

      initialMenu.forEach(item => {
        insertMenu.run(item.id, item.name, item.desc, item.price, item.img, item.isVeg);
      });
    }

    const reviewCount = db.prepare('SELECT count(*) as count FROM reviews').get() as { count: number };
    if (reviewCount.count === 0) {
      const insertReview = db.prepare('INSERT INTO reviews (name, rating, comment, dish, avatar) VALUES (?, ?, ?, ?, ?)');
      
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

      initialReviews.forEach(review => {
        insertReview.run(review.name, review.rating, review.comment, review.dish, review.avatar);
      });
    }
  } catch (e) {
    console.warn('SQLite initialization failed or skipped:', e);
  }
};

await initDb();

export default db;

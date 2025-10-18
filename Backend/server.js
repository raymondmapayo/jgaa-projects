const dotenv = require("dotenv");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const PAYMONGO_API_URL = "https://api.paymongo.com/v1/links"; // PayMongo API endpoint
const fs = require("fs");
const http = require("http");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
dotenv.config();
const { sendConfirmationEmail } = require("./service/EmailService");
const sgMail = require("@sendgrid/mail");

const app = express();

// -------------------- CORS --------------------
const allowedOrigins = [
  "https://jgaa-projects.vercel.app", // Vercel frontend
  "http://localhost:5173", // local dev Vite
  "http://localhost:3000", // local dev CRA
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / mobile / same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed for " + origin));
    },
    credentials: true,
  })
);

// Preflight requests
app.options("*", cors());

// -------------------- HTTP + Socket.IO --------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});
// -------------------- SOCKET EVENTS --------------------
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("joinWorkerRoom", (workerId) => {
    socket.join(`worker_${workerId}`);
    console.log(`👷 Worker ${workerId} joined room worker_${workerId}`);
  });

  socket.on("joinAdminRoom", (adminId) => {
    socket.join(`admin_${adminId}`);
    console.log(`🧑‍💼 Admin ${adminId} joined room admin_${adminId}`);
  });

  socket.on("joinClientRoom", (clientId) => {
    socket.join(`client_${clientId}`);
    console.log(`🙋 Client ${clientId} joined room client_${clientId}`);
  });

  socket.on("newMessageToWorker", (data) => {
    io.to(`worker_${data.receiver_id}`).emit("newMessage", data);
  });

  socket.on("newMessageToClient", (data) => {
    io.to(`client_${data.receiver_id}`).emit("newMessage", data);
  });

  socket.on("newMessageToAdmin", (data) => {
    io.to(`admin_${data.receiver_id}`).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- MIDDLEWARES --------------------
app.use(express.json()); // Add this - crucial for parsing JSON bodies
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"))
);
const paypal = require("paypal-rest-sdk");
const { sendResetEmail } = require("./service/ForgotEmail");

const storage = multer.diskStorage({
  // @ts-ignore
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  // @ts-ignore
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadDir = path.join(__dirname, "uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  // @ts-ignore
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg"];
    if (
      !allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    ) {
      return cb(new Error("Only images (.png, .jpg, .jpeg) are allowed"));
    }
    cb(null, true);
  },
});

// -------------------- MySQL Connection --------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST, // from Railway/Clever Cloud
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

db.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL (Clever Cloud)");
});

// Ensure SMTP email is set
const smtpEmail = process.env.SMTP_EMAIL;
if (!smtpEmail) {
  throw new Error("SMTP_EMAIL is not defined in environment variables.");
}

// Ensure the API_KEY is either a valid string or throw an error if undefined
const API_KEY = process.env.SENDGRID_API_KEY || ""; // Fallback to empty string if undefined
if (!API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined");
}

sgMail.setApiKey(API_KEY);

// Ensure that both client_id and client_secret are defined in the environment variables
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error(
    "PayPal credentials (client_id and client_secret) are not defined in environment variables."
  );
}

// Configure PayPal SDK with environment variables
paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});
//==========================MENUS INSERT ===============================================
app.post("/add_menu", upload.single("menu_img"), (request, response) => {
  const { item_name, price, description, categories_id } = request.body; // Removed categories_name from the body
  const menu_img = request.file ? request.file.filename : ""; // No default image

  // First, fetch categories_name based on categories_id
  const fetchCategorySql =
    "SELECT categories_name FROM categories_tbl WHERE categories_id = ?";

  db.query(fetchCategorySql, [categories_id], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return response.status(404).json({ error: "Category not found" });
    }

    const categories_name = results[0].categories_name; // Get the categories_name

    // ✅ Fixed query: put "Available" under availability, not price
    const sql =
      'INSERT INTO menu_tbl (item_name, menu_img, description, price, availability, categories_id, categories_name) VALUES (?, ?, ?, ?, "Available", ?, ?)';

    db.query(
      sql,
      [item_name, menu_img, description, price, categories_id, categories_name],
      // @ts-ignore
      (error, result) => {
        if (error) {
          console.error(error);
          return response.status(500).json({ error: "Internal Server Error" });
        }
        response.send("Menu item added");
      }
    );
  });
});

app.put("/update_menu/:menu_id", upload.single("menu_img"), (req, res) => {
  const { menu_id } = req.params;
  const { item_name, price, description, availability, created_by } = req.body;
  const menu_img = req.file ? req.file.filename : null;

  // Step 1: Fetch old menu values
  const fetchOldSql = `SELECT item_name, price FROM menu_tbl WHERE menu_id = ?`;
  db.query(fetchOldSql, [menu_id], (err, oldResults) => {
    if (err || oldResults.length === 0) {
      console.error("Error fetching old menu:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch old menu" });
    }

    const oldMenu = oldResults[0];

    // Step 2: Update menu
    let sql = `UPDATE menu_tbl SET item_name = ?, price = ?, description = ?, availability = ?, created_by = ?`;
    let params = [item_name, price, description, availability, created_by];

    if (menu_img) {
      sql += `, menu_img = ?`;
      params.push(menu_img);
    }

    sql += ` WHERE menu_id = ?`;
    params.push(menu_id);

    db.query(sql, params, (error, result) => {
      if (error) {
        console.error("Error updating menu item:", error);
        return res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Menu item not found" });
      }

      // Step 3: Determine what fields changed
      const updatedFields = {};
      if (oldMenu.item_name !== item_name) updatedFields.item_name = item_name;
      if (Number(oldMenu.price) !== Number(price)) updatedFields.price = price;

      // Step 4: Log the changes in menu_update_log
      if (Object.keys(updatedFields).length > 0) {
        const logSql = `
          INSERT INTO menu_update_log (menu_id, updatedFields, updated_by, updated_at)
          VALUES (?, ?, ?, NOW())
        `;
        db.query(
          logSql,
          [menu_id, JSON.stringify(updatedFields), created_by],
          (err3) => {
            if (err3) console.error("Error logging menu update:", err3);
          }
        );
      }

      // Step 5: Fetch worker info
      const fetchWorkerSql = `
        SELECT u.fname AS worker_fname, u.lname AS worker_lname, u.profile_pic AS worker_profile_pic
        FROM user_tbl u
        LEFT JOIN menu_tbl m ON u.user_id = m.created_by
        WHERE m.menu_id = ?
      `;
      db.query(fetchWorkerSql, [menu_id], (err2, workerResults) => {
        if (err2) {
          console.error("Error fetching worker info:", err2);
          return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
        }

        return res.json({
          success: true,
          message: "Menu item updated successfully",
          updatedFields, // ✅ Send only updated fields
          workerInfo: workerResults[0] || null,
        });
      });
    });
  });
});

//========================== MENUS END INSERT ===========================================
//========================== MENUS ITEM  GET =========================================
// @ts-ignore
app.get("/menu_items", (request, response) => {
  const sql = "SELECT * FROM menu_tbl";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching items:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched items:", data);
    return response.json(data);
  });
});
//========================== MENUS ITEM END GET =======================================

//========================== ADD CATEGORIES ===============================================

app.post("/add_categories", upload.single("categories_img"), (req, res) => {
  const { categories_name, description, status } = req.body;
  const categories_img = req.file ? req.file.filename : "";

  const sql =
    "INSERT INTO categories_tbl (categories_name, categories_img, description, status) VALUES (?, ?, ?, 'active')";

  db.query(
    sql,
    [categories_name, categories_img, description, status],
    (error) => {
      if (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ message: "Category added successfully" });
    }
  );
});

app.post("/add_ingredients", (req, res) => {
  const { ingredients_name, unit, category, measurement } = req.body; // measurement is varchar now

  if (!ingredients_name || !unit || !category || !measurement) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Get menu_id
  const getMenuIdSql = "SELECT menu_id FROM menu_tbl WHERE item_name = ?";
  db.query(getMenuIdSql, [category], (err, results) => {
    if (err) {
      console.error("Error checking menu:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Selected category/item does not exist" });
    }

    const menu_id = results[0].menu_id;
    const date_created = new Date();

    // Insert into ingredients_tbl with measurement as VARCHAR
    const insertSql =
      "INSERT INTO ingredients_tbl (ingredients_name, unit, measurement, date_created, item_name, menu_id) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
      insertSql,
      [ingredients_name, unit, measurement, date_created, category, menu_id],
      (err2, result) => {
        if (err2) {
          console.error("Error inserting ingredient:", err2);
          return res.status(500).json({ message: "Database error" });
        }

        res.status(200).json({
          message: "Ingredient added successfully",
          id: result.insertId,
          ingredient: {
            ingredients_name,
            unit,
            measurement, // now string
            item_name: category,
            menu_id,
            date_created,
          },
        });
      }
    );
  });
});

// Get ingredient name by ID
app.get("/ingredient/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Ingredient ID is required" });
  }

  const sql =
    "SELECT ingredients_name FROM ingredients_tbl WHERE ingredients_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching ingredient:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.status(200).json({
      ingredients_name: results[0].ingredients_name,
    });
  });
});

// Get ingredients by menu_id
app.get("/ingredients_by_category/:menu_id", (req, res) => {
  const { menu_id } = req.params;

  const sql =
    "SELECT ingredients_id, ingredients_name, measurement, unit FROM ingredients_tbl WHERE menu_id = ?";

  db.query(sql, [menu_id], (err, results) => {
    if (err) {
      console.error("Error fetching ingredients:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results); // returns array of objects: {ingredients_id, ingredients_name, measurement, unit}
  });
});

// ✅ Update ingredient and fetch worker info
app.put("/update_ingredient/:id", (req, res) => {
  const { id } = req.params;
  const { ingredients_name, measurement, unit, created_by } = req.body;

  const updateSql = `
    UPDATE ingredients_tbl 
    SET ingredients_name = ?, measurement = ?, unit = ?, created_by = ?
    WHERE ingredients_id = ?
  `;

  db.query(
    updateSql,
    [ingredients_name, measurement, unit, created_by, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating ingredient:", err);
        return res.status(500).json({ error: "Failed to update ingredient" });
      }

      // ✅ Fetch worker info only (fname, lname, profile_pic)
      const fetchSql = `
        SELECT 
          u.fname AS worker_fname,
          u.lname AS worker_lname,
          u.profile_pic AS worker_profile_pic
        FROM user_tbl u
        WHERE u.user_id = ?
      `;

      db.query(fetchSql, [created_by], (err2, rows) => {
        if (err2) {
          console.error("❌ Error fetching worker info:", err2);
          return res.status(500).json({ error: "Failed to fetch worker info" });
        }

        res.json({
          message: "Ingredient updated successfully",
          updatedBy: rows[0],
        });
      });
    }
  );
});

//========================== END ADD CATEGORIES ===========================================
//========================== Edit start CATEGORIES ===========================================
app.put(
  "/update_categories/:cat_id",
  upload.single("categories_img"),
  (req, res) => {
    const { cat_id } = req.params;
    const { categories_name, description, status, created_by } = req.body;
    const categories_img = req.file ? req.file.filename : null;

    let sql = `
      UPDATE categories_tbl 
      SET categories_name = ?, description = ?, status = ?, created_by = ?
    `;
    let params = [categories_name, description, status, created_by];

    if (categories_img) {
      sql += `, categories_img = ?`;
      params.push(categories_img);
    }

    sql += ` WHERE categories_id = ?`;
    params.push(cat_id);

    console.log("SQL Query:", sql);
    console.log("Params:", params);

    db.query(sql, params, (error) => {
      if (error) {
        console.error("Error updating category:", error);
        return res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }

      // ✅ Update category references in related tables
      const updateMenuSql = `
        UPDATE menu_tbl
        SET categories_name = ?, categories_id = ?
        WHERE categories_id = ?
      `;
      const updateMenuParams = [categories_name, cat_id, cat_id];

      db.query(updateMenuSql, updateMenuParams, (menuErr) => {
        if (menuErr) {
          console.error("Error updating menu_tbl:", menuErr);
          return res
            .status(500)
            .json({ success: false, error: "Failed to update menu_tbl" });
        }

        const updateOrderSql = `
          UPDATE order_tbl
          SET categories_name = ?, categories_id = ?
          WHERE categories_id = ?
        `;
        const updateOrderParams = [categories_name, cat_id, cat_id];

        db.query(updateOrderSql, updateOrderParams, (orderErr) => {
          if (orderErr) {
            console.error("Error updating order_tbl:", orderErr);
            return res
              .status(500)
              .json({ success: false, error: "Failed to update order_tbl" });
          }

          const updateOrderItemSql = `
            UPDATE orderitem_tbl
            SET categories_name = ?, categories_id = ?
            WHERE categories_id = ?
          `;
          const updateOrderItemParams = [categories_name, cat_id, cat_id];

          db.query(
            updateOrderItemSql,
            updateOrderItemParams,
            (orderItemErr) => {
              if (orderItemErr) {
                console.error("Error updating orderitem_tbl:", orderItemErr);
                return res.status(500).json({
                  success: false,
                  error: "Failed to update orderitem_tbl",
                });
              }

              // ✅ Fetch worker info from user_tbl
              const fetchUserSql = `
              SELECT 
                u.fname AS worker_fname, 
                u.lname AS worker_lname, 
                u.profile_pic AS worker_profile_pic
              FROM user_tbl u
              WHERE u.user_id = ?
            `;
              db.query(fetchUserSql, [created_by], (userErr, userResult) => {
                if (userErr) {
                  console.error("Error fetching user info:", userErr);
                  return res.status(500).json({
                    success: false,
                    error: "Failed to fetch user info",
                  });
                }

                res.status(200).json({
                  success: true,
                  message:
                    "Category, Menu, Order, and Order Items updated successfully",
                  updatedCategory: {
                    categories_id: cat_id,
                    categories_name,
                    description,
                    status,
                    categories_img,
                    created_by,
                    workerInfo: userResult[0] || null,
                  },
                });
              });
            }
          );
        });
      });
    });
  }
);

// Express route to get a specific category by ID
app.get("/get_category/:categoryId", (req, res) => {
  const { categoryId } = req.params;

  const sql =
    "SELECT categories_id, categories_name, categories_img, description, status FROM categories_tbl WHERE categories_id = ? AND status = 'active'";

  db.query(sql, [categoryId], (error, data) => {
    if (error) {
      console.error("Error fetching category:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json(data[0]); // Send the category data back as the response
  });
});

//========================== END Edit CATEGORIES ===========================================

//========================== CATEGORIES ITEM GET ======================================

app.get("/categories", (request, response) => {
  const sql = "SELECT categories_id, categories_name FROM categories_tbl"; // Make sure to select the right columns

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching categories:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched categories:", data);
    return response.json(data); // Return fetched categories
  });
});

app.get("/get_categories", (req, res) => {
  const sql =
    "SELECT categories_id, categories_name, categories_img, description, status FROM categories_tbl WHERE status = 'active'"; // Filter categories with 'active' status

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched active categories:", data);
    return res.json(data); // Return fetched active categories
  });
});

app.delete("/categories/:id", (req, res) => {
  const serveId = req.params.id;

  console.log("Archiving category with ID:", serveId); // Debugging line

  const sql =
    "UPDATE categories_tbl SET status = 'deleted' WHERE categories_id = ?";

  db.query(sql, [serveId], (error) => {
    if (error) {
      console.error("Error archiving category:", error);
      return res.status(500).send("Error archiving category");
    }
    console.log("Category archived successfully"); // Debugging line
    res.send("Category archived successfully");
  });
});

app.put("/category/:id", (request, response) => {
  const categoriesId = request.params.id;
  const { categories_name } = request.body;

  // First query: Update the categories_tbl
  const updateCategorySql =
    "UPDATE categories_tbl SET categories_name = ? WHERE categories_id = ?";

  // Second query: Update the menu_tbl with the new categories_name
  const updateMenuSql =
    "UPDATE menu_tbl SET categories_name = ? WHERE categories_id = ?";

  db.query(updateCategorySql, [categories_name, categoriesId], (error) => {
    if (error) {
      console.error("Error updating Category:", error);
      return response.status(500).send("Error updating Category");
    }

    db.query(updateMenuSql, [categories_name, categoriesId], (error) => {
      if (error) {
        console.error("Error updating Menu:", error);
        return response.status(500).send("Error updating Menu");
      }

      response.send("Category and related menu items updated successfully");
    });
  });
});
app.get("/get_archived", (req, res) => {
  const sql =
    "SELECT categories_id, categories_name, categories_img, description, status FROM categories_tbl WHERE status = 'deleted'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching archived categories:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched archived categories:", data);
    return res.json(data); // Return archived categories
  });
});
app.post("/restore_category/:id", (req, res) => {
  const serveId = req.params.id;

  const sql =
    "UPDATE categories_tbl SET status = 'active' WHERE categories_id = ?";

  db.query(sql, [serveId], (error) => {
    if (error) {
      console.error("Error restoring category:", error);
      return res.status(500).send("Error restoring category");
    }
    res.send("Category restored successfully");
  });
});

app.post("/add_supply", (req, res) => {
  const {
    inventoryId,
    productName,
    category,

    stockIn,
    unit,
    price,
    status,
    cat_supply_id,
  } = req.body;

  if (
    !productName ||
    !category ||
    stockIn === undefined ||
    stockIn === null ||
    !unit ||
    price === undefined ||
    price === null ||
    !status ||
    !cat_supply_id
  ) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  // Helper: insert supply and update inventory stock + created_at
  const insertSupplyAndRecalc = (
    /** @type {any} */ invId,
    /** @type {any} */ categoryName
  ) => {
    const insertSupplySql = `
      INSERT INTO supply_tbl
      (inventory_id, cat_supply_id, product_name, category, stock_in, unit, price, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    db.query(
      insertSupplySql,
      [
        invId,
        cat_supply_id,
        productName,
        categoryName, // ✅ Use category name

        stockIn,
        unit,
        price,
        status,
      ],
      (err) => {
        if (err) {
          console.error("❌ Insert Supply Error:", err);
          return res
            .status(500)
            .json({ success: false, message: "DB insert supply error" });
        }

        const calcSql = `
          SELECT 
            SUM(stock_in) AS total_stock,
            MAX(created_at) AS latest_created
          FROM supply_tbl
          WHERE inventory_id = ?
        `;
        db.query(calcSql, [invId], (err2, rows) => {
          if (err2) {
            console.error("❌ Calc Totals Error:", err2);
            return res
              .status(500)
              .json({ success: false, message: "DB calc error" });
          }

          const total_stock = rows[0].total_stock || 0;
          const latest_created = rows[0].latest_created;

          const updateInventorySql = `
            UPDATE inventory_tbl
            SET stock_in = ?, created_at = ?, category = ?
            WHERE inventory_id = ?
          `;
          db.query(
            updateInventorySql,
            [total_stock, latest_created, categoryName, invId], // ✅ Update category name
            (err3) => {
              if (err3) {
                console.error("❌ Update Inventory Error:", err3);
                return res.status(500).json({
                  success: false,
                  message: "DB update inventory error",
                });
              }
              return res.json({
                success: true,
                message: "Supply added & inventory updated successfully",
                inventory_id: invId,
              });
            }
          );
        });
      }
    );
  };

  // Main Flow
  const fetchCategoryName = (callback) => {
    db.query(
      "SELECT supply_cat_name FROM supply_categories WHERE cat_supply_id = ? LIMIT 1",
      [cat_supply_id],
      (err, rows) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Failed to get category name" });
        const categoryName = rows[0]?.supply_cat_name || "Uncategorized";
        callback(categoryName);
      }
    );
  };

  if (inventoryId) {
    db.query(
      "SELECT * FROM inventory_tbl WHERE inventory_id = ? LIMIT 1",
      [inventoryId],
      (err, rows) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "DB check error" });
        fetchCategoryName((categoryName) => {
          if (rows.length > 0) {
            insertSupplyAndRecalc(inventoryId, categoryName);
          } else {
            const createInvSql = `
              INSERT INTO inventory_tbl
              (product_name, category, stock_in, stock_out, unit, status, created_at)
              VALUES (?, ?, 0, 0, ?, ?, NOW())
            `;
            db.query(
              createInvSql,
              [productName, categoryName, unit, status],
              (err2, result2) => {
                if (err2)
                  return res.status(500).json({
                    success: false,
                    message: "DB insert inventory error",
                  });
                insertSupplyAndRecalc(result2.insertId, categoryName);
              }
            );
          }
        });
      }
    );
  } else {
    db.query(
      "SELECT * FROM inventory_tbl WHERE product_name = ? AND unit = ? LIMIT 1",
      [productName, unit],
      (err, rows) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "DB find inventory error" });
        fetchCategoryName((categoryName) => {
          if (rows.length > 0) {
            insertSupplyAndRecalc(rows[0].inventory_id, categoryName);
          } else {
            const createInvSql = `
              INSERT INTO inventory_tbl
              (product_name, category, stock_in, stock_out, unit, status, created_at)
              VALUES (?, ?, 0, 0, ?, ?, NOW())
            `;
            db.query(
              createInvSql,
              [productName, categoryName, unit, status],
              (err2, result2) => {
                if (err2)
                  return res.status(500).json({
                    success: false,
                    message: "DB insert inventory error",
                  });
                insertSupplyAndRecalc(result2.insertId, categoryName);
              }
            );
          }
        });
      }
    );
  }
});

// ✅ API to get all inventory
app.get("/get_supply", (req, res) => {
  const sql = "SELECT * FROM supply_tbl";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ MySQL Get Supply Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error (get Supply)" });
    }
    res.json({ success: true, data: results });
  });
});

// ✅ API to get all inventory
app.get("/get_inventory", (req, res) => {
  const sql = "SELECT * FROM inventory_tbl";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ MySQL Get Inventory Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error (get inventory)" });
    }
    res.json({ success: true, data: results });
  });
});

// Update supply and automatically recalc inventory stock
app.put("/update_supply/:supply_id", (req, res) => {
  const { supply_id } = req.params;
  const { product_name, category, stock_in, unit, price } = req.body;

  // 1️⃣ Update the supply first
  const updateSupplySql = `
    UPDATE supply_tbl
    SET product_name = ?, category = ?, stock_in = ?, unit = ?, price = ?
    WHERE supply_id = ?
  `;
  db.query(
    updateSupplySql,
    [product_name, category, stock_in, unit, price, supply_id],
    (err, result) => {
      if (err) {
        console.error("❌ Update Supply Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "DB update supply error" });
      }

      // 2️⃣ Get the inventory_id of this supply
      const getInventorySql = `SELECT inventory_id FROM supply_tbl WHERE supply_id = ?`;
      db.query(getInventorySql, [supply_id], (err2, rows) => {
        if (err2 || rows.length === 0) {
          console.error("❌ Get Inventory ID Error:", err2);
          return res.status(500).json({
            success: false,
            message: "Failed to get related inventory",
          });
        }

        const inventoryId = rows[0].inventory_id;

        // 3️⃣ Recalculate total stock_in for this inventory
        const calcTotalStockSql = `
          SELECT SUM(stock_in) AS total_stock,
                 MAX(created_at) AS latest_created
          FROM supply_tbl
          WHERE inventory_id = ?
        `;
        db.query(calcTotalStockSql, [inventoryId], (err3, rows2) => {
          if (err3) {
            console.error("❌ Calc Inventory Stock Error:", err3);
            return res
              .status(500)
              .json({ success: false, message: "Failed to recalc inventory" });
          }

          const totalStock = rows2[0].total_stock || 0;
          const latestCreated = rows2[0].latest_created;

          // 4️⃣ Update inventory_tbl with new stock_in
          const updateInventorySql = `
            UPDATE inventory_tbl
            SET stock_in = ?, created_at = ?, category = ?
            WHERE inventory_id = ?
          `;
          db.query(
            updateInventorySql,
            [totalStock, latestCreated, category, inventoryId],
            (err4) => {
              if (err4) {
                console.error("❌ Update Inventory Error:", err4);
                return res.status(500).json({
                  success: false,
                  message: "Failed to update inventory",
                });
              }

              // ✅ Success
              res.json({
                success: true,
                message: "Supply updated & inventory recalculated successfully",
              });
            }
          );
        });
      });
    }
  );
});

// Get all categories

// Insert category
app.post("/add_supply_category", (req, res) => {
  const { supply_cat_name } = req.body;

  const sql = `
    INSERT INTO supply_categories (supply_cat_name, created_at)
    VALUES (?, NOW())
  `;

  db.query(sql, [supply_cat_name], (err, result) => {
    if (err) {
      console.error("Error inserting supply category:", err);
      return res.status(500).json({ error: "Failed to add supply category" });
    }

    // Fetch the inserted row to return full data
    const fetchSql = `
      SELECT cat_supply_id, supply_cat_name, created_at
      FROM supply_categories
      WHERE cat_supply_id = ?
    `;
    db.query(fetchSql, [result.insertId], (err2, rows) => {
      if (err2) {
        console.error("Error fetching inserted row:", err2);
        return res
          .status(500)
          .json({ error: "Failed to fetch inserted category" });
      }

      res.json(rows[0]); // return the full row
    });
  });
});

// Get all categories
app.get("/get_supply_categories", (req, res) => {
  const sql = `
    SELECT cat_supply_id, supply_cat_name, created_at
    FROM supply_categories
    ORDER BY cat_supply_id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching supply categories:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch supply categories" });
    }

    res.json(results);
  });
});

// Edit category

// ✅ Update supply category and sync changes to inventory_tbl + supply_tbl
app.put("/update_supply_category/:id", (req, res) => {
  const { id } = req.params;
  const { supply_cat_name, created_by } = req.body;

  // ✅ Step 1: Get old category name first
  const getOldCategorySql = `
    SELECT supply_cat_name FROM supply_categories WHERE cat_supply_id = ?
  `;

  db.query(getOldCategorySql, [id], (err, oldRows) => {
    if (err) {
      console.error("❌ Error fetching old category name:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch old category name" });
    }

    if (oldRows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const oldCategoryName = oldRows[0].supply_cat_name;

    // ✅ Step 2: Update supply_categories
    const updateSql = `
      UPDATE supply_categories 
      SET supply_cat_name = ?, created_by = ?
      WHERE cat_supply_id = ?
    `;

    db.query(updateSql, [supply_cat_name, created_by, id], (err2) => {
      if (err2) {
        console.error("❌ Error updating supply category:", err2);
        return res.status(500).json({ error: "Failed to update category" });
      }

      // ✅ Step 3: Update category in inventory_tbl (using old category name)
      const updateInventorySql = `
        UPDATE inventory_tbl 
        SET category = ?
        WHERE category = ?
      `;

      db.query(
        updateInventorySql,
        [supply_cat_name, oldCategoryName],
        (err3) => {
          if (err3) {
            console.error("❌ Error updating inventory_tbl category:", err3);
            return res
              .status(500)
              .json({ error: "Failed to update inventory table" });
          }

          // ✅ Step 4: Update category in supply_tbl (linked by cat_supply_id)
          const updateSupplySql = `
          UPDATE supply_tbl 
          SET category = ?
          WHERE cat_supply_id = ?
        `;

          db.query(updateSupplySql, [supply_cat_name, id], (err4) => {
            if (err4) {
              console.error("❌ Error updating supply_tbl category:", err4);
              return res
                .status(500)
                .json({ error: "Failed to update supply table" });
            }

            // ✅ Step 5: Fetch updated category info with worker details
            const fetchSql = `
            SELECT 
              sc.cat_supply_id,
              sc.supply_cat_name,
              sc.created_at,
              u.fname AS worker_fname,
              u.lname AS worker_lname,
              u.profile_pic AS worker_profile_pic
            FROM supply_categories sc
            LEFT JOIN user_tbl u ON sc.created_by = u.user_id
            WHERE sc.cat_supply_id = ?
          `;

            db.query(fetchSql, [id], (err5, rows) => {
              if (err5) {
                console.error("❌ Error fetching updated category:", err5);
                return res
                  .status(500)
                  .json({ error: "Failed to fetch updated data" });
              }

              if (rows.length === 0) {
                return res
                  .status(404)
                  .json({ error: "Category not found after update" });
              }

              res.json({
                message: "✅ Category and linked tables updated successfully",
                updatedCategory: rows[0],
              });
            });
          });
        }
      );
    });
  });
});

// Delete category
app.delete("/delete_supply_category/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM supply_categories WHERE cat_supply_id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting supply category:", err);
      return res.status(500).json({ error: "Failed to delete category" });
    }
    res.json({ message: "Supply category deleted successfully" });
  });
});

// ✅ Update supply

// ✅ Delete supply
app.delete("/delete_supply/:supply_id", (req, res) => {
  const { supply_id } = req.params;

  const sql = "DELETE FROM supply_tbl WHERE supply_id = ?";
  db.query(sql, [supply_id], (err, result) => {
    if (err) {
      console.error("❌ Delete Supply Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "DB delete supply error" });
    }
    res.json({ success: true, message: "Supply deleted successfully" });
  });
});

//==========================================================================================================================

//==========================  LOGIN COMPONENTS ============================
// User Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login Request Received:", { email, password });

  // Hash the input password before comparing
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  // Query database for user
  const sql = "SELECT * FROM user_tbl WHERE email = ?";
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = results[0];

    console.log("User Found in DB:", user);

    // Compare hashed password
    if (hashedPassword !== user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if account is active (if email is verified)
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Please verify your email account in your email inbox",
      });
    }

    // Debug JWT_SECRET
    console.log("JWT Secret:", process.env.JWT_SECRET);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "JWT secret is not defined" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        fname: user.fname,
        email: user.email,
        pnum: user.pnum,
        role: user.role,
        lname: user.lname,
      },
      token,
    });
  });
});

// Backend - Check Email Verification Status
app.post("/check-email-status", (req, res) => {
  const { email } = req.body;

  const sql = "SELECT status FROM user_tbl WHERE email = ?";
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" }); // Handle if email doesn't exist
    }

    const user = results[0];

    // Check if the user's status is active (verified)
    if (user.status !== "active") {
      return res.status(200).json({ status: "inactive" }); // Email not verified
    }

    return res.status(200).json({ status: "active" }); // Email verified
  });
});
app.post("/check-password", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT password, status FROM user_tbl WHERE email = ?";
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = results[0];

    // Here, compare the provided password with the stored hashed password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(200).json({ status: "invalid" }); // Password is invalid
    }

    if (user.status !== "active") {
      return res.status(200).json({ status: "inactive" }); // Email not verified
    }

    return res.status(200).json({ status: "valid" }); // Password is valid
  });
});

// Register route to handle user registration and email sending
// Register route - FIXED VERSION
app.post("/register", async (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    pnum,
    address,
    role = "client",
  } = req.body;

  // Basic validation
  if (!fname || !lname || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide all required fields: fname, lname, email, password",
    });
  }

  try {
    const checkEmailSql = "SELECT * FROM user_tbl WHERE email = ?";

    db.query(checkEmailSql, [email], async (checkError, checkResults) => {
      if (checkError) {
        console.error("Error checking email:", checkError);
        return res.status(500).json({
          success: false,
          message: "Error checking email",
        });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      // Hash password
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      // Generate verification token FIRST
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7);

      // Insert user with verification token in ONE query
      const sql = `
        INSERT INTO user_tbl 
        (fname, lname, pnum, email, password, address, role, status, verification_token, token_expiry) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'inactive', ?, ?)
      `;

      db.query(
        sql,
        [
          fname,
          lname,
          pnum,
          email,
          hashedPassword,
          address,
          role,
          verificationToken,
          tokenExpiry,
        ],
        async (error, results) => {
          if (error) {
            console.error("Error inserting user into the database:", error);
            return res.status(500).json({
              success: false,
              message: "Error creating user account",
            });
          }

          try {
            // Try to send email (but don't crash if it fails)
            const emailSent = await sendConfirmationEmail({
              email: email,
              verification_token: verificationToken,
            });

            if (emailSent) {
              res.status(200).json({
                success: true,
                message:
                  "User registered successfully. A verification link has been sent to your email.",
              });
            } else {
              res.status(200).json({
                success: true,
                message:
                  "Account created successfully! Please check your email for verification link.",
                warning:
                  "If you don't receive the email, check your spam folder.",
              });
            }
          } catch (emailError) {
            console.error("Email service error:", emailError);
            // Still success because user was created
            res.status(200).json({
              success: true,
              message:
                "Account created successfully! Please check your email for verification link.",
            });
          }
        }
      );
    });
  } catch (err) {
    console.error("Error in registration flow:", err);
    res.status(500).json({
      success: false,
      message: "Error in registration process",
    });
  }
});
// ==================== Forgot Password ====================
app.post("/forgot_password", (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM user_tbl WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    const updateSql =
      "UPDATE user_tbl SET reset_token = ?, reset_expiry = ? WHERE user_id = ?";
    db.query(
      updateSql,
      [resetToken, resetExpiry, user.user_id],
      async (err2) => {
        if (err2) return res.status(500).json({ message: "DB update error" });

        const resetUrl = `https://jgaa-projects.vercel.app/reset-password/${resetToken}`;
        try {
          await sendResetEmail(user, resetUrl);
          return res.json({ success: true, message: "Reset email sent!" });
        } catch (emailErr) {
          console.error("Email error:", emailErr);
          return res
            .status(500)
            .json({ message: "Failed to send reset email" });
        }
      }
    );
  });
});

// ==================== Reset Password ====================
app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const sql =
    "SELECT * FROM user_tbl WHERE reset_token = ? AND reset_expiry > NOW()";
  db.query(sql, [token], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    try {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      const updateSql =
        "UPDATE user_tbl SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE reset_token = ?";
      db.query(updateSql, [hashedPassword, token], (err2) => {
        if (err2)
          return res.status(500).json({ message: "Failed to reset password" });
        return res.json({ message: "Password reset successful!" });
      });
    } catch (hashErr) {
      return res.status(500).json({ message: "Password hashing failed" });
    }
  });
});
// Update Password Route (using app.put directly)
// @ts-ignore
// Update Password Route (app.put)
app.put("/update_password/:id", (req, res) => {
  const { password } = req.body; // New password from the request body
  const userId = req.params.id; // User ID from the URL parameter

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    // Hash the new password using SHA256
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // SQL query to update the user's password in the database
    const sql = "UPDATE user_tbl SET password = ? WHERE user_id = ?";

    db.query(sql, [hashedPassword, userId], (error, result) => {
      if (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res
        .status(200)
        .json({ message: "Password updated successfully!" });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ message: "Error updating password" });
  }
});

// Fetch user details based on user_id

app.get("/user_details/:user_id", (req, res) => {
  const userId = req.params.user_id;

  // Log the received user_id to verify it's correct
  console.log("Received user_id:", userId); // Log user_id for debugging

  // SQL query to fetch the user details
  const sql =
    "SELECT user_id,notes, city, country, fname, lname, pnum, email FROM user_tbl WHERE user_id = ?";

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching user details:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching user details" });
    }

    // Log the query result for debugging
    console.log("Query results:", results); // Log the result for debugging

    if (results.length === 0) {
      console.log("No user found with user_id:", userId); // Log if no user is found
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If the user is found, format the response data
    const user = results[0];
    const responseData = {
      fname: user.fname || "",
      lname: user.lname || "",
      pnum: user.pnum || "",
      email: user.email || "",
      country: user.country || "",
      notes: user.notes || "",
      city: user.city || "",
    };

    // Log the final response data for debugging
    console.log("Returning user details:", responseData);

    res.status(200).json({
      success: true,
      data: responseData, // Send the formatted user data
    });
  });
});

// @ts-ignore
app.put("/update_save_billing_details/:id", (req, res) => {
  const user_id = req.params.id; // Get the user ID from the URL parameter
  const { city, country, notes } = req.body; // Extract city, country, and notes from the request body

  console.log("Received request to update user:", user_id); // Log the user_id for debugging
  console.log("Data to update:", { city, country, notes }); // Log the data being sent in the request

  if (!city || !country) {
    return res.status(400).json({ message: "City and Country are required" });
  }

  // If notes is undefined or empty, set it to null for optional handling
  const notesToUpdate = notes || null;

  console.log("Updating with notes:", notesToUpdate); // Log the final value of notes to be used

  const sql =
    "UPDATE user_tbl SET city = ?, country = ?, notes = ? WHERE user_id = ?";
  const params = [city, country, notesToUpdate, user_id];

  db.query(sql, params, (error, result) => {
    if (error) {
      console.error("Error executing SQL query:", error); // Log the SQL query error
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      console.log("No rows updated for user_id:", user_id); // Log if no rows were updated
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User details updated successfully:", result); // Log success message

    res.status(200).json({
      success: true,
      message: "Billing details updated successfully",
      data: { city, country, notes: notesToUpdate },
    });
  });
});

// @ts-ignore
app.put("/update_save_billing_details/:id", (req, res) => {
  const user_id = req.params.id; // Get the user ID from the URL parameter
  const { city, country, notes } = req.body; // Extract city, country, and notes from the request body

  console.log("Received request to update user:", user_id); // Log the user_id for debugging
  console.log("Data to update:", { city, country, notes }); // Log the data being sent in the request

  if (!city || !country) {
    return res.status(400).json({ message: "City and Country are required" });
  }

  // If notes is undefined or empty, set it to null for optional handling
  const notesToUpdate = notes || null;

  console.log("Updating with notes:", notesToUpdate); // Log the final value of notes to be used

  const sql =
    "UPDATE user_tbl SET city = ?, country = ?, notes = ? WHERE user_id = ?";
  const params = [city, country, notesToUpdate, user_id];

  db.query(sql, params, (error, result) => {
    if (error) {
      console.error("Error executing SQL query:", error); // Log the SQL query error
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      console.log("No rows updated for user_id:", user_id); // Log if no rows were updated
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User details updated successfully:", result); // Log success message

    res.status(200).json({
      success: true,
      message: "Billing details updated successfully",
      data: { city, country, notes: notesToUpdate },
    });
  });
});

// This is CORRECT - no changes needed
app.post("/check-email", (req, res) => {
  const { email } = req.body;
  const sql = "SELECT * FROM user_tbl WHERE email = ?";

  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Error checking email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error checking email" });
    }

    console.log("Email check result:", results); // This log is helpful

    if (results.length > 0) {
      return res.status(200).json({ available: false }); // Email taken
    }

    return res.status(200).json({ available: true }); // Email available
  });
});

// Route to handle email verification

app.get("/verify-email/:token", (req, res) => {
  const { token } = req.params;

  console.log("Verification attempt with token:", token);

  const sql =
    "SELECT * FROM user_tbl WHERE verification_token = ? AND token_expiry > NOW()";

  db.query(sql, [token], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during verification",
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const user = results[0];

    // Update user status to active
    const updateSql =
      "UPDATE user_tbl SET status = 'active', verification_token = NULL WHERE user_id = ?";

    db.query(updateSql, [user.user_id], (updateErr) => {
      if (updateErr) {
        console.error("Error updating user:", updateErr);
        return res.status(500).json({
          success: false,
          message: "Error activating account",
        });
      }

      console.log("✅ User verified successfully:", user.email);
      res.json({
        success: true,
        message: "Email verified successfully! You can now login.",
      });
    });
  });
});

app.get("/get_users", (request, response) => {
  const sql =
    "SELECT user_id, fname, lname,id_pic, profile_pic, status, email, password, pnum, address, role FROM user_tbl WHERE role = 'client'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching users:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched users:", data);
    return response.json(data);
  });
});

app.post(
  "/add_workers",
  upload.fields([{ name: "profile_pic" }, { name: "id_pic" }]),
  async (req, res) => {
    const {
      fname,
      lname,
      email,
      password,
      pnum,
      address,
      role = "worker",
    } = req.body;

    // Handle uploaded files
    const profilePic =
      req.files &&
      "profile_pic" in req.files &&
      Array.isArray(req.files["profile_pic"])
        ? req.files["profile_pic"][0].filename
        : null;

    const idPic =
      req.files && "id_pic" in req.files && Array.isArray(req.files["id_pic"])
        ? req.files["id_pic"][0].filename
        : null;

    try {
      // Hash password using SHA-256
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      // Insert user into the database
      const sql =
        "INSERT INTO user_tbl (fname, lname, pnum, profile_pic, id_pic, email, password, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'worker', 'active')";

      db.query(
        sql,
        [fname, lname, pnum, profilePic, idPic, email, hashedPassword, address],
        (error) => {
          if (error) {
            console.error("Error adding worker:", error);
            return res
              .status(500)
              .json({ success: false, error: "Internal Server Error" });
          }
          return res
            .status(200)
            .json({ success: true, message: "Worker successfully added" });
        }
      );
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error hashing password" });
    }
  }
);

app.get("/get_workers", (request, response) => {
  const sql =
    "SELECT fname, lname,id_pic, profile_pic, status, email, password, pnum, address, role FROM user_tbl WHERE role = 'worker'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching workers:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched workers:", data);
    return response.json(data);
  });
});

app.delete("/worker/:id", (req, res) => {
  const workerId = req.params.id;
  const sql = "DELETE FROM user_tbl WHERE user_id = ?";

  db.query(sql, [workerId], (error) => {
    if (error) {
      console.error("Error deleting worker:", error);
      return res.status(500).send("Error deleting worker");
    }
    res.send("Worker deleted successfully");
  });
});

app.put("/worker/:id", (req, res) => {
  const workerId = req.params.id;
  const { fname, lname, email, pnum, address, status } = req.body;

  const sql =
    "UPDATE user_tbl SET fname = ?, lname = ?, email = ?, pnum = ?, address = ?, status = ? WHERE user_id = ?";

  db.query(
    sql,
    [fname, lname, email, pnum, address, status, workerId],
    (error) => {
      if (error) {
        console.error("Error updating worker:", error);
        return res.status(500).send("Error updating worker");
      }
      res.send("Worker updated successfully");
    }
  );
});
//==========================  LOGIN COMPONENTS END ============================
//==========================  ACCOUNT SETTINGS ============================
app.get("/get_user/:id", (req, res) => {
  const userId = req.params.id;
  const sql =
    "SELECT user_id, fname, lname, pnum, email, profile_pic, address FROM user_tbl WHERE user_id = ?";

  db.query(sql, [userId], (error, data) => {
    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Fetched user:", data); // Debugging log

    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(data[0]); // Return the user data
  });
});
app.put("/update_user/:id", upload.single("profile_pic"), (req, res) => {
  const { user_id, fname, lname, pnum, email, address } = req.body;
  const profilePic = req.file ? req.file.filename : req.body.profile_pic; // Preserve the existing profile picture if no new file is uploaded

  const sql =
    "UPDATE user_tbl SET fname = ?, lname = ?, pnum = ?, email = ?, address = ?, profile_pic = ? WHERE user_id = ?";

  db.query(
    sql,
    [fname, lname, pnum, email, address, profilePic, user_id],
    (error, result) => {
      if (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ message: "User updated successfully!" });
    }
  );
});

//==========================  ACCOUNT SETTINGS END ============================

//==========================    SOCKET IO START ============================

//==========================  CHAT ADMIN TO WORKER ============================
// Send message endpoint
// @ts-ignore
// Send message from admin to worker (no receiver logic needed since only admin sends messages)
app.post("/sendMessageToWorkers", (req, res) => {
  const { message, sender_id, recipient_id } = req.body;

  if (!message || !sender_id || !recipient_id) {
    return res
      .status(400)
      .json({ error: "Message, sender_id, and recipient_id are required" });
  }

  const timestamp = new Date();

  // Insert the message with admin as sender and worker as recipient
  db.query(
    "INSERT INTO message_tbl (message, sender_id, receiver_id, timestamp, is_read, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [message, sender_id, recipient_id, timestamp, false],
    (err) => {
      if (err) {
        console.error(
          `Failed to send message to recipient ${recipient_id}:`,
          err.message
        );
        return res.status(500).json({ error: "Failed to send message" });
      }
      res.status(200).json({ message: "Message sent successfully!" });
    }
  );
});

// Get workers endpoint
app.get("/get_workers_info", (request, response) => {
  const sql =
    "SELECT user_id, fname, lname, profile_pic, status FROM user_tbl WHERE role = 'worker'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching workers:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      console.log("No workers found in the database.");
      return response.json([]);
    }

    console.log("Fetched workers:", data);
    return response.json(data);
  });
});
// Get messages for a specific worker (filtered by worker and admin only)
app.get("/getMessagesForAdmin/:adminId/:workerId", (req, res) => {
  const { adminId, workerId } = req.params;

  const sql = `
    SELECT message_tbl.*, 
    CASE WHEN sender_id = ? THEN 'admin' ELSE 'worker' END AS sender
    FROM message_tbl 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp DESC
  `;
  db.query(
    sql,
    [adminId, adminId, workerId, workerId, adminId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results); // Return the results to the frontend
    }
  );
});

//==========================  CHAT ADMIN TO WORKER END ============================
//==========================  CHAT WORKER TO ADMIN AND CLIENT ============================

// Send message endpoint (Worker to Admin or Client)
// @ts-ignore
app.post("/sendMessageToUser", (req, res) => {
  const { message, sender_id, recipient_id } = req.body;

  if (!message || !sender_id || !recipient_id) {
    return res
      .status(400)
      .json({ error: "Message, sender_id, and recipient_id are required" });
  }

  const timestamp = new Date();

  db.query(
    "INSERT INTO message_tbl (message, sender_id, receiver_id, timestamp, is_read, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [message, sender_id, recipient_id, timestamp, false],
    (err, result) => {
      if (err) {
        console.error("Failed to send message:", err.message);
        return res.status(500).json({ error: "Failed to send message" });
      }

      res.status(200).json({
        message: "Message sent successfully!",
        message_id: result.insertId,
      });
    }
  );
});

app.get("/get_worker_profile_pic/:workerId", (req, res) => {
  const { workerId } = req.params;

  db.query(
    "SELECT profile_pic FROM user_tbl WHERE user_id = ?",
    [workerId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        res.json(results[0]); // Return the profile picture of the worker
      } else {
        res.status(404).json({ error: "Worker not found" });
      }
    }
  );
});

// Get admins endpoint
app.get("/get_admin_info", (req, res) => {
  const sql =
    "SELECT user_id, fname, lname, profile_pic, status FROM user_tbl WHERE role = 'admin'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching admins:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      console.log("No admins found in the database.");
      return res.json([]);
    }

    console.log("Fetched admins:", data);
    return res.json(data); // Return admins list
  });
});
// Get messages for a specific worker (filtered by worker and admin only)
app.get("/getMessagesWorker/:workerId/:adminId", (req, res) => {
  const { workerId, adminId } = req.params;

  const sql = `
    SELECT message_tbl.*, 
    CASE WHEN sender_id = ? THEN 'admin' ELSE 'worker' END AS sender
    FROM message_tbl 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp DESC
  `;

  db.query(
    sql,
    [adminId, adminId, workerId, workerId, adminId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results); // Return only the filtered results
    }
  );
});

//==========================  CHAT WORKER TO ADMIN ============================
// @ts-ignore
app.post("/sendMessageToAdmin", (req, res) => {
  const { message, sender_id, recipient_id } = req.body;

  if (!message || !sender_id || !recipient_id) {
    return res
      .status(400)
      .json({ error: "Message, sender_id, and recipient_id are required" });
  }

  const timestamp = new Date();

  // Insert the message into the database
  db.query(
    "INSERT INTO message_tbl (message, sender_id, receiver_id, timestamp, is_read, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [message, sender_id, recipient_id, timestamp, false],
    (err, result) => {
      if (err) {
        console.error("Failed to send message:", err.message);
        return res.status(500).json({ error: "Failed to send message" });
      }

      console.log(`Message sent successfully with ID: ${result.insertId}`);
      res.status(200).json({
        message: "Message sent successfully!",
        message_id: result.insertId,
      });

      // Emit the message to the admin via socket (correct room)
      io.to(`admin_${recipient_id}`).emit("newMessage", {
        message,
        sender_id,
        recipient_id,
        timestamp,
      });

      // Optional: also emit to the worker so they see their message immediately
      io.to(`worker_${sender_id}`).emit("newMessage", {
        message,
        sender_id,
        recipient_id,
        timestamp,
      });
    }
  );
});

//==========================  CHAT WORKER TO ADMIN AND CLIENT END ============================

//==========================  CHAT WORKER TO CLIENTS  ============================
// @ts-ignore
// Send message endpoint
app.post("/sendMessageToClients", (req, res) => {
  const { message, sender_id, recipient_id } = req.body;

  if (!message || !sender_id || !recipient_id) {
    return res
      .status(400)
      .json({ error: "Message, sender_id, and recipient_id are required" });
  }

  const timestamp = new Date();

  db.query(
    "INSERT INTO message_tbl (message, sender_id, receiver_id, timestamp, is_read, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [message, sender_id, recipient_id, timestamp, false],
    (err, result) => {
      if (err) {
        console.error("Failed to send message:", err.message);
        return res.status(500).json({ error: "Failed to send message" });
      }

      console.log(`Message sent successfully with ID: ${result.insertId}`);
      res.status(200).json({
        message: "Message sent successfully!",
        message_id: result.insertId,
      });

      // Emit the message to the client via socket (correct room)
      io.to(`client_${recipient_id}`).emit("newMessage", {
        message,
        sender_id,
        recipient_id,
        timestamp,
      });
    }
  );
});

app.get("/get_clients_profile_pic/:clientsId", (req, res) => {
  const { clientsId } = req.params;

  db.query(
    "SELECT profile_pic FROM user_tbl WHERE user_id = ?",
    [clientsId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        res.json(results[0]); // Return the profile picture of the worker
      } else {
        res.status(404).json({ error: "Clients not found" });
      }
    }
  );
});

// Get clients endpoint
app.get("/get_clients_info", (req, res) => {
  const sql =
    "SELECT user_id, fname, lname, profile_pic, status FROM user_tbl WHERE role = 'client'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      console.log("No clients found in the database.");
      return res.json([]);
    }

    console.log("Fetched clients:", data);
    return res.json(data); // Return clients list
  });
});

//==========================  CHAT WORKER TO CLIENTS END ============================
//==========================  CHAT CLIENT TO WORKER  ============================

// Send message from client to all workers
// @ts-ignore
app.post("/sendMessageToAllWorkers", (req, res) => {
  const { message, sender_id } = req.body;

  if (!message || !sender_id) {
    return res
      .status(400)
      .json({ error: "Message and sender_id are required" });
  }

  const timestamp = new Date();
  const sender_role = "client"; // Always client
  const receiver_role = "worker"; // Always worker

  // Fetch all workers from the database
  db.query(
    "SELECT user_id FROM user_tbl WHERE role = 'worker'",
    (err, workerResult) => {
      if (err) {
        console.error("Failed to fetch workers:", err.message);
        return res.status(500).json({ error: "Failed to fetch workers" });
      }

      if (workerResult.length === 0) {
        return res.status(404).json({ error: "No workers found" });
      }

      // Track the number of messages successfully sent
      let messagesSent = 0;
      const totalWorkers = workerResult.length;

      workerResult.forEach((worker) => {
        const recipient_id = worker.user_id;

        db.query(
          "INSERT INTO message_tbl (message, sender_id, receiver_id, timestamp, is_read, status, role) VALUES (?, ?, ?, ?, ?, 'active', ?)",
          [message, sender_id, recipient_id, timestamp, false, sender_role],
          (err, result) => {
            if (err) {
              console.error("Failed to send message:", err.message);
              return res.status(500).json({ error: "Failed to send message" });
            }

            console.log(`Message sent to worker ID: ${recipient_id}`);

            // Increment messagesSent counter
            messagesSent++;

            // Only send the response once all messages have been processed
            if (messagesSent === totalWorkers) {
              return res.status(200).json({
                message: "Messages sent to all workers successfully!",
              });
            }
          }
        );
      });
    }
  );
});

// Get client-specific messages
app.get("/getClientMessages/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT message_tbl.*, 
    CASE WHEN sender_id = ? THEN 'client' ELSE 'worker' END AS sender
    FROM message_tbl 
    WHERE sender_id = ? OR receiver_id = ?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [user_id, user_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get worker-specific messages
app.get("/getWorkerMessages/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT message_tbl.*, 
    CASE WHEN sender_id = ? THEN 'worker' ELSE 'client' END AS sender
    FROM message_tbl 
    WHERE receiver_id = ?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [user_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Mark messages as read
app.post("/markMessagesAsRead", (req, res) => {
  const { user_id } = req.body;

  const sql = `UPDATE message_tbl SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Error marking messages as read:", err.message);
      return res.status(500).json({ error: "Failed to mark messages as read" });
    }
    res.status(200).json({ message: "Messages marked as read" });
  });
});

//==========================  CHAT CLIENT TO WORKER END ============================

//========================== SOCKET IO  END ============================
//==========================  RESERVATION START  ============================
// API endpoint to handle reservation submission
app.post("/add_reservation/:user_id", (req, res) => {
  const { user_id } = req.params;
  const {
    full_name,
    email,
    pnum,
    reservation_date,
    reservation_time,
    num_of_people,
    special_request,
    table_ids, // ✅ multiple tables go to usertable_list, NOT reservation_tbl
  } = req.body;

  const fetchUserSql = "SELECT * FROM user_tbl WHERE user_id = ?";
  db.query(fetchUserSql, [user_id], (error, results) => {
    if (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    const userFullName = full_name || `${user.fname} ${user.lname}`;
    const userPhone = pnum || user.pnum;

    // Step 1: Insert into reservation_tbl (NO table_id here)
    const insertReservationSql = `
      INSERT INTO reservation_tbl 
      (user_id, email, full_name, reservation_date, reservation_time, pnum, num_of_people, status, payment_status, table_status, special_request, reservation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      email,
      userFullName,
      reservation_date,
      reservation_time,
      userPhone,
      num_of_people,
      "pending",
      "pending",
      "Reserved",
      special_request,
      "Reservation",
    ];

    db.query(insertReservationSql, values, (err, result) => {
      if (err) {
        console.error("Error inserting reservation:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const reserveId = result.insertId; // ✅ reservation_tbl PK

      // Step 2: Insert tables into usertable_list
      if (Array.isArray(table_ids) && table_ids.length > 0) {
        const insertTableSql = `
          INSERT INTO usertable_list (reservation_id, user_id, table_id)
          VALUES ?`;
        const tableValues = table_ids.map((tableId) => [
          reserveId,
          user_id,
          tableId,
        ]);

        db.query(insertTableSql, [tableValues], (err2) => {
          if (err2) {
            console.error("Error inserting user tables:", err2);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.json({
            reserveId,
            message: "Reservation and tables saved",
          });
        });
      } else {
        return res.json({
          reserveId,
          message: "Reservation saved (no tables selected)",
        });
      }
    });
  });
});

// DELETE reservation and related reservation_activity records
app.delete("/delete_reservation/:user_id/:reservation_id", (req, res) => {
  const { user_id, reservation_id } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Delete related reservation_activity_tbl entries for that user and reservation
    const deleteActivitySql = `
      DELETE FROM reservation_activity_tbl 
      WHERE reservation_id = ? AND user_id = ?
    `;
    db.query(deleteActivitySql, [reservation_id, user_id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error deleting reservation activity:", err);
          res
            .status(500)
            .json({ error: "Failed to delete reservation activity" });
        });
      }

      // Delete the reservation itself for that user
      const deleteReservationSql = `
        DELETE FROM reservation_tbl 
        WHERE reservation_id = ? AND user_id = ?
      `;
      db.query(
        deleteReservationSql,
        [reservation_id, user_id],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error deleting reservation:", err);
              res.status(500).json({ error: "Failed to delete reservation" });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Transaction commit failed:", err);
                res.status(500).json({ error: "Transaction commit failed" });
              });
            }

            console.log(
              `Deleted reservation ${reservation_id} for user ${user_id} and related activities`
            );
            res.json({
              message: "Reservation and related activity deleted successfully",
            });
          });
        }
      );
    });
  });
});

app.get("/get_clients", (req, res) => {
  const sql =
    "SELECT user_id, fname, lname, address FROM user_tbl WHERE role = 'client'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data.length === 0) {
      console.log("No clients found in the database.");
      return res.json({ message: "No clients found" }); // Send a message when no clients are found
    }

    console.log("Fetched clients:", data);
    return res.json(data); // Return all client data
  });
});
// API endpoint to get reserved tables
// API to get reserved tables (already defined)
app.get("/get_reserved_tables", (req, res) => {
  const sql = `
    SELECT u.table_id
    FROM usertable_list u
    JOIN reservation_tbl r ON u.reservation_id = r.reservation_id
    WHERE r.table_status = 'Reserved'
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching reserved tables:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Return array of table_ids
    const reservedTables = results.map((row) => row.table_id);
    return res.json(reservedTables);
  });
});

const message = {
  to: "raymondmapayo@gmail.com", // Change to your recipient
  from: "raymondmapayo@gmail.com", // Change to your verified sender
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

const sendEmail = async (message) => {
  try {
    await sgMail.send(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("Response:", error.response.body);
    }
  }
};
// Endpoint to fetch reservations (for example)
app.get("/get_reservation", (req, res) => {
  const sql = `
    SELECT 
      r.reservation_id,
      r.user_id,
      r.email,
      r.full_name,
      r.reservation_time,
      r.reservation_date,
      r.pnum,
      r.num_of_people,
      r.status,
      r.payment_status,
      r.table_status,
      r.special_request,
      GROUP_CONCAT(ut.table_id ORDER BY ut.table_id ASC) AS table_ids
    FROM reservation_tbl r
    LEFT JOIN usertable_list ut 
      ON r.reservation_id = ut.reservation_id
    GROUP BY r.reservation_id
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching reservations:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json(results);
  });
});

// Endpoint to send reservation confirmation email
app.post("/send_reservation_email", (req, res) => {
  const { email, full_name, body } = req.body;
  const subject = "Confirmation of Reservation"; // Fixed subject
  // Create the email message
  const message = {
    to: email, // Recipient's email from the request body
    from: smtpEmail, // Sender's email from environment variable
    subject: subject,
    text: body,
    html: `<strong>${body}</strong>`,
  };

  // Send the email using SendGrid
  sgMail
    .send(message)
    .then(() => {
      console.log("Email sent successfully!");
      return res.json({ message: "Email sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send email" });
    });
});

app.post("/most_reserve", (req, res) => {
  const { table_id, reservation_date } = req.body;

  // Validate required fields
  if (!table_id || !reservation_date) {
    return res
      .status(400)
      .json({ error: "Missing table_id or reservation_date" });
  }

  // Check if there's already a record for this table on the given date
  const checkSql = `SELECT * FROM most_reserve_tbl WHERE table_id = ? AND DATE(date_created) = ?`;

  db.query(checkSql, [table_id, reservation_date], (err, result) => {
    if (err) {
      console.error("Error checking most_reserve_tbl:", err.sqlMessage || err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      // Record exists, increment most_reservation without changing date_created
      const updateSql = `
        UPDATE most_reserve_tbl 
        SET most_reservation = most_reservation + 1
        WHERE table_id = ? AND DATE(date_created) = ?
      `;
      db.query(updateSql, [table_id, reservation_date], (err2) => {
        if (err2) {
          console.error(
            "Error updating most_reserve_tbl:",
            err2.sqlMessage || err2
          );
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "Most Reserved Table Updated Successfully" });
      });
    } else {
      // Record does not exist, insert new row with the given reservation_date
      const insertSql = `
        INSERT INTO most_reserve_tbl (table_id, most_reservation, date_created)
        VALUES (?, ?, ?)
      `;
      db.query(insertSql, [table_id, 1, reservation_date], (err3) => {
        if (err3) {
          console.error(
            "Error inserting into most_reserve_tbl:",
            err3.sqlMessage || err3
          );
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "Most Reserved Table Created Successfully" });
      });
    }
  });
});

//==========================  RESERVATION END  ============================

//==========================  CART TRANSACT   ============================
// @ts-ignore
function finishCartInsert(res, errors) {
  if (errors.length > 0) {
    return res
      .status(500)
      .json({ message: "Some items could not be processed", errors });
  } else {
    return res.status(200).json({ message: "Cart updated successfully" });
  }
}

// @ts-ignore
app.post("/add_to_cart/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const items = req.body.items;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items provided for checkout" });
  }

  let processedItems = 0;
  const errors = [];

  items.forEach((item) => {
    const {
      item_name,
      quantity,
      availability,
      categories_name,
      price,
      menu_img,
      size,
    } = item;

    const itemSize = size || "Normal size";

    // Use item_name + size as unique constraint for duplicate checking
    const checkCartSql = `
      SELECT cart_id FROM cart_tbl 
      WHERE user_id = ? AND item_name = ? AND size = ? AND status = 'active'
    `;

    db.query(
      checkCartSql,
      [user_id, item_name, itemSize],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error("Error checking existing cart:", checkErr);
          errors.push("Check cart error");
          processedItems++;
          if (processedItems === items.length) finishCartInsert(res, errors);
          return;
        }

        if (checkResults.length > 0) {
          const cart_id = checkResults[0].cart_id;

          const updateCartSql = `
          UPDATE cart_tbl 
          SET quantity = ?, updated_at = NOW(), final_total = ? 
          WHERE cart_id = ?
        `;

          db.query(
            updateCartSql,
            [quantity, price * quantity, cart_id],
            (updateErr, updateRes) => {
              if (updateErr) {
                console.error("Error updating cart:", updateErr);
                errors.push("Update cart error");
              } else {
                console.log("Cart item updated:", updateRes);
              }
              processedItems++;
              if (processedItems === items.length)
                finishCartInsert(res, errors);
            }
          );
        } else {
          const insertCartSql = `
          INSERT INTO cart_tbl 
          (user_id, quantity, availability, created_at, updated_at, status, categories_name, menu_img, item_name, price, final_total, size)
          VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?)
        `;

          db.query(
            insertCartSql,
            [
              user_id,
              quantity,
              availability,
              "active",
              categories_name,
              menu_img,
              item_name,
              price,
              price * quantity,
              itemSize,
            ],
            (insertErr, insertRes) => {
              if (insertErr) {
                console.error("Error inserting into cart_tbl:", insertErr);
                errors.push("Insert cart error");
              } else {
                console.log("Item added to cart successfully:", insertRes);
              }
              processedItems++;
              if (processedItems === items.length)
                finishCartInsert(res, errors);
            }
          );
        }
      }
    );
  });
});

// helper
function finishCartInsert(res, errors) {
  if (errors.length > 0) {
    return res
      .status(207)
      .json({ message: "Cart processed with some issues", errors });
  } else {
    return res
      .status(200)
      .json({ message: "All items processed successfully" });
  }
}

// Backend - Node.js (Express)
app.get("/get_cart/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT cart_id AS id, item_name, quantity, price, menu_img, categories_name, size 
    FROM cart_tbl
    WHERE user_id = ? AND status = 'active'
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).json({ error: "Failed to fetch cart" });
    }

    const flattenedItems = results.map((product) => ({
      ...product,
      size: product.size || "Normal size", // Default fallback
    }));

    res.status(200).json(flattenedItems);
  });
});

//==========================  CART TRANSACT END  ============================

//==========================  ORDER TRANSACT   ============================
// Backend endpoint to create an order
// @ts-ignore
app.post("/create_order/:user_id", (req, res) => {
  const userId = req.params.user_id; // Get user_id from the URL
  const orderData = req.body.orderData; // Array of order items
  const paymentMethod = req.body.payment_method || "pending";

  if (!orderData || orderData.length === 0) {
    return res.status(400).json({ error: "No order data provided" });
  }

  console.log("Received order:", { userId, orderData, paymentMethod });

  // Fetch user information (fname, lname, profile_pic) using user_id
  const fetchUserSql = "SELECT * FROM user_tbl WHERE user_id = ?";
  db.query(fetchUserSql, [userId], (userError, userResults) => {
    if (userError) {
      console.error("Error fetching user:", userError);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: userError });
    }

    if (userResults.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResults[0];
    const fname = user.fname;
    const lname = user.lname;
    const profile_pic = user.profile_pic;

    const orderItemsWithCategoriesId = []; // Removed TypeScript annotation

    // Loop through the orderData to fetch categories_id for each item
    const fetchCategoryPromises = orderData.map((item) => {
      return new Promise((resolve, reject) => {
        const fetchCategorySql =
          "SELECT categories_id FROM categories_tbl WHERE LOWER(categories_name) = LOWER(?) LIMIT 1";
        db.query(
          fetchCategorySql,
          [item.categories_name || "Uncategorized"],
          (categoryErr, categoryResults) => {
            if (categoryErr) {
              return reject(categoryErr); // Reject promise on error
            }

            let categoriesId = 0;
            let categoriesName = item.categories_name || "Uncategorized";

            if (categoryResults.length > 0) {
              categoriesId = categoryResults[0].categories_id;
            } else {
              console.warn(
                `Category not found for "${categoriesName}", using default 0`
              );
            }

            // Add item data with categories_id to orderItemsWithCategoriesId
            orderItemsWithCategoriesId.push({
              item_name: item.item_name,
              quantity: item.quantity,
              price: item.price,
              menu_img: item.menu_img,
              final_total: item.final_total,
              categories_name: categoriesName,
              categories_id: categoriesId,
            });

            resolve(true);
          }
        );
      });
    });

    // Wait for all category fetch queries to complete
    Promise.all(fetchCategoryPromises)
      .then(() => {
        const categories = [
          ...new Set(
            orderItemsWithCategoriesId.map((item) => item.categories_name)
          ),
        ].join(", ");
        const categoriesIds = [
          ...new Set(
            orderItemsWithCategoriesId.map((item) => item.categories_id)
          ),
        ].join(",");

        const insertOrderSql = `
          INSERT INTO order_tbl 
            (user_id, order_date, payment_status, order_status, order_type, order_details, fname, lname, profile_pic, categories_name, categories_id)
          VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Insert order data
        db.query(
          insertOrderSql,
          [
            userId,
            paymentMethod === "PayPal" ? "paid" : "pending",
            "processing",
            "Order",
            "Order is being processed",
            fname,
            lname,
            profile_pic,
            categories,
            categoriesIds,
          ],
          (orderErr, orderResult) => {
            if (orderErr) {
              console.error("Error inserting into order_tbl:", orderErr);
              return res
                .status(500)
                .json({ error: "Error placing order", details: orderErr });
            }

            const orderId = orderResult.insertId; // Get the order_id from the insert
            console.log(
              `Order ${orderId} created successfully for user ${userId}`
            );

            // Return the orderId to the frontend
            res
              .status(200)
              .json({ message: "Order placed successfully", orderId });
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: error.message });
      });
  });
});

// @ts-ignore
app.post("/create_order_items/:user_id", (req, res) => {
  const userId = req.params.user_id; // Get user_id from the URL parameter
  const { orderItems } = req.body; // Array of items in the order

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ error: "No order items provided" });
  }

  // Prepare SQL for inserting multiple items
  const insertItemSql = `
    INSERT INTO orderitem_tbl (order_id, item_name, order_quantity, price, menu_img, final_total, menu_id, user_id, size, categories_name, categories_id)
    VALUES ?
  `;

  const values = [];

  // Fetch the menu_id and categories_id for each item using item_name and categories_name
  orderItems.forEach((item, index) => {
    const fetchMenuSql = "SELECT menu_id FROM menu_tbl WHERE item_name = ?";
    db.query(fetchMenuSql, [item.item_name], (menuErr, menuResults) => {
      if (menuErr) {
        return res
          .status(500)
          .json({ error: "Error fetching menu item", details: menuErr });
      }

      if (menuResults.length === 0) {
        return res.status(400).json({ error: "Menu item not found" });
      }

      const menuId = menuResults[0].menu_id;

      // Fetch categories_id based on categories_name
      const fetchCategorySql =
        "SELECT categories_id FROM categories_tbl WHERE categories_name = ?";
      db.query(
        fetchCategorySql,
        [item.categories_name],
        (categoryErr, categoryResults) => {
          if (categoryErr) {
            return res
              .status(500)
              .json({ error: "Error fetching category", details: categoryErr });
          }

          if (categoryResults.length === 0) {
            return res.status(400).json({ error: "Category not found" });
          }

          const categoriesId = categoryResults[0].categories_id;

          // Add the item with the fetched menu_id and categories_id to values array
          values.push([
            item.order_id,
            item.item_name,
            item.quantity,
            item.price,
            item.menu_img,
            item.final_total,
            menuId,
            userId,
            item.size || "Normal size",
            item.categories_name || "Unknown categories",
            categoriesId,
          ]);

          if (values.length === orderItems.length) {
            db.query(insertItemSql, [values], (itemErr, itemResult) => {
              if (itemErr) {
                return res.status(500).json({
                  error: "Error inserting order items",
                  details: itemErr,
                });
              }

              res
                .status(200)
                .json({ message: "Order items added successfully" });
            });
          }
        }
      );
    });
  });
});

app.get("/fetch_transaction/:user_id", (req, res) => {
  const { user_id } = req.params;

  const query = `
    SELECT id, amount, payment_method, status, user_id, reference_code,
           gcash_number, payment_date, payment_time, proof_image
    FROM transaction_tbl
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching transaction:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No transaction found" });
    }

    res.json({ transactions: results }); // IMPORTANT: array of transactions
  });
});

app.post("/update_payment_status/:order_id", async (req, res) => {
  const orderId = req.params.order_id;
  const paymentStatus = req.body.paymentStatus;

  if (!paymentStatus || paymentStatus !== "paid") {
    return res.status(400).json({ error: "Invalid payment status" });
  }

  try {
    // 1️⃣ Update payment_status
    await new Promise((resolve, reject) => {
      const sql = `UPDATE order_tbl SET payment_status = ? WHERE order_id = ?`;
      db.query(sql, [paymentStatus, orderId], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // 2️⃣ Fetch all order items
    const orderItems = await new Promise((resolve, reject) => {
      const sql = `SELECT item_name, order_quantity FROM orderitem_tbl WHERE order_id = ?`;
      db.query(sql, [orderId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const deductions = {}; // { ingredient_name: totalAmount }

    for (const item of orderItems) {
      const item_name = item.item_name;
      const order_quantity = parseFloat(item.order_quantity);

      const ingredients = await new Promise((resolve, reject) => {
        const sql = `SELECT ingredients_name, measurement, unit FROM ingredients_tbl WHERE item_name = ?`;
        db.query(sql, [item_name], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      for (const ing of ingredients) {
        const name = ing.ingredients_name;
        const measurement = parseFloat(ing.measurement);
        const unit = ing.unit;

        const inventoryItem = await new Promise((resolve, reject) => {
          const sql = `SELECT unit FROM inventory_tbl WHERE product_name = ?`;
          db.query(sql, [name], (err, results) => {
            if (err) reject(err);
            else if (results.length === 0)
              reject(new Error("Inventory item not found"));
            else resolve(results[0]);
          });
        });

        const inventoryUnit = inventoryItem.unit;
        const converted =
          convertUnit(measurement, unit, inventoryUnit) * order_quantity;

        deductions[name] = (deductions[name] || 0) + converted;
      }
    }

    for (const [ingredient, totalDeduction] of Object.entries(deductions)) {
      await new Promise((resolve, reject) => {
        const sql = `
          UPDATE inventory_tbl
          SET stock_in = stock_in - ?, stock_out = stock_out + ?
          WHERE product_name = ?
        `;
        db.query(sql, [totalDeduction, totalDeduction, ingredient], (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    }

    res
      .status(200)
      .json({ message: "Payment updated and inventory deducted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

function convertUnit(measurement, fromUnit, toUnit) {
  const unitMap = { g: 0.001, kg: 1, ml: 0.001, liter: 1, l: 1, piece: 1 };
  const fromFactor = unitMap[fromUnit.toLowerCase()] ?? 1;
  const toFactor = unitMap[toUnit.toLowerCase()] ?? 1;
  return measurement * (fromFactor / toFactor);
}

app.post("/remove_from_cart/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const items = req.body.items; // Array of cart items to be removed

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items provided to remove" });
  }

  let completedQueries = 0; // Counter to track when all queries are done
  const totalQueries = items.length;

  // Loop through each item and remove it from the cart_tbl
  items.forEach((item) => {
    const { item_name } = item;

    // Fetch user information for the validation (user_id)
    const fetchUserSql = "SELECT * FROM user_tbl WHERE user_id = ?";
    db.query(fetchUserSql, [user_id], (userError, userResults) => {
      if (userError) {
        console.error("Error fetching user:", userError);
        if (completedQueries === 0) {
          return res.status(500).json({ error: "Error fetching user" });
        }
        return;
      }

      if (userResults.length === 0) {
        // User doesn't exist
        return res.status(400).json({ error: "User not found" });
      }

      // Fetch menu item to validate item_name
      const fetchMenuSql = "SELECT * FROM menu_tbl WHERE item_name = ?";
      db.query(fetchMenuSql, [item_name], (menuError, menuResults) => {
        if (menuError) {
          console.error("Error fetching menu item:", menuError);
          if (completedQueries === 0) {
            return res.status(500).json({ error: "Error fetching menu item" });
          }
          return;
        }

        if (menuResults.length === 0) {
          // Menu item doesn't exist
          return res.status(400).json({ error: "Menu item not found" });
        }

        // Delete item from cart_tbl based on item_name and user_id
        const deleteCartSql =
          "DELETE FROM cart_tbl WHERE user_id = ? AND item_name = ?";
        db.query(deleteCartSql, [user_id, item_name], (error, results) => {
          if (error) {
            console.error("Error deleting item from cart_tbl:", error);
            if (completedQueries === 0) {
              return res
                .status(500)
                .json({ error: "Error removing item from cart" });
            }
            return;
          }

          console.log(`Item ${item_name} removed from cart_tbl.`);
          completedQueries++;
          if (completedQueries === totalQueries) {
            res.status(200).json({
              message: "Items removed from cart_tbl and cart cleared.",
            });
          }
        });
      });
    });
  });
});

// DELETE route to remove item from cart_tbl
// @ts-ignore
app.delete("/remove_from_carts/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const { item_name } = req.body;

  console.log("DELETE req.body:", req.body);
  console.log("DELETE user_id:", user_id);

  if (!item_name) {
    return res.status(400).json({ error: "item_name is required" });
  }

  const deleteSql = `
    DELETE FROM cart_tbl 
    WHERE user_id = ? AND item_name = ? AND status = 'active'
  `;

  db.query(deleteSql, [user_id, item_name], (err, result) => {
    if (err) {
      console.error("DB error deleting cart item:", err);
      return res.status(500).json({ error: "Failed to delete item" });
    }

    if (result.affectedRows === 0) {
      console.warn("No matching cart item found for deletion:", {
        user_id,
        item_name,
      });
      return res.status(404).json({ message: "Item not found in cart" });
    }

    console.log("Item successfully removed from cart:", {
      user_id,
      item_name,
    });

    return res.status(200).json({ message: "Item removed successfully" });
  });
});

// Backend - Fetch orders from order_tbl
// ✅ Corrected Fetch Orders Route
app.get("/fetch_orders", (req, res) => {
  const fetchOrdersSql = `
    SELECT 
      o.order_id,
      o.user_id,
      o.order_date,
      o.payment_status,
      o.order_status,
      o.fname,
      o.lname,
      o.profile_pic,
      u.fname AS worker_fname,
      u.lname AS worker_lname,
      u.profile_pic AS worker_profile_pic
    FROM order_tbl o
    LEFT JOIN user_tbl u ON o.created_by = u.user_id
    ORDER BY o.order_date DESC
  `;

  db.query(fetchOrdersSql, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err });
    }

    res.status(200).json({ orders: results });
  });
});

// Backend - Fetch order items from orderitem_tbl
app.get("/fetch_order_items/:order_id", (req, res) => {
  const orderId = req.params.order_id;

  const fetchOrderItemsSql = `
    SELECT 
      order_item_id,
      order_id,
      menu_id,
      size,
      order_quantity,
      price,
      item_name,
      menu_img,
      final_total
    FROM orderitem_tbl
    WHERE order_id = ?
  `;

  db.query(fetchOrderItemsSql, [orderId], (err, results) => {
    if (err) {
      console.error("Error fetching order items:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err });
    }

    res.status(200).json({ orderItems: results });
  });
});

// @ts-ignore

app.post("/activity_user/:user_id", (req, res) => {
  const userId = Number(req.params.user_id); // convert to INT
  const { order_id, activity_date } = req.body;

  if (!userId || !order_id || !activity_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    SELECT 
      o.order_id,
      o.fname,
      o.lname,
      o.order_type,
      o.order_status,
      GROUP_CONCAT(oi.item_name SEPARATOR ', ') AS item_names
    FROM 
      order_tbl o
    LEFT JOIN orderitem_tbl oi ON oi.order_id = o.order_id
    WHERE 
      o.user_id = ? AND o.order_id = ?
    GROUP BY 
      o.order_id;
  `;

  db.query(query, [userId, order_id], (err, result) => {
    if (err) {
      console.error("Error fetching order data:", err);
      return res
        .status(500)
        .json({ error: "Error fetching order data", details: err });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the provided order_id" });
    }

    const orderData = result[0];

    // Convert JS date to MySQL DATETIME string
    const formattedDate = new Date(activity_date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const activityData = {
      user_id: userId,
      activity_date: formattedDate,
      order_id: orderData.order_id,
      order_type: orderData.order_type,
      item_names: orderData.item_names || "",
      order_status: orderData.order_status,
      fname: orderData.fname || "",
      lname: orderData.lname || "",
    };

    const insertQuery = `
      INSERT INTO activity_tbl (user_id, activity_date, fname, lname, order_type, item_name, order_status, order_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [
        activityData.user_id,
        activityData.activity_date,
        activityData.fname,
        activityData.lname,
        activityData.order_type,
        activityData.item_names,
        activityData.order_status,
        activityData.order_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting activity:", err, activityData);
          return res
            .status(500)
            .json({ error: "Error inserting activity", details: err });
        }

        res.status(200).json({
          message: "Activity added successfully",
          activity_id: result.insertId,
        });
      }
    );
  });
});

// @ts-ignore
app.post("/reservation_activity/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const { reservation_id, activity_date } = req.body;

  if (!userId || !reservation_id || !activity_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Fetch reservation data with all tables for this reservation
  const query = `
    SELECT 
      r.reservation_id,
      r.user_id,
      r.full_name,
      r.reservation_type,
      r.status,
      GROUP_CONCAT(ut.table_id) AS table_ids
    FROM reservation_tbl r
    LEFT JOIN usertable_list ut ON r.reservation_id = ut.reservation_id
    WHERE r.reservation_id = ? AND r.user_id = ?
    GROUP BY r.reservation_id
  `;

  db.query(query, [reservation_id, userId], (err, result) => {
    if (err) {
      console.error("Error fetching reservation data:", err.sqlMessage || err);
      return res.status(500).json({ error: "Error fetching reservation data" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No reservation found for this user" });
    }

    const reservationData = result[0];

    if (!reservationData.table_ids) {
      return res
        .status(400)
        .json({ error: "No tables found for this reservation" });
    }

    const tables = reservationData.table_ids.split(",");

    // Prepare bulk insert values without extra formatting
    const values = tables.map((tableId) => [
      userId,
      activity_date, // just pass it directly
      reservationData.full_name,
      reservationData.reservation_type,
      reservationData.status,
      tableId,
      reservation_id,
    ]);

    const insertQuery = `
      INSERT INTO reservation_activity_tbl 
      (user_id, activity_date, full_name, reservation_type, status, table_id, reservation_id)
      VALUES ?
    `;

    db.query(insertQuery, [values], (err2) => {
      if (err2) {
        console.error(
          "Error inserting reservation activity:",
          err2.sqlMessage || err2
        );
        return res
          .status(500)
          .json({ error: "Error inserting reservation activity" });
      }

      res
        .status(200)
        .json({ message: "Reservation activity added successfully" });
    });
  });
});

// Fetch activity data for a user
app.get("/fetch_activity_user/:user_id", (req, res) => {
  const userId = req.params.user_id; // Get user_id from the URL parameter

  // Query to fetch order-related activity data for the user
  const query = `
    SELECT 
      user_id,
      activity_date,
      fname,
      lname,
      order_type,
      item_name,
      order_status,
      order_id
    FROM 
      activity_tbl
    WHERE 
      user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching activity data:", err); // Log detailed error
      return res.status(500).json({ error: "Error fetching activity data" });
    }

    if (result.length === 0) {
      // Instead of returning an error, return an empty array if no data is found
      return res.status(200).json([]); // Return empty array for no data
    }

    // Send back the fetched activity data
    res.status(200).json(result);
  });
});

// Fetch reservation-related activity data for a user
app.get("/fetch_reservation_activity/:user_id", (req, res) => {
  const userId = req.params.user_id; // Get user_id from the URL parameter

  // Query to fetch reservation-related activity data for the user
  const query = `
    SELECT 
      user_id,
      activity_date,
      full_name,
      reservation_type,
      status,
      table_id,
      reservation_id
    FROM 
      reservation_activity_tbl
    WHERE 
      user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching activity data:", err); // Log detailed error
      return res.status(500).json({ error: "Error fetching activity data" });
    }

    if (result.length === 0) {
      // Instead of returning an error, return an empty array if no data is found
      return res.status(200).json([]); // Return empty array for no data
    }

    // Send back the fetched activity data
    res.status(200).json(result);
  });
});

// Fetch reservation-related activity data for a user
app.get("/fetch_my_purchase/:user_id", (req, res) => {
  const userId = req.params.user_id; // Get user_id from the URL parameter

  // Fetch orders from order_tbl
  const fetchOrdersSql = `
SELECT 
  o.order_id,
  o.order_status,
  o.order_details,
  o.payment_status,
  COALESCE(t.payment_method, 'GCash') AS payment_method,  -- default fallback
  t.status AS transaction_status
FROM order_tbl o
LEFT JOIN transaction_tbl t
  ON t.user_id = o.user_id
ORDER BY o.order_date DESC;


  `;

  db.query(fetchOrdersSql, [userId], (orderErr, orders) => {
    if (orderErr) {
      console.error("Error fetching orders:", orderErr);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: orderErr });
    }

    // Check if no orders found, return an empty array instead of 404
    if (orders.length === 0) {
      return res.status(200).json([]); // Return an empty array if no orders found
    }

    // Fetch order items for each order from orderitem_tbl
    const orderDetails = [];

    orders.forEach((order, index) => {
      const fetchOrderItemsSql = `
        SELECT oi.menu_img, oi.item_name, oi.price, oi.order_quantity, oi.final_total, m.categories_name
        FROM orderitem_tbl oi
        JOIN menu_tbl m ON oi.menu_id = m.menu_id
        WHERE oi.order_id = ?
      `;

      db.query(fetchOrderItemsSql, [order.order_id], (itemErr, items) => {
        if (itemErr) {
          console.error("Error fetching order items:", itemErr);
          return res
            .status(500)
            .json({ error: "Error fetching order items", details: itemErr });
        }

        // Add items to the order
        orderDetails.push({
          ...order,
          products: items.map((item) => ({
            item_name: item.item_name,
            menu_img: item.menu_img,
            price: item.price,
            order_quantity: item.order_quantity,
            final_total: item.final_total,
            categories_name: item.categories_name, // Categories name from menu_tbl
          })),
        });

        // Return data after all orders are processed
        if (orderDetails.length === orders.length) {
          return res.status(200).json(orderDetails);
        }
      });
    });
  });
});

//==========================  ORDER TRANSACT END  ============================
// @ts-ignore
app.post("/bestseller", (req, res) => {
  const { user_id, item_name, menu_img, price, rating, order_quantity } =
    req.body;

  console.log("Received data:", {
    user_id,
    item_name,
    menu_img,
    price,
    rating,
    order_quantity,
  });

  if (
    !item_name ||
    !menu_img ||
    !price ||
    !rating ||
    !user_id ||
    !order_quantity
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Step 1: Get order_item_id + categories_name from orderitem_tbl
  const selectOrderItemQuery = `
    SELECT order_item_id, categories_name
    FROM orderitem_tbl 
    WHERE item_name = ? AND menu_img = ? AND user_id = ?
  `;

  db.query(
    selectOrderItemQuery,
    [item_name, menu_img, user_id],
    (err, result) => {
      if (err) {
        console.error("Error fetching from orderitem_tbl:", err);
        return res.status(500).json({ error: "Failed to fetch order item" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: "Product not found in orderitem_tbl" });
      }

      const { order_item_id, categories_name } = result[0];

      // Step 2: Check if user already rated it
      const checkIfRatedQuery = `
        SELECT * FROM bestseller_tbl 
        WHERE order_item_id = ? AND user_id = ?
      `;

      db.query(checkIfRatedQuery, [order_item_id, user_id], (err, result) => {
        if (err) {
          console.error("Error checking rating:", err);
          return res
            .status(500)
            .json({ error: "Failed to check rating status" });
        }

        if (result.length > 0) {
          // Already rated → Update
          const existingRating = result[0].rating;
          const ratingCount = result[0].rating_count;
          const newTotalRating = existingRating + rating;
          const newRatingCount = ratingCount + 1;
          const avgRating = newTotalRating / newRatingCount;

          const updateQuery = `
            UPDATE bestseller_tbl
            SET rating = ?, rating_count = ?, avg_rating = ?, order_quantity = ?, categories_name = ?
            WHERE order_item_id = ? AND user_id = ?
          `;

          db.query(
            updateQuery,
            [
              newTotalRating,
              newRatingCount,
              avgRating.toFixed(2),
              order_quantity,
              categories_name,
              order_item_id,
              user_id,
            ],
            (err, result) => {
              if (err) {
                console.error("Error updating rating:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to update rating" });
              }

              console.log("Rating updated:", result);
              return res.status(200).json({
                message: "Rating updated successfully",
                avg_rating: avgRating.toFixed(2),
              });
            }
          );
        } else {
          // Not rated yet → Insert
          const insertQuery = `
            INSERT INTO bestseller_tbl 
              (order_item_id, user_id, item_name, menu_img, price, rating, rating_count, avg_rating, rated, order_quantity, categories_name)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, true, ?, ?)
          `;

          const avgRating = rating;

          db.query(
            insertQuery,
            [
              order_item_id,
              user_id,
              item_name,
              menu_img,
              price,
              rating,
              avgRating,
              order_quantity,
              categories_name,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting into bestseller_tbl:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to insert rating" });
              }

              console.log("New product rating inserted:", result);
              return res.status(201).json({
                message: "Rating submitted successfully",
              });
            }
          );
        }
      });
    }
  );
});

//==========================  TOP SELLING   ============================
app.get("/top_selling", (req, res) => {
  const query = `
    SELECT
      topselling_id,
      bestseller_id,
      item_name,
      price,
      total_order_amount,
      total_order_quantity,
      total_avg_rating AS avg_rating,  -- Use total_avg_rating and alias it to avg_rating
      menu_img  -- Add this field to the query
    FROM topselling_tbl
    ORDER BY total_order_quantity DESC
    LIMIT 10;
  `;

  console.log("Executing query:", query); // Log the query being executed

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching top selling data:", err); // Log the error if any
      return res.status(500).send("Error fetching data");
    }
    console.log("Query results:", results); // Log the results returned from the query
    res.json(results); // Send the results as JSON
  });
});

// ✅ API route for top selling products
app.get("/most_top_selling", (req, res) => {
  const query = `
    SELECT 
      item_name,
      menu_img,
      total_order_amount,
      total_order_quantity,
      total_avg_rating
    FROM topselling_tbl
    ORDER BY total_order_amount DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching top selling:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// @ts-ignore
app.post("/topselling", (req, res) => {
  const { item_name, menu_img, price, rating, order_quantity } = req.body;

  // Log the received data
  console.log("Received data:", {
    item_name,
    menu_img,
    price,
    rating,
    order_quantity,
  });

  // Validate request data
  if (
    !item_name ||
    !menu_img ||
    !price ||
    rating === undefined ||
    order_quantity === undefined
  ) {
    return res.status(400).json({
      error:
        "Item name, menu image, price, rating, and order quantity are required",
    });
  }

  // Step 1: Fetch the bestseller_id from bestseller_tbl and total_avg_rating from bestselling_tbl
  const selectBestsellerIdQuery = `
    SELECT bestseller_id FROM bestseller_tbl
    WHERE item_name = ?
  `;

  db.query(selectBestsellerIdQuery, [item_name], (err, result) => {
    if (err) {
      console.error("Error fetching bestseller_id from bestseller_tbl:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch bestseller_id from bestseller_tbl" });
    }

    if (result.length === 0) {
      console.log("Product not found in bestseller_tbl");
      return res
        .status(404)
        .json({ error: "Product not found in bestseller_tbl" });
    }

    const bestseller_id = result[0].bestseller_id;
    console.log("Fetched bestseller_id:", bestseller_id);

    // Step 2: Fetch total_avg_rating from bestselling_tbl
    const selectTotalAvgRatingQuery = `
      SELECT total_avg_rating FROM bestselling_tbl
      WHERE item_name = ?
    `;

    db.query(selectTotalAvgRatingQuery, [item_name], (err, result) => {
      if (err) {
        console.error(
          "Error fetching total_avg_rating from bestselling_tbl:",
          err
        );
        return res.status(500).json({
          error: "Failed to fetch total_avg_rating from bestselling_tbl",
        });
      }

      if (result.length === 0) {
        console.log("Product not found in bestselling_tbl");
        return res
          .status(404)
          .json({ error: "Product not found in bestselling_tbl" });
      }

      const total_avg_rating = result[0].total_avg_rating;
      console.log("Fetched total_avg_rating:", total_avg_rating);

      // Step 3: Fetch the bestselling_id from bestselling_tbl (assuming it's needed as well)
      const selectBestsellingIdQuery = `
        SELECT bestselling_id FROM bestselling_tbl
        WHERE item_name = ?
      `;

      db.query(selectBestsellingIdQuery, [item_name], (err, result) => {
        if (err) {
          console.error(
            "Error fetching bestselling_id from bestselling_tbl:",
            err
          );
          return res.status(500).json({
            error: "Failed to fetch bestselling_id from bestselling_tbl",
          });
        }

        if (result.length === 0) {
          console.log("Product not found in bestselling_tbl");
          return res
            .status(404)
            .json({ error: "Product not found in bestselling_tbl" });
        }

        const bestselling_id = result[0].bestselling_id;
        console.log("Fetched bestselling_id:", bestselling_id);

        // Step 4: Check if the item already exists in topselling_tbl
        const selectTopsellingQuery = `
          SELECT * FROM topselling_tbl
          WHERE item_name = ?
        `;

        db.query(selectTopsellingQuery, [item_name], (err, result) => {
          if (err) {
            console.error("Error fetching product from topselling_tbl:", err);
            return res
              .status(500)
              .json({ error: "Failed to fetch product from topselling_tbl" });
          }

          if (result.length === 0) {
            // First-time rating, insert into topselling_tbl
            console.log(
              "Item does not exist in topselling_tbl. Inserting new entry..."
            );
            return insertIntoTopselling(
              bestseller_id,
              bestselling_id,
              item_name,
              menu_img,
              price,
              order_quantity,
              total_avg_rating,
              res
            );
          } else {
            // Product already exists, update based on quantity
            const existingQuantity = result[0].total_order_quantity;
            const existingTotalAmount = result[0].total_order_amount;

            console.log("Item exists in topselling_tbl. Updating...");
            return updateTopsellingData(
              item_name,
              order_quantity,
              price,
              total_avg_rating,
              existingQuantity,
              existingTotalAmount,
              res
            );
          }
        });
      });
    });
  });
});

// Insert new product into topselling_tbl
function insertIntoTopselling(
  bestseller_id,
  bestselling_id,
  item_name,
  menu_img,
  price,
  order_quantity,
  total_avg_rating,
  res
) {
  const total_order_amount = order_quantity * price;
  console.log("Calculated total_order_amount:", total_order_amount);

  const insertTopsellingQuery = `
    INSERT INTO topselling_tbl
    (bestseller_id, item_name, menu_img, price, total_order_amount, total_order_quantity, total_avg_rating, bestselling_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertTopsellingQuery,
    [
      bestseller_id, // Bestseller ID from bestseller_tbl
      item_name,
      menu_img,
      price,
      total_order_amount,
      order_quantity,
      total_avg_rating,
      bestselling_id, // Insert the bestselling_id into the table
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting into topselling_tbl:", err);
        return res
          .status(500)
          .json({ error: "Failed to insert data into topselling_tbl" });
      }

      console.log("Data inserted successfully into topselling_tbl:", result);
      return res
        .status(201)
        .json({ message: "Data inserted successfully into topselling_tbl" });
    }
  );
}

// Update product data in topselling_tbl based on order quantity
function updateTopsellingData(
  item_name,
  order_quantity,
  price,
  total_avg_rating,
  existingQuantity,
  existingTotalAmount,
  res
) {
  const newTotalQuantity = existingQuantity + order_quantity;
  const newTotalAmount = existingTotalAmount + order_quantity * price;
  console.log("Calculated newTotalQuantity:", newTotalQuantity);
  console.log("Calculated newTotalAmount:", newTotalAmount);

  const updateTopsellingQuery = `
    UPDATE topselling_tbl
    SET 
      total_order_quantity = ?, 
      total_order_amount = ?, 
      total_avg_rating = ?
    WHERE item_name = ?
  `;

  db.query(
    updateTopsellingQuery,
    [
      newTotalQuantity,
      newTotalAmount,
      total_avg_rating, // Use the total_avg_rating from bestselling_tbl
      item_name,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating data in topselling_tbl:", err);
        return res
          .status(500)
          .json({ error: "Failed to update data in topselling_tbl" });
      }

      console.log("Data updated successfully in topselling_tbl:", result);
      return res
        .status(200)
        .json({ message: "Data updated successfully in topselling_tbl" });
    }
  );
}

// Assuming you have an API route that updates the `rated` flag in your database

app.post("/rate_product", (req, res) => {
  const { item_name, rating } = req.body;

  // Update the rated flag to true in the database after rating
  const updateRatedQuery = `UPDATE bestseller_tbl SET rated = true WHERE item_name = ?`;

  db.query(updateRatedQuery, [item_name], (err, result) => {
    if (err) {
      console.error("Error updating rated status:", err);
      return res.status(500).json({ error: "Failed to update rated status" });
    }

    console.log("Rated status updated for product:", item_name);

    // You can continue with any additional logic like updating the ratings
    res.status(200).json({ message: "Rating submitted successfully" });
  });
});

// Assuming you are using MySQL or any other database to store data
app.get("/fetchrated/:user_id", (req, res) => {
  const userId = req.params.user_id; // Retrieve the user_id from the URL parameters

  // Log the user_id for debugging purposes
  console.log("Fetching rated products for user_id:", userId);

  // SQL query to fetch item_name and user_id for rated products and a specific user
  const query = `
    SELECT item_name, user_id
    FROM bestseller_tbl
    WHERE rated = 1 AND user_id = ?;
  `;

  // Execute the query
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching rated products:", err);
      return res.status(500).send("Server Error");
    }

    // Log the result to check if it's correct
    console.log("Rated products for user_id:", userId, result);

    // Send the result back to the client (rated products for this user)
    res.json(result);
  });
});

// @ts-ignore
app.post("/bestselling", (req, res) => {
  const { item_name, price, menu_img } = req.body;

  console.log("Received data:", {
    item_name,
    price,
    menu_img,
  });

  // Validate request data
  if (!item_name || !price || !menu_img) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Step 1: Calculate total_avg_rating and rating_count from bestseller_tbl
  const calculateAvgRatingQuery = `
    SELECT SUM(avg_rating) AS total_rating, COUNT(*) AS total_ratings
    FROM bestseller_tbl
    WHERE item_name = ?
  `;

  db.query(calculateAvgRatingQuery, [item_name], (err, ratingResult) => {
    if (err) {
      console.error("Error calculating avg_rating:", err);
      return res.status(500).json({ error: "Failed to calculate avg_rating" });
    }

    if (ratingResult.length === 0) {
      return res.status(404).json({ error: "No ratings found for item" });
    }

    const totalRating = ratingResult[0].total_rating;
    const totalRatings = ratingResult[0].total_ratings;
    const avgRating = totalRatings > 0 ? totalRating / totalRatings : 0;

    // Step 2: Fetch categories_name from bestseller_tbl
    const fetchCategoryQuery = `
      SELECT categories_name FROM bestseller_tbl
      WHERE item_name = ?
      LIMIT 1
    `;

    db.query(fetchCategoryQuery, [item_name], (err, catResult) => {
      if (err) {
        console.error("Error fetching categories_name:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch categories_name" });
      }

      const categories_name =
        catResult.length > 0 ? catResult[0].categories_name : "Uncategorized";

      // Step 3: Check if item exists in bestselling_tbl
      const checkIfItemExistsQuery = `
        SELECT * FROM bestselling_tbl
        WHERE item_name = ?
      `;

      db.query(checkIfItemExistsQuery, [item_name], (err, existsResult) => {
        if (err) {
          console.error("Error checking existing item:", err);
          return res.status(500).json({ error: "Failed to check item" });
        }

        if (existsResult.length > 0) {
          // Update total_avg_rating and increment rating_count
          const updateQuery = `
            UPDATE bestselling_tbl
            SET total_avg_rating = ?, rating_count = rating_count + 1, categories_name = ?
            WHERE item_name = ?
          `;

          db.query(
            updateQuery,
            [avgRating.toFixed(2), categories_name, item_name],
            (err, updateResult) => {
              if (err) {
                console.error("Error updating bestselling_tbl:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to update bestselling_tbl" });
              }

              console.log("Updated bestselling_tbl:", updateResult);
              return res.status(200).json({
                message: "Updated successfully",
                total_avg_rating: avgRating.toFixed(2),
                categories_name,
              });
            }
          );
        } else {
          // Insert new record
          const insertQuery = `
            INSERT INTO bestselling_tbl (item_name, price, menu_img, total_avg_rating, rating_count, categories_name)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertQuery,
            [
              item_name,
              price,
              menu_img,
              avgRating.toFixed(2),
              1,
              categories_name,
            ],
            (err, insertResult) => {
              if (err) {
                console.error("Error inserting into bestselling_tbl:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to insert into bestselling_tbl" });
              }

              console.log("Inserted into bestselling_tbl:", insertResult);
              return res.status(201).json({
                message: "Inserted successfully",
                total_avg_rating: avgRating.toFixed(2),
                rating_count: 1,
                categories_name,
              });
            }
          );
        }
      });
    });
  });
});

app.get("/bestselling", (req, res) => {
  const selectQuery = `
    SELECT item_name, menu_img, price, total_avg_rating, rating_count, categories_name
    FROM bestselling_tbl
  `;

  db.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching bestselling data:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch bestselling data" });
    }

    // Send the fetched data as a response
    res.status(200).json(result);
  });
});

//==========================  BESTSELLER END  ============================

//==========================  MOST RESERVED  ============================
app.get("/get_reserved", (req, res) => {
  const { start, end } = req.query;

  const query = `
    SELECT table_id, most_reservation, date_created
    FROM most_reserve_tbl
    WHERE DATE(date_created) BETWEEN ? AND ?
    ORDER BY table_id, date_created ASC;
  `;

  db.query(query, [start, end], (err, result) => {
    if (err) {
      console.error("Error fetching reserved tables:", err);
      return res.status(500).json({ error: "Error fetching data" });
    }

    // Format results: group by table_id and by date
    const tableMap = new Map();

    result.forEach((row) => {
      const { table_id, most_reservation, date_created } = row;

      // Use only date part as key (YYYY-MM-DD)
      const dateKey = date_created.toISOString().split("T")[0];

      if (!tableMap.has(table_id)) {
        tableMap.set(table_id, {
          table_id,
          most_reservation,
          details: {},
        });
      }

      const table = tableMap.get(table_id);

      if (!table.details[dateKey]) {
        table.details[dateKey] = 0;
      }

      table.details[dateKey] += most_reservation; // sum reservations for same table/date
    });

    // Convert details object to array
    const formattedResult = Array.from(tableMap.values()).map((table) => ({
      table_id: table.table_id,
      most_reservation: table.most_reservation,
      details: Object.entries(table.details).map(([date, reservations]) => ({
        date,
        reservations,
      })),
    }));

    res.status(200).json({ reservedTables: formattedResult });
  });
});

//==========================  MOST RESERVED END  ============================
//==========================  TOTAL USERS BY TIME  ============================

// Endpoint: total users by date range
app.get("/total_users_bytime", (req, res) => {
  const { start, end } = req.query; // start/end = YYYY-MM-DD

  let sql = `
    SELECT 
      DATE(created_at) AS name,  -- only date, no time
      COUNT(*) AS customers
    FROM user_tbl
    WHERE role = 'client' AND status = 'active'
  `;

  const params = [];
  if (start && end) {
    sql += ` AND DATE(created_at) BETWEEN ? AND ?`;
    params.push(start, end);
  }

  sql += ` GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching total users by time:", err);
      return res.status(500).json({ error: "Failed to fetch data" });
    }
    res.json(results);
  });
});
//==========================  TOTAL USERS BY TIME END  ============================
//========================== CHARTS START  ============================
app.get("/total_products", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM menu_tbl";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("Query successful, results:", results);

    const totalProducts = results[0].total;
    console.log("Total products count:", totalProducts);

    res.json({ totalProducts });
  });
});

// Assuming Express and db is your MySQL connection pool
app.get("/total_categories", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS totalCategories FROM categories_tbl WHERE status = 'active'";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching total categories:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Query successful, results:", results);
    const totalCategories = results[0].totalCategories;
    console.log("Total Categories count:", totalCategories);
    res.json({ totalCategories });
  });
});

app.get("/categories_list", (req, res) => {
  const sql =
    "SELECT categories_id, categories_name, categories_img, status FROM categories_tbl WHERE status = 'active'";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching categories list:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ categories: results });
  });
});

//========================== CHARTS END ============================

//========================== Announcement START ============================
// @ts-ignore
// Emit real-time notification after sending the announcement
app.post("/send_announcement_to_worker", (req, res) => {
  const { title, message, sender_id, recipient_ids } = req.body;

  recipient_ids.forEach((recipient_id) => {
    db.query(
      "INSERT INTO announcement_tbl (title, message, sender_id, recipient_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?)",
      [title, message, sender_id, recipient_id, new Date(), "unread"], // Default status is unread
      (err, result) => {
        if (err) {
          console.error("Error inserting announcement:", err);
          return;
        }

        // Emit event to update the status on frontend
        io.to(`worker_${recipient_id}`).emit("announcement_status", {
          announcement_id: result.insertId,
          title,
          status: "unread", // Assuming the initial status is unread
          workerId: recipient_id,
        });
      }
    );
  });

  res
    .status(200)
    .json({ message: "Announcement sent to recipients successfully." });
});

// Fetch both messages and announcements for a specific worker
app.get("/get_notifications_for_worker/:workerId", (req, res) => {
  const { workerId } = req.params;

  console.log("Worker ID:", workerId); // Log the worker ID to check if it's passed correctly.

  // Query for messages
  const messageQuery = `
     SELECT 
      message_id AS id, 
      message AS description, 
      sender_id, 
      receiver_id, 
      timestamp AS time, 
      'Message' AS type, 
      m.status,  -- Explicitly reference 'status' from message_tbl
      u.profile_pic  
    FROM message_tbl m
    JOIN user_tbl u ON m.sender_id = u.user_id
    WHERE receiver_id = ? 
    ORDER BY timestamp DESC
  `;

  // Query for announcements
  const announcementQuery = `
    SELECT 
      announcement_id AS id, 
      title, 
      message AS description, 
      sender_id, 
      recipient_id, 
      a.created_at AS time,  -- Explicitly reference 'created_at' from announcement_tbl
      'Announcement' AS type, 
      a.status,  -- Explicitly reference 'status' from announcement_tbl
      u.profile_pic  
    FROM announcement_tbl a
    JOIN user_tbl u ON a.sender_id = u.user_id
    WHERE recipient_id = ? 
    ORDER BY a.created_at DESC  -- Explicitly reference 'created_at' from announcement_tbl
  `;

  console.log("Executing queries..."); // Log before executing queries.

  // Execute both queries in parallel
  Promise.all([
    new Promise((resolve, reject) => {
      console.log("Executing message query..."); // Log when executing the message query
      db.query(messageQuery, [workerId], (err, messageResults) => {
        if (err) {
          console.error("Error fetching messages:", err); // Log any errors during message fetch
          return reject(err);
        }
        resolve(messageResults);
      });
    }),
    new Promise((resolve, reject) => {
      console.log("Executing announcement query..."); // Log when executing the announcement query
      db.query(announcementQuery, [workerId], (err, announcementResults) => {
        if (err) {
          console.error("Error fetching announcements:", err); // Log any errors during announcement fetch
          return reject(err);
        }
        resolve(announcementResults);
      });
    }),
  ])
    .then(([messages, announcements]) => {
      console.log("Messages fetched:", messages); // Log fetched messages
      console.log("Announcements fetched:", announcements); // Log fetched announcements

      // Combine both messages and announcements into a single array
      const notifications = [...messages, ...announcements];

      // Log the combined notifications
      console.log("Combined Notifications:", notifications);

      // Sort by time (newest first)
      notifications.sort((a, b) => {
        const dateA = new Date(a.time); // Convert time to Date object
        const dateB = new Date(b.time); // Convert time to Date object

        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error("Invalid date format:", a.time, b.time);
          return 0; // If invalid date, don't change order
        }

        return dateB.getTime() - dateA.getTime(); // Compare timestamps
      });

      // Log sorted notifications
      console.log("Sorted Notifications:", notifications);

      // Send combined notifications as response
      res.json(notifications);
    })
    .catch((err) => {
      console.error("Error fetching notifications:", err); // Log errors if the queries fail
      res.status(500).json({ error: "Failed to fetch notifications" });
    });
});

// Get messages for admin
app.get("/get_notifications_for_admin/:adminId", (req, res) => {
  const { adminId } = req.params;

  console.log("Fetching notifications for Admin ID:", adminId);

  const messageQuery = `
     SELECT 
      message_id AS id, 
      message AS description, 
      sender_id, 
      receiver_id, 
      timestamp AS time, 
      'Message' AS type, 
      is_read,  -- Use is_read field
      u.profile_pic, u.fname, u.lname
    FROM message_tbl m
    JOIN user_tbl u ON m.sender_id = u.user_id
    WHERE receiver_id = ? 
    ORDER BY timestamp DESC
  `;

  db.query(messageQuery, [adminId], (err, messageResults) => {
    if (err) {
      console.error("Error fetching messages from the database:", err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    console.log("Messages fetched successfully:", messageResults);
    res.json(messageResults);
  });
});

// POST mark message as read
app.post("/admin_mark_message_read/:messageId", (req, res) => {
  const { messageId } = req.params;
  const { user_id } = req.body; // string

  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  const sql = `
    UPDATE message_tbl
    SET is_read = ?
    WHERE message_id = ? AND receiver_id = ?
  `;

  db.query(
    sql,
    [Number(user_id), messageId, Number(user_id)],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });

      res.json({
        message: "Message marked as read",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Mark all messages as read
app.post("/mark_all_messages_read", (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  const sql = `
    UPDATE message_tbl
    SET is_read = 1
    WHERE receiver_id = ? AND is_read = 0
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    res.json({
      message: "All messages marked as read",
      affectedRows: result.affectedRows,
    });
  });
});

// ✅ Get menu update notifications for admin (with user details)
app.get("/get_menu_update_notifications/:adminId", (req, res) => {
  const { adminId } = req.params;

  console.log("Fetching menu update notifications for Admin ID:", adminId);

  const sql = `
    SELECT 
      l.id AS log_id,
      l.menu_id,
      l.updatedFields,
      l.updated_at,
      u.fname AS worker_fname,
      u.lname AS worker_lname,
      u.profile_pic AS worker_profile_pic,
      m.item_name,
      m.price
    FROM menu_update_log l
    JOIN user_tbl u ON l.updated_by = u.user_id
    JOIN menu_tbl m ON l.menu_id = m.menu_id
    ORDER BY l.updated_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching menu update notifications:", err);
      return res.status(500).json({ error: "Failed to fetch menu updates" });
    }

    const notifications = results.map((row) => ({
      id: row.log_id,
      menu_id: row.menu_id,
      updatedFields: row.updatedFields ? JSON.parse(row.updatedFields) : {},
      updated_at: row.updated_at,
      workerInfo: {
        fname: row.worker_fname,
        lname: row.worker_lname,
        profile_pic: row.worker_profile_pic,
      },
      currentItem: {
        item_name: row.item_name,
        price: row.price,
      },
    }));

    console.log("Menu updates fetched successfully:", notifications);
    res.json(notifications);
  });
});

app.get("/get_client", (request, response) => {
  const sql =
    "SELECT user_id, fname, lname, profile_pic FROM user_tbl WHERE role = 'worker'";

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching users:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched users:", data);
    return response.json(data);
  });
});

// @ts-ignore
app.get("/get_announcements_for_worker/:user_id", (req, res) => {
  const { user_id } = req.params; // This is the worker's user_id

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Make sure the user is a worker
  const checkRoleSql = "SELECT role FROM user_tbl WHERE user_id = ?";
  db.query(checkRoleSql, [user_id], (roleError, roleData) => {
    if (roleError) {
      console.error("Error checking user role:", roleError);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (roleData.length === 0 || roleData[0].role !== "worker") {
      return res
        .status(403)
        .json({ error: "Access denied. Only workers can view announcements." });
    }

    // Fetch the announcements for the worker
    const sql = `
      SELECT announcement_id, title, message, sender_id, recipient_id, created_at, status
      FROM announcement_tbl
      WHERE recipient_id = ?
      ORDER BY created_at DESC`;

    db.query(sql, [user_id], (error, data) => {
      if (error) {
        console.error("Error fetching announcements:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      console.log("Fetched announcements for worker:", user_id, data);
      return res.json(data); // Send the announcements to the frontend
    });
  });
});
// @ts-ignore
app.post("/update_announcement_status", (req, res) => {
  const { announcement_id, recipient_id } = req.body;

  console.log("Received data:", req.body); // Debugging

  // Validate input data
  if (!announcement_id || !recipient_id) {
    return res.status(400).json({
      error: "announcement_id and recipient_id are required",
    });
  }

  // SQL query to update the status to 'read' for the specific recipient and announcement
  const sql =
    "UPDATE announcement_tbl SET status = 'read' WHERE announcement_id = ? AND recipient_id = ?";

  // Execute query
  db.query(sql, [announcement_id, recipient_id], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Failed to update status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Announcement not found or worker doesn't have access to it",
      });
    }

    console.log("Status updated for announcement ID:", announcement_id);
    return res.status(200).json({
      success: true,
      message: "Announcement status updated",
    });
  });
});
// @ts-ignore
app.post("/update_all_announcements_status", (req, res) => {
  const { worker_id, status } = req.body;

  if (!worker_id || !status) {
    return res.status(400).json({
      error: "worker_id and status are required",
    });
  }

  // SQL query to update the status of all announcements for the specific worker
  const sql =
    "UPDATE announcement_tbl SET status = ? WHERE recipient_id = ? AND status = 'unread'"; // Only update unread announcements

  db.query(sql, [status, worker_id], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Failed to update status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "No unread announcements found for the worker",
      });
    }

    console.log(`Updated status for ${result.affectedRows} announcements`);
    return res.status(200).json({
      success: true,
      message: "All announcements marked as read",
    });
  });
});

// @ts-ignore
app.get("/get_workers_read_and_unread", (req, res) => {
  const query = `
    SELECT
      a.recipient_id,
      a.announcement_id,
      a.title,
      a.status
    FROM announcement_tbl a
    WHERE a.recipient_id IN (
      SELECT user_id FROM user_tbl WHERE role = 'worker'
    )
    ORDER BY a.recipient_id, a.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Group announcements by recipient_id
    const grouped = results.reduce((acc, row) => {
      if (!acc[row.recipient_id]) acc[row.recipient_id] = [];
      acc[row.recipient_id].push({
        announcement_id: row.announcement_id,
        title: row.title,
        status: row.status,
      });
      return acc;
    }, {});

    res.json(grouped);
  });
});
// Get notifications for a specific client
app.get("/notifications/:userId", (req, res) => {
  const { userId } = req.params;

  console.log("Fetching notifications for User ID:", userId);

  const query = `
    SELECT 
      client_notification_id,
      message,
      sender_id,
      recipient_id,
      created_at,
      status
    FROM client_notification_tbl
    WHERE recipient_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    console.log("Notifications fetched successfully:", results);
    res.json(results);
  });
});
// Mark a notification as read
app.post("/notifications/read/:notificationId", (req, res) => {
  const { notificationId } = req.params;

  const updateQuery = `
    UPDATE client_notification_tbl
    SET status = 'read'
    WHERE client_notification_id = ?
  `;

  db.query(updateQuery, [notificationId], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res.status(500).json({ error: "Failed to mark as read" });
    }

    res.json({ success: true });
  });
});

// Create payment link endpoint for GCash
// @ts-ignore
// Create payment link endpoint for GCash
app.post("/create_payment_link", async (req, res) => {
  const { amount, description, remarks, order_quantity, menu_img } = req.body;

  try {
    // Validate the amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (amount < 10000) {
      return res
        .status(400)
        .json({ error: "Amount must be at least PHP 100.00" });
    }

    // Create a payment link via PayMongo API
    const response = await axios.post(
      PAYMONGO_API_URL, // PayMongo API URL
      {
        data: {
          attributes: {
            amount: amount, // In cents
            description: description,
            remarks: remarks,
            order_quantity: order_quantity,
            menu_img: menu_img,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            "sk_test_L88xkD1vbXhDiT8SZUNrgYHz"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the payment link and transaction ID (reference number)
    const checkoutUrl = response?.data?.data?.attributes?.checkout_url;
    const referenceNumber = response?.data?.data?.attributes?.reference_number;

    if (checkoutUrl && referenceNumber) {
      // Send the response back to the frontend
      res.status(200).json({
        checkoutUrl: checkoutUrl,
        referenceNumber: referenceNumber, // Transaction ID
      });
    } else {
      throw new Error("Payment link creation failed.");
    }
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ error: "Error creating payment link" });
  }
});

//========================== Announcement END ============================
//========================== TRANSACTIONS ============================
// Insert transaction into the database
app.post("/paypal_transaction", async (req, res) => {
  const {
    amount,
    description,
    remarks,
    transaction_id,
    checkout_url,
    payment_method,
    user_id, // We get user_id from the request body
  } = req.body;

  try {
    console.log(
      "🟡 Received request to store transaction with transaction_id:",
      transaction_id
    );
    console.log("🟡 user_id received from body:", user_id);

    const queryOrderItems = `
      SELECT menu_img, order_quantity
      FROM orderitem_tbl
      WHERE user_id = ?
    `;

    db.query(queryOrderItems, [user_id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching order items:", err);
        return res.status(500).json({ error: "Error fetching order items" });
      }

      console.log("✅ Fetched order items for user_id:", user_id);
      console.log("📝 Order items found:", results);

      if (results.length > 0) {
        const { menu_img, order_quantity } = results[0];

        console.log("📦 Found order details:", {
          user_id,
          order_quantity,
          menu_img,
        });

        const queryTransaction = `
          INSERT INTO transaction_tbl 
            (amount, description, remarks, transaction_id, checkout_url, payment_method, status, user_id, order_quantity, menu_img)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          amount,
          description,
          remarks,
          transaction_id,
          checkout_url,
          payment_method,
          "completed",
          user_id,
          order_quantity,
          menu_img,
        ];

        db.query(queryTransaction, values, (err, result) => {
          if (err) {
            console.error("❌ Error inserting transaction:", err);
            console.log("⚠️ Failed insert values:", values);
            return res
              .status(500)
              .json({ error: "Error storing transaction", details: err });
          }

          console.log("✅ Transaction inserted successfully:", result);
          res.status(200).json({
            message: "Transaction stored successfully",
            result,
          });
        });
      } else {
        console.error("❗ No order items found for user_id:", user_id);
        return res.status(404).json({ error: "Order items not found" });
      }
    });
  } catch (error) {
    console.error("❌ Unexpected error storing transaction:", error);
    res
      .status(500)
      .json({ error: "Error storing transaction", details: error });
  }
});
app.post("/paypal_payment", async (req, res) => {
  const { user_id, amount_paid, payment_method, payment_status } = req.body;

  // Validate input (removed order_id)
  if (!user_id || !amount_paid || !payment_method || !payment_status) {
    console.log("Missing required fields:", req.body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO payment_tbl (user_id, payment_date, amount_paid, payment_method, payment_status)
      VALUES (?, NOW(), ?, ?, ?)
    `;

    const values = [user_id, amount_paid, payment_method, payment_status];

    // Log query and values to check before executing
    console.log("Query to be executed:", query);
    console.log("Values to be inserted:", values);

    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Error inserting payment:", error);
        return res
          .status(500)
          .json({ error: "Error inserting payment into database" });
      }
      console.log("Payment inserted successfully:", results);
      return res.status(200).json({
        message: "Payment details inserted successfully",
        payment_id: results.insertId,
      });
    });
  } catch (error) {
    console.error("Error inserting payment:", error);
    return res.status(500).json({ error: "Error inserting payment details" });
  }
});

// Backend: server.js (GCash manual transaction)

// route with file upload
app.post("/gcash_transaction", upload.single("proof_image"), (req, res) => {
  try {
    const {
      amount,
      description,
      remarks,
      checkout_url,
      payment_method,
      status,
      created_at,
      user_id,
      order_quantity,
      menu_img,
      reference_code,
      gcash_number,
      payment_date,
      payment_time,
    } = req.body;

    const proof_image = req.file ? req.file.filename : "no-image.png";
    // 👆 fallback if file missing (so it's NEVER null)

    const transaction_id = `GCASH-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const query = `
      INSERT INTO transaction_tbl
        (amount, description, remarks, transaction_id, checkout_url, payment_method, status, created_at, 
         user_id, order_quantity, menu_img, reference_code, gcash_number, payment_date, payment_time, proof_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      amount,
      description,
      remarks,
      transaction_id,
      checkout_url,
      payment_method,
      status,
      created_at,
      user_id,
      order_quantity,
      menu_img,
      reference_code,
      gcash_number,
      payment_date,
      payment_time,
      proof_image, // ✅ always stored in DB
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("❌ Error inserting transaction:", err);
        return res.status(500).json({ error: "Failed to insert transaction." });
      }

      res.json({
        success: true,
        transaction_id,
        proof_image, // return filename
      });
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

app.post("/gcash_payment", async (req, res) => {
  const {
    user_id,
    amount_paid,
    payment_method = "GCash",
    payment_status = "pending",
  } = req.body;

  // Validate input
  if (!user_id || !amount_paid) {
    console.log("Missing required fields:", req.body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO payment_tbl (user_id, payment_date, amount_paid, payment_method, payment_status)
      VALUES (?, NOW(), ?, ?, ?)
    `;

    const values = [user_id, amount_paid, payment_method, payment_status];

    console.log("Query to be executed:", query);
    console.log("Values to be inserted:", values);

    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Error inserting GCash payment:", error);
        return res
          .status(500)
          .json({ error: "Error inserting payment into database" });
      }

      console.log("GCash payment inserted successfully:", results);
      return res.status(200).json({
        message: "GCash payment details inserted successfully",
        payment_id: results.insertId,
      });
    });
  } catch (error) {
    console.error("Error inserting GCash payment:", error);
    return res
      .status(500)
      .json({ error: "Error inserting GCash payment details" });
  }
});

//========================== TRANSACTIONS END ============================

app.post("/insertTestimonial", (req, res) => {
  const { user_id, testimonial_text } = req.body;

  console.log("Received testimonial data:", { user_id, testimonial_text });
  // Fetch profile_pic, fname, and lname from user_tbl
  const getUserDataSql =
    "SELECT profile_pic, fname, lname FROM user_tbl WHERE user_id = ?";

  db.query(getUserDataSql, [user_id], (err, result) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).send("Error fetching user data");
    }

    if (result.length === 0) {
      console.log(`No user found with user_id: ${user_id}`);
      return res.status(404).send("User not found");
    }

    const { profile_pic, fname, lname } = result[0];
    console.log("Fetched user data:", { profile_pic, fname, lname });

    // Now, insert the testimonial into testimonial_tbl
    const insertTestimonialSql = `
      INSERT INTO testimonial_tbl (user_id, profile_pic, fname, lname, testimonial_text, created_at, submitted)
      VALUES (?, ?, ?, ?, ?, NOW(), true)`;

    db.query(
      insertTestimonialSql,
      [user_id, profile_pic, fname, lname, testimonial_text],
      (err, result) => {
        if (err) {
          console.error("Error inserting testimonial:", err);
          return res.status(500).send("Error inserting testimonial");
        }

        console.log("Testimonial inserted successfully:", result);
        res.send("Testimonial inserted successfully");
      }
    );
  });
});

// Endpoint to check if a user has already submitted a testimonial
app.get("/checkTestimonialStatus", (req, res) => {
  const { user_id } = req.query;

  const sql =
    "SELECT submitted, testimonial_text FROM testimonial_tbl WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Error checking testimonial status:", err);
      return res.status(500).send("Error checking testimonial status");
    }

    if (result.length > 0) {
      return res.json({
        isSubmitted: result[0].submitted === 1,
        testimonialText: result[0].testimonial_text,
      });
    } else {
      return res.json({ isSubmitted: false, testimonialText: "" });
    }
  });
});

app.get("/Testimonial", (req, res) => {
  const sql = `
    SELECT 
      t.user_id, 
      u.profile_pic, 
      u.fname, 
      u.lname, 
      t.testimonial_text, 
      t.created_at
    FROM testimonial_tbl t
    JOIN user_tbl u ON t.user_id = u.user_id
  `;

  console.log("Fetching testimonials...");

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching testimonials:", err);
      return res.status(500).send("Error fetching testimonials");
    }

    console.log("Fetched testimonials successfully:", results);

    // Send the testimonials as JSON response
    res.json(results);
  });
});

// Insert new message
app.post("/send_client_notification", (req, res) => {
  const { message, sender_id, recipient_id } = req.body; // single client

  if (!recipient_id) {
    return res.status(400).json({ error: "recipient_id is required" });
  }

  // Insert notification
  const sql = `
    INSERT INTO client_notification_tbl
      (message, sender_id, recipient_id, created_at, status)
    VALUES (?, ?, ?, NOW(), ?)
  `;

  db.query(sql, [message, sender_id, recipient_id, "unread"], (err, result) => {
    if (err) {
      console.error("Error inserting client notification:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }

    // Emit to client via Socket.IO
    io.to(`client_${recipient_id}`).emit("new_client_notification", {
      client_notification_id: result.insertId,
      message,
      sender_id,
      status: "unread",
      recipient_id,
    });

    res.status(200).json({
      success: true,
      message: "Notification sent to client successfully.",
      client_notification_id: result.insertId,
    });
  });
});

// Update order_tbl (only if Paid)

app.put("/update_order_status", (req, res) => {
  const { order_id, payment_status, created_by } = req.body;

  // Step 1: Update payment_status and created_by
  const updateSql = `
    UPDATE order_tbl
    SET payment_status = ?, created_by = ?
    WHERE order_id = ?
  `;
  db.query(updateSql, [payment_status, created_by, order_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    // Step 2: Fetch the updated order including worker info
    const fetchSql = `
      SELECT 
        o.*, 
        u.fname AS worker_fname, 
        u.lname AS worker_lname, 
        u.profile_pic AS worker_profile_pic
      FROM order_tbl o
      LEFT JOIN user_tbl u ON o.created_by = u.user_id
      WHERE o.order_id = ?
    `;
    db.query(fetchSql, [order_id], (err2, results) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({ updatedOrder: results[0] }); // ✅ return order with worker info
    });
  });
});

// Update transaction_tbl (only if Paid → Completed)
app.put("/update_transaction_status", (req, res) => {
  const { user_id, status } = req.body;

  if (status !== "Completed") {
    return res.json({ success: true, message: "No update needed for Pending" });
  }

  const query = `UPDATE transaction_tbl SET status = ? WHERE user_id = ? ORDER BY id DESC LIMIT 1`;

  db.query(query, [status, user_id], (err) => {
    if (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

// Update payment_tbl (only if Paid → Completed)
app.put("/update_payment_status", (req, res) => {
  const { user_id, payment_status } = req.body;

  if (payment_status !== "Completed") {
    return res.json({ success: true, message: "No update needed for Pending" });
  }

  const query = `UPDATE payment_tbl SET payment_status = ? WHERE user_id = ? ORDER BY payment_id DESC LIMIT 1`;

  db.query(query, [payment_status, user_id], (err) => {
    if (err) {
      console.error("Error updating payment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

// server.js

app.get("/get_payments", (req, res) => {
  const sql = `
    SELECT payment_id, user_id, amount_paid, payment_date, payment_method, payment_status
    FROM payment_tbl
    WHERE payment_status = 'Completed'
    ORDER BY payment_date ASC
  `;

  db.query(sql, (error, data) => {
    if (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Fetched payments (Completed only):", data);
    return res.json(data);
  });
});

// Toggle favorite by menu_id using user_id
app.post("/toggle_user_favorites/:menu_id", (req, res) => {
  const { menu_id } = req.params;
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  // Check if the item already exists in user_favourites_tbl
  const checkQuery =
    "SELECT user_favourites_id FROM user_favourites_tbl WHERE user_id = ? AND menu_id = ?";
  db.query(checkQuery, [user_id, menu_id], (err, checkResult) => {
    if (err) return res.status(500).json(err);

    if (checkResult.length > 0) {
      // Item exists → Remove from favourites
      const deleteQuery =
        "DELETE FROM user_favourites_tbl WHERE user_favourites_id = ?";
      db.query(deleteQuery, [checkResult[0].user_favourites_id], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.json({ success: true, action: "removed" });
      });
    } else {
      // Item does not exist → Insert into favourites
      const menuQuery =
        "SELECT item_name, menu_img, description, price, availability, categories_name FROM menu_tbl WHERE menu_id = ?";
      db.query(menuQuery, [menu_id], (err3, menuResult) => {
        if (err3) return res.status(500).json(err3);
        if (menuResult.length === 0)
          return res.status(404).json({ message: "Menu item not found" });

        const {
          item_name,
          menu_img,
          description,
          price,
          availability,
          categories_name,
        } = menuResult[0];

        const insertQuery =
          "INSERT INTO user_favourites_tbl (user_id, menu_id, item_name, menu_img, description, price, availability, categories_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        db.query(
          insertQuery,
          [
            user_id,
            menu_id,
            item_name,
            menu_img,
            description,
            price,
            availability,
            categories_name, // ✅ include categories_name
          ],
          (err4) => {
            if (err4) return res.status(500).json(err4);
            return res.json({ success: true, action: "added" });
          }
        );
      });
    }
  });
});

// Get favorites for a specific user
app.get("/get_user_favorites/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = "SELECT menu_id FROM user_favourites_tbl WHERE user_id = ?";
  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    // Return an array of menu_ids
    const favorites = result.map((row) => row.menu_id);
    res.json(favorites);
  });
});
// Get full favourites for a specific user
app.get("/get_user_favourites_full/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT *, menu_id AS id 
    FROM user_favourites_tbl 
    WHERE user_id = ?
  `;
  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    // Add `id` for ProductInfo compatibility
    const favourites = result.map((row) => ({
      ...row,
      id: row.menu_id,
    }));

    res.json(favourites);
  });
});

app.post("/update_cart_quantity/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { item_name, action } = req.body;

  let sql = "";
  if (action === "increment") {
    sql = `UPDATE cart_tbl SET quantity = quantity + 1 WHERE user_id = ? AND item_name = ?`;
  } else if (action === "decrement") {
    sql = `UPDATE cart_tbl SET quantity = quantity - 1 WHERE user_id = ? AND item_name = ? AND quantity > 0`;
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  db.query(sql, [user_id, item_name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// @ts-ignore
app.get("/", (req, res) => {
  return res.json("Node is Running");
});

server.listen(8081, () => {
  console.log("Server running on https://jgaa-projects.onrender.com");
});

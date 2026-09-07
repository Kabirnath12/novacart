import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-development-secret";

app.use(cors());
app.use(express.json());

const products = [
  {id:"p1",name:"Everyday Walking Shoes",category:"Fashion",price:2499,rating:4.7,description:"Cushioned everyday shoes designed for comfortable walking.",image:"assets/shoes.svg"},
  {id:"p2",name:"Travel Wireless Headphones",category:"Electronics",price:3299,rating:4.6,description:"Comfortable wireless audio with long battery life for travel.",image:"assets/headphones.svg"},
  {id:"p3",name:"Minimal Desk Lamp",category:"Home",price:1599,rating:4.5,description:"A compact warm-light desk lamp for focused workspaces.",image:"assets/lamp.svg"},
  {id:"p4",name:"Everyday Backpack",category:"Fashion",price:1899,rating:4.4,description:"Lightweight backpack with practical storage for daily use.",image:"assets/backpack.svg"},
  {id:"p5",name:"Mechanical Keyboard",category:"Electronics",price:4499,rating:4.8,description:"Tactile mechanical keyboard with a clean compact layout.",image:"assets/keyboard.svg"},
  {id:"p6",name:"Ceramic Coffee Set",category:"Home",price:1299,rating:4.3,description:"Simple ceramic cups for relaxed coffee and tea moments.",image:"assets/cups.svg"},
  {id:"p7",name:"Running Performance Tee",category:"Fashion",price:999,rating:4.2,description:"Breathable performance fabric for running and training.",image:"assets/shirt.svg"},
  {id:"p8",name:"Portable Bluetooth Speaker",category:"Electronics",price:2199,rating:4.6,description:"Compact speaker with clear sound for home and travel.",image:"assets/speaker.svg"}
];

const users = [];
const orders = [];

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({message:"Authentication required."});
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({message:"Invalid or expired token."});
  }
}

function semanticScore(product, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (text.includes(term)) score += 2;
  }

  const synonymGroups = [
    ["comfortable","comfort","cushioned","soft"],
    ["walking","walk","daily","everyday"],
    ["travel","portable","trip"],
    ["audio","headphones","speaker","sound"],
    ["desk","workspace","keyboard","lamp"],
    ["clothes","shirt","tee","fashion"]
  ];

  for (const group of synonymGroups) {
    if (terms.some(t => group.includes(t)) && group.some(word => text.includes(word))) score += 1.5;
  }
  return score;
}

app.get("/api/health", (req, res) => {
  res.json({status:"ok", service:"novacart-api"});
});

app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();

  let result = [...products];
  if (category && category !== "All") {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    result = result
      .map(product => ({...product, relevance: semanticScore(product, q)}))
      .filter(product => product.relevance > 0)
      .sort((a,b) => b.relevance - a.relevance || b.rating - a.rating);
  }

  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => String(p.id) === req.params.id);
  if (!product) return res.status(404).json({message:"Product not found."});
  res.json(product);
});

app.post("/api/auth/register", async (req, res) => {
  const {name, email, password} = req.body;
  if (!name || !email || !password) return res.status(400).json({message:"Name, email and password are required."});
  if (password.length < 6) return res.status(400).json({message:"Password must be at least 6 characters."});
  const normalizedEmail = String(email).toLowerCase().trim();
  if (users.some(user => user.email === normalizedEmail)) {
    return res.status(409).json({message:"An account with this email already exists."});
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {id:`u${Date.now()}`,name:String(name).trim(),email:normalizedEmail,passwordHash};
  users.push(user);

  const token = jwt.sign({id:user.id,email:user.email,name:user.name}, JWT_SECRET, {expiresIn:"7d"});
  res.status(201).json({message:"Account created.",token,user:{id:user.id,name:user.name,email:user.email}});
});

app.post("/api/auth/login", async (req, res) => {
  const {email, password} = req.body;
  const user = users.find(item => item.email === String(email || "").toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({message:"Invalid email or password."});
  }

  const token = jwt.sign({id:user.id,email:user.email,name:user.name}, JWT_SECRET, {expiresIn:"7d"});
  res.json({message:"Signed in.",token,user:{id:user.id,name:user.name,email:user.email}});
});

app.get("/api/me", authRequired, (req, res) => {
  const user = users.find(item => item.id === req.user.id);
  if (!user) return res.status(404).json({message:"User not found."});
  res.json({id:user.id,name:user.name,email:user.email});
});

app.post("/api/orders", authRequired, (req, res) => {
  const {items} = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({message:"Order must contain at least one item."});

  const normalizedItems = [];
  for (const item of items) {
    const product = products.find(p => String(p.id) === String(item.productId));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({message:"Invalid order item."});
    }
    normalizedItems.push({
      productId:product.id,
      name:product.name,
      quantity,
      unitPrice:product.price
    });
  }

  const total = normalizedItems.reduce((sum,item) => sum + item.quantity * item.unitPrice, 0);
  const order = {
    id:`ORD-${Date.now()}`,
    userId:req.user.id,
    items:normalizedItems,
    total,
    status:"placed",
    createdAt:new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json({message:"Order placed.",order});
});

app.get("/api/orders", authRequired, (req, res) => {
  res.json(orders.filter(order => order.userId === req.user.id));
});

app.listen(PORT, () => {
  console.log(`NovaCart API running on http://localhost:${PORT}`);
});

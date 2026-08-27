import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("zinder.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed data if empty
const count = db.prepare("SELECT count(*) as count FROM locations").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO locations (name, type, latitude, longitude, description, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)");
  
  // Some landmarks in Zinder
  insert.run("Grande Mosquée de Zinder", "Religion", 13.8017, 8.9817, "Mosquée historique emblématique.", "Quartier Birni", "");
  insert.run("Palais du Sultan du Damagaram", "Culture", 13.8025, 8.9833, "Résidence historique du Sultan.", "Quartier Birni", "");
  insert.run("Marché Central de Zinder", "Commerce", 13.8050, 8.9880, "Le cœur économique de la ville.", "Centre-ville", "");
  insert.run("Hôpital National de Zinder", "Santé", 13.8100, 8.9900, "Principal centre de santé de la région.", "Quartier Sabon Gari", "+227 20 51 01 01");
  insert.run("Université de Zinder", "Éducation", 13.8200, 8.9700, "Institution d'enseignement supérieur.", "Route de Niamey", "");
  insert.run("Station Total Birni", "Service", 13.8000, 8.9850, "Station-service.", "Quartier Birni", "");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/locations", (req, res) => {
    const locations = db.prepare("SELECT * FROM locations ORDER BY name ASC").all();
    res.json(locations);
  });

  app.post("/api/locations", (req, res) => {
    const { name, type, latitude, longitude, description, address, phone } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO locations (name, type, latitude, longitude, description, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(name, type, latitude, longitude, description, address, phone);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'ajout du lieu" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

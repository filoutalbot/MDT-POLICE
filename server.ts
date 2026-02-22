import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "spvm_secret_key_2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite DB
  const db = new Database("spvm.db");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS ranks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      responsibilities TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      badge_number TEXT UNIQUE NOT NULL,
      rank_id INTEGER,
      role TEXT DEFAULT 'officer',
      status TEXT DEFAULT 'active',
      duty_status TEXT DEFAULT 'Indisponible',
      FOREIGN KEY (rank_id) REFERENCES ranks(id)
    );

    CREATE TABLE IF NOT EXISTS warrants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      officer_id INTEGER NOT NULL,
      status TEXT DEFAULT 'En attente', -- En attente, Approuvé, Refusé, Exécuté
      date TEXT NOT NULL,
      FOREIGN KEY (officer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS penal_code (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article TEXT NOT NULL,
      description TEXT NOT NULL,
      fine_amount INTEGER NOT NULL,
      jail_time INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS arrest_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_name TEXT NOT NULL,
      officer_id INTEGER NOT NULL,
      charges TEXT NOT NULL,
      details TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (officer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS fine_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_name TEXT NOT NULL,
      officer_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (officer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_name TEXT NOT NULL,
      officer_name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'En attente',
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sanctions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      officer_id INTEGER NOT NULL,
      issued_by INTEGER NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (officer_id) REFERENCES users(id),
      FOREIGN KEY (issued_by) REFERENCES users(id)
    );
  `);

  // Seed initial data if empty
  const rankCount = db.prepare("SELECT COUNT(*) as count FROM ranks").get() as { count: number };
  if (rankCount.count === 0) {
    const insertRank = db.prepare("INSERT INTO ranks (name, responsibilities) VALUES (?, ?)");
    insertRank.run("Cadet", "Assistance aux policiers, patrouille à pied, prévention.");
    insertRank.run("Agent", "Patrouille, réponse aux appels, arrestations de base.");
    insertRank.run("Sergent", "Supervision des agents, gestion des scènes de crime.");
    insertRank.run("Lieutenant", "Gestion d'un poste de quartier, supervision des sergents.");
    insertRank.run("Capitaine", "Commandement d'une division, planification stratégique.");
    insertRank.run("Inspecteur", "Enquêtes majeures, affaires internes.");
    insertRank.run("Directeur", "Direction générale du SPVM.");
  }

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    console.log("Initialisation des utilisateurs par défaut...");
    const insertUser = db.prepare("INSERT INTO users (username, password, full_name, badge_number, rank_id, role) VALUES (?, ?, ?, ?, ?, ?)");
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    insertUser.run("admin", hashedPassword, "Directeur Général", "001", 7, "admin");
    const officerPassword = bcrypt.hashSync("officer123", 10);
    insertUser.run("officer", officerPassword, "Jean Tremblay", "1042", 2, "officer");
    console.log("Utilisateurs créés: admin/admin123 et officer/officer123");
  }

  const penalCount = db.prepare("SELECT COUNT(*) as count FROM penal_code").get() as { count: number };
  if (penalCount.count === 0) {
    const insertPenal = db.prepare("INSERT INTO penal_code (article, description, fine_amount, jail_time) VALUES (?, ?, ?, ?)");
    insertPenal.run("Art. 1", "Excès de vitesse", 150, 0);
    insertPenal.run("Art. 2", "Vol qualifié", 5000, 60);
    insertPenal.run("Art. 3", "Agression armée", 10000, 120);
    insertPenal.run("Art. 4", "Possession de stupéfiants", 500, 10);
  }

  // Middleware for auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null || token === 'null') return res.status(401).json({ error: "Token manquant ou invalide" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Session expirée ou invalide" });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    console.log(`Tentative de connexion pour: ${username}`);
    
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
      
      if (!user) {
        console.log(`Utilisateur non trouvé: ${username}`);
        return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      console.log(`Mot de passe correspond pour ${username}: ${isMatch}`);

      if (isMatch) {
        const token = jwt.sign({ 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          full_name: user.full_name, 
          badge_number: user.badge_number 
        }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            username: user.username, 
            full_name: user.full_name, 
            role: user.role, 
            badge_number: user.badge_number 
          } 
        });
      } else {
        res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  });

  app.get("/api/members", authenticateToken, (req, res) => {
    const members = db.prepare(`
      SELECT users.id, users.username, users.full_name, users.badge_number, users.role, users.status, users.rank_id, ranks.name as rank_name 
      FROM users 
      LEFT JOIN ranks ON users.rank_id = ranks.id
      ORDER BY users.id DESC
    `).all();
    res.json(members);
  });

  app.post("/api/members", authenticateToken, (req: any, res) => {
    console.log("POST /api/members", req.body);
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { username, password, full_name, badge_number, rank_id, role } = req.body;
    if (!username || !password || !full_name || !badge_number || !rank_id) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const stmt = db.prepare("INSERT INTO users (username, password, full_name, badge_number, rank_id, role) VALUES (?, ?, ?, ?, ?, ?)");
      const info = stmt.run(username, hashedPassword, full_name, badge_number, rank_id, role);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      console.error("Error creating member:", err);
      res.status(400).json({ error: "Nom d'utilisateur ou matricule déjà utilisé." });
    }
  });

  app.put("/api/members/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { id } = req.params;
    const { full_name, badge_number, rank_id, role, status } = req.body;
    try {
      const stmt = db.prepare("UPDATE users SET full_name = ?, badge_number = ?, rank_id = ?, role = ?, status = ? WHERE id = ?");
      stmt.run(full_name, badge_number, rank_id, role, status, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Erreur lors de la mise à jour." });
    }
  });

  app.delete("/api/members/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return res.status(400).json({ error: "Vous ne pouvez pas vous supprimer vous-même." });
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/penal_code", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { article, description, fine_amount, jail_time } = req.body;
    const stmt = db.prepare("INSERT INTO penal_code (article, description, fine_amount, jail_time) VALUES (?, ?, ?, ?)");
    const info = stmt.run(article, description, fine_amount, jail_time);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/penal_code/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { id } = req.params;
    const { article, description, fine_amount, jail_time } = req.body;
    db.prepare("UPDATE penal_code SET article = ?, description = ?, fine_amount = ?, jail_time = ? WHERE id = ?")
      .run(article, description, fine_amount, jail_time, id);
    res.json({ success: true });
  });

  app.delete("/api/penal_code/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    db.prepare("DELETE FROM penal_code WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/ranks", authenticateToken, (req: any, res) => {
    console.log("POST /api/ranks", req.body);
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { name, responsibilities } = req.body;
    if (!name || !responsibilities) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    const stmt = db.prepare("INSERT INTO ranks (name, responsibilities) VALUES (?, ?)");
    const info = stmt.run(name, responsibilities);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/ranks/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { id } = req.params;
    const { name, responsibilities } = req.body;
    db.prepare("UPDATE ranks SET name = ?, responsibilities = ? WHERE id = ?").run(name, responsibilities, id);
    res.json({ success: true });
  });

  app.delete("/api/ranks/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    db.prepare("DELETE FROM ranks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/ranks", authenticateToken, (req, res) => {
    const ranks = db.prepare("SELECT * FROM ranks").all();
    res.json(ranks);
  });

  app.get("/api/warrants", authenticateToken, (req, res) => {
    const warrants = db.prepare(`
      SELECT warrants.*, users.full_name as officer_name, users.badge_number 
      FROM warrants 
      JOIN users ON warrants.officer_id = users.id
      ORDER BY id DESC
    `).all();
    res.json(warrants);
  });

  app.post("/api/warrants", authenticateToken, (req: any, res) => {
    const { suspect_name, reason } = req.body;
    const date = new Date().toISOString();
    const stmt = db.prepare("INSERT INTO warrants (suspect_name, reason, officer_id, date) VALUES (?, ?, ?, ?)");
    const info = stmt.run(suspect_name, reason, req.user.id, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/warrants/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Accès refusé" });
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE warrants SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.put("/api/users/duty_status", authenticateToken, (req: any, res) => {
    const { duty_status } = req.body;
    db.prepare("UPDATE users SET duty_status = ? WHERE id = ?").run(duty_status, req.user.id);
    res.json({ success: true });
  });

  app.get("/api/penal_code", authenticateToken, (req, res) => {
    const penalCode = db.prepare("SELECT * FROM penal_code").all();
    res.json(penalCode);
  });

  app.get("/api/arrests", authenticateToken, (req, res) => {
    const arrests = db.prepare(`
      SELECT arrest_reports.*, users.full_name as officer_name, users.badge_number 
      FROM arrest_reports 
      JOIN users ON arrest_reports.officer_id = users.id
      ORDER BY id DESC
    `).all();
    res.json(arrests);
  });

  app.post("/api/arrests", authenticateToken, (req: any, res) => {
    const { suspect_name, charges, details } = req.body;
    const date = new Date().toISOString();
    const stmt = db.prepare("INSERT INTO arrest_reports (suspect_name, officer_id, charges, details, date) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(suspect_name, req.user.id, charges, details, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/fines", authenticateToken, (req, res) => {
    const fines = db.prepare(`
      SELECT fine_reports.*, users.full_name as officer_name, users.badge_number 
      FROM fine_reports 
      JOIN users ON fine_reports.officer_id = users.id
      ORDER BY id DESC
    `).all();
    res.json(fines);
  });

  app.post("/api/fines", authenticateToken, (req: any, res) => {
    const { citizen_name, amount, reason } = req.body;
    const date = new Date().toISOString();
    const stmt = db.prepare("INSERT INTO fine_reports (citizen_name, officer_id, amount, reason, date) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(citizen_name, req.user.id, amount, reason, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/complaints", (req, res) => {
    const { citizen_name, officer_name, description } = req.body;
    const date = new Date().toISOString();
    const stmt = db.prepare("INSERT INTO complaints (citizen_name, officer_name, description, date) VALUES (?, ?, ?, ?)");
    const info = stmt.run(citizen_name, officer_name, description, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/complaints", authenticateToken, (req, res) => {
    const complaints = db.prepare("SELECT * FROM complaints ORDER BY id DESC").all();
    res.json(complaints);
  });

  app.get("/api/sanctions", authenticateToken, (req, res) => {
    const sanctions = db.prepare(`
      SELECT sanctions.*, 
             officer.full_name as officer_name, officer.badge_number as officer_badge,
             issuer.full_name as issuer_name, issuer.badge_number as issuer_badge
      FROM sanctions 
      JOIN users as officer ON sanctions.officer_id = officer.id
      JOIN users as issuer ON sanctions.issued_by = issuer.id
      ORDER BY id DESC
    `).all();
    res.json(sanctions);
  });

  app.post("/api/sanctions", authenticateToken, (req: any, res) => {
    const { officer_id, reason } = req.body;
    const date = new Date().toISOString();
    const stmt = db.prepare("INSERT INTO sanctions (officer_id, issued_by, reason, date) VALUES (?, ?, ?, ?)");
    const info = stmt.run(officer_id, req.user.id, reason, date);
    res.json({ id: info.lastInsertRowid });
  });

  // API 404 handler
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route API non trouvée: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // SPA fallback for dev
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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

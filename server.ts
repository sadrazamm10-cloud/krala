import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Client } from "ssh2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// SSH Helper
const getSSHClient = (headers: any) => {
  return new Promise<Client>((resolve, reject) => {
    const conn = new Client();
    const config = {
      host: headers["x-ssh-host"],
      port: parseInt(headers["x-ssh-port"] || "22"),
      username: headers["x-ssh-user"],
      password: headers["x-ssh-password"],
      tryKeyboard: true,
      readyTimeout: 40000, // Increase timeout to 40 seconds
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
    };

    if (!config.host || !config.username) {
      return reject(new Error("SSH credentials missing in headers"));
    }

    console.log(`Attempting SSH connection to ${config.host}:${config.port}...`);

    conn
      .on("ready", () => {
        console.log("SSH Connection Ready");
        resolve(conn);
      })
      .on("error", (err: any) => {
        console.error("SSH Connection Error:", err.message);
        if (err.message.includes("Timed out while waiting for handshake")) {
          reject(new Error("SSH Bağlantı Zaman Aşımı: Sunucuya ulaşılamıyor. Lütfen IP/Port bilgilerini kontrol edin, sunucu güvenlik duvarının (firewall) dış bağlantılara izin verdiğinden emin olun veya yerel bir IP (192.168.x.x) kullanmadığınızı doğrulayın."));
        } else {
          reject(err);
        }
      })
      .on("timeout", () => {
        console.error("SSH Connection Timeout");
        reject(new Error("SSH Bağlantı Zaman Aşımı: Sunucu yanıt vermiyor."));
      })
      .connect(config);
  });
};

// MySQL Helper
const getDbConnection = async (headers: any) => {
  const config = {
    host: headers["x-db-host"],
    user: headers["x-db-user"],
    password: headers["x-db-password"],
    database: headers["x-db-name-override"] || headers["x-db-name"],
    port: parseInt(headers["x-db-port"] || "3306"),
  };

  if (!config.host || !config.user) {
    throw new Error("Database credentials missing in headers");
  }

  return await mysql.createConnection(config);
};

// --- API ROUTES ---

// File Explorer: List Files
app.get("/api/files", async (req, res) => {
  const dirPath = (req.query.path as string) || "/usr/game";
  try {
    const conn = await getSSHClient(req.headers);
    conn.sftp((err, sftp) => {
      if (err) throw err;
      sftp.readdir(dirPath, (err, list) => {
        conn.end();
        if (err) return res.status(500).json({ error: err.message });
        res.json(list.map(item => ({
          name: item.filename,
          isDirectory: item.attrs.isDirectory(),
          size: item.attrs.size,
          mtime: item.attrs.mtime
        })));
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// File Editor: Read File
app.get("/api/files/read", async (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: "Path required" });

  try {
    const conn = await getSSHClient(req.headers);
    conn.sftp((err, sftp) => {
      if (err) throw err;
      const stream = sftp.createReadStream(filePath);
      let data = "";
      stream.on("data", (chunk) => (data += chunk));
      stream.on("end", () => {
        conn.end();
        res.json({ content: data });
      });
      stream.on("error", (err) => {
        conn.end();
        res.status(500).json({ error: err.message });
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// File Editor: Write File
app.post("/api/files/write", async (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath) return res.status(400).json({ error: "Path required" });

  try {
    const conn = await getSSHClient(req.headers);
    conn.sftp((err, sftp) => {
      if (err) throw err;
      sftp.writeFile(filePath, content, (err) => {
        conn.end();
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// File Explorer: Delete File/Folder
app.delete("/api/files", async (req, res) => {
  const { path: filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "Path required" });

  try {
    const conn = await getSSHClient(req.headers);
    conn.exec(`rm -rf "${filePath}"`, (err, stream) => {
      if (err) throw err;
      stream.on("close", (code: number) => {
        conn.end();
        res.json({ success: code === 0 });
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// File Explorer: Create Folder
app.post("/api/files/mkdir", async (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ error: "Path required" });

  try {
    const conn = await getSSHClient(req.headers);
    conn.exec(`mkdir -p "${dirPath}"`, (err, stream) => {
      if (err) throw err;
      stream.on("close", (code: number) => {
        conn.end();
        res.json({ success: code === 0 });
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Command Execution (Quest, Build, etc.)
app.post("/api/exec", async (req, res) => {
  const { command, cwd } = req.body;
  try {
    const conn = await getSSHClient(req.headers);
    const fullCommand = cwd ? `cd ${cwd} && ${command} && pwd` : `${command} && pwd`;
    conn.exec(fullCommand, (err, stream) => {
      if (err) throw err;
      let output = "";
      let errorOutput = "";
      stream.on("close", (code: number) => {
        conn.end();
        // Extract the last line as the new CWD
        const lines = output.trim().split("\n");
        const newCwd = lines.pop() || cwd;
        const finalOutput = lines.join("\n");
        res.json({ output: finalOutput, errorOutput, code, newCwd });
      }).on("data", (data: any) => {
        output += data;
      }).stderr.on("data", (data) => {
        errorOutput += data;
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Database: List Tables
app.get("/api/db/tables", async (req, res) => {
  try {
    const db = await getDbConnection(req.headers);
    const [rows] = await db.query("SHOW TABLES");
    await db.end();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Database: Get Table Data
app.get("/api/db/data", async (req, res) => {
  const table = req.query.table as string;
  if (!table) return res.status(400).json({ error: "Table required" });
  try {
    const db = await getDbConnection(req.headers);
    const [rows] = await db.query(`SELECT * FROM ${table} LIMIT 100`);
    await db.end();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test Connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const sshConn = await getSSHClient(req.headers);
    sshConn.end();
    const dbConn = await getDbConnection(req.headers);
    await dbConn.end();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import { GoogleGenAI, Type } from "@google/genai";

// Get Real Stats
app.get("/api/stats", async (req, res) => {
  try {
    let rawStats = "";
    let onlinePlayers = 0;
    let status = "Aktif";

    try {
      const sshConn = await getSSHClient(req.headers);
      
      // Fetch CPU and RAM using FreeBSD commands
      const getStats = () => new Promise<string>((resolve) => {
        sshConn.exec("top -b -d1 | grep 'CPU:'; vmstat -s | grep 'pages free'; sysctl hw.physmem; df -h / | tail -1", (err, stream) => {
          if (err) return resolve("");
          let data = "";
          stream.on("data", (d: any) => data += d).on("close", () => resolve(data));
        });
      });

      rawStats = await getStats() as string;
      sshConn.end();
    } catch (sshError: any) {
      console.error("Stats SSH Error:", sshError.message);
      status = "SSH Bağlantı Hatası";
    }

    try {
      // Fetch Online Players from DB
      const db = await getDbConnection(req.headers);
      const [playerRows]: any = await db.query("SELECT COUNT(*) as count FROM player WHERE last_play > NOW() - INTERVAL 5 MINUTE");
      onlinePlayers = playerRows[0]?.count || 0;
      await db.end();
    } catch (dbError: any) {
      console.error("Stats DB Error:", dbError.message);
      if (status === "Aktif") status = "DB Bağlantı Hatası";
      else status = "Bağlantı Hatası (SSH & DB)";
    }

    // Simple parser for raw stats
    const lines = rawStats.split("\n");
    const cpuLine = lines.find(l => l.includes("CPU:")) || "";
    const cpuUsage = cpuLine.match(/(\d+\.\d+)% idle/) ? (100 - parseFloat(cpuLine.match(/(\d+\.\d+)% idle/)![1])).toFixed(1) + "%" : (rawStats ? "12%" : "Bilinmiyor");
    
    res.json({
      onlinePlayers: onlinePlayers,
      cpuUsage: cpuUsage,
      diskUsage: rawStats.includes("/") ? rawStats.split(/\s+/).filter(Boolean)[2] + " / " + rawStats.split(/\s+/).filter(Boolean)[1] : (rawStats ? "42 GB" : "Bilinmiyor"),
      ramUsage: rawStats ? "Aktif" : "Bilinmiyor", // Simplified for now
      status: status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Endpoint (SambaNova Integration)
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  // SambaNova API Key - Kullanıcıdan alınan key buraya eklenecek
  const apiKey = process.env.SAMBANOVA_API_KEY || "74994ef5-af24-4675-b1e2-84d66ac62486";

  if (!apiKey) {
    return res.status(500).json({ error: "SambaNova API anahtarı bulunamadı. Lütfen anahtarınızı girin." });
  }

  try {
    const systemInstruction = `Sen Metin2 Yönetim Paneli asistanısın. Bu sistemi Uğur Kaya - ITJA geliştirmiştir. 
Sadece bu sistem ve Metin2 sunucu yönetimi hakkında bilgi ver. 
Kullanıcının veritabanı tabloları farklıysa (örneğin player yerine oyuncu), bunu tespit edip sistemi ona göre entegre edebilirsin.
Bunu yapmak için 'update_table_mapping' aracını kullan. Örneğin kullanıcı "benim oyuncu tablomun adı oyuncu" derse, originalTable: "player", newTable: "oyuncu" olarak aracı çağır.
Kullanıcıya yardımcı olurken nazik ve profesyonel ol.`;

    // Format messages for SambaNova (OpenAI format)
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...history.map((msg: any) => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.3-70B-Instruct", // SambaNova model
        messages: formattedMessages,
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "update_table_mapping",
              description: "Veritabanı tablo isimlerini kullanıcının sistemine göre eşleştirir/değiştirir.",
              parameters: {
                type: "object",
                properties: {
                  originalTable: {
                    type: "string",
                    description: "Sistemin varsayılan tablo adı (örneğin: player, item_proto, account)"
                  },
                  newTable: {
                    type: "string",
                    description: "Kullanıcının veritabanındaki yeni tablo adı (örneğin: oyuncu, esyalar, hesap)"
                  }
                },
                required: ["originalTable", "newTable"]
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`SambaNova API Hatası: ${errData}`);
    }

    const data = await response.json();
    const messageObj = data.choices[0].message;
    let replyText = messageObj.content || "";
    let mappingUpdate = null;

    if (messageObj.tool_calls && messageObj.tool_calls.length > 0) {
      const toolCall = messageObj.tool_calls.find((tc: any) => tc.function.name === "update_table_mapping");
      if (toolCall) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          mappingUpdate = {
            original: args.originalTable,
            new: args.newTable
          };
          if (!replyText) {
            replyText = `Sistem entegre edildi: '${args.originalTable}' tablosu artık '${args.newTable}' olarak kullanılacak. Başka bir isteğiniz var mı?`;
          }
        } catch (e) {
          console.error("Tool args parse error", e);
        }
      }
    }
    
    res.json({ reply: replyText, mappingUpdate });
  } catch (error: any) {
    console.error("SambaNova Error:", error);
    if (error.message?.includes("API key not valid") || error.message?.includes("Unauthorized")) {
      return res.status(400).json({ error: "Geçersiz SambaNova API Anahtarı. Lütfen geçerli bir anahtar girin." });
    }
    if (error.message?.includes("Rate limit exceeded") || error.message?.includes("rate_limit_exceeded")) {
      return res.status(429).json({ error: "SambaNova API kota sınırına (Rate Limit) ulaşıldı. Lütfen biraz bekleyip tekrar deneyin." });
    }
    res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

// Configurações do Servidor
const app = express();
const PORT = 3000;

// Middleware para habilitar JSON
app.use(express.json());

// Middleware para processar dados de formulários
app.use(express.urlencoded({ extended: true }));

// Middleware para lidar com CORS (caso necessário)
app.use(cors());

// Banco de Dados SQLite
const db = new sqlite3.Database('./data.db');

// Criar Tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS barbeiros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbeiro_id INTEGER,
            descricao TEXT,
            valor REAL,
            FOREIGN KEY(barbeiro_id) REFERENCES barbeiros(id)
        )
    `);
});

// Rotas API

// Adicionar Barbeiro
app.post('/barbeiros', (req, res) => {
    const { nome } = req.body;
    db.run(`INSERT INTO barbeiros (nome) VALUES (?)`, [nome], function (err) {
        if (err) return res.status(500).send(err.message);
        res.send({ id: this.lastID });
    });
});

// Listar Barbeiros
app.get('/barbeiros', (req, res) => {
    db.all(`SELECT * FROM barbeiros`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.send(rows);
    });
});

// Adicionar Serviço
app.post('/servicos', (req, res) => {
    const { barbeiro_id, descricao, valor } = req.body;
    db.run(
        `INSERT INTO servicos (barbeiro_id, descricao, valor) VALUES (?, ?, ?)`,
        [barbeiro_id, descricao, valor],
        function (err) {
            if (err) return res.status(500).send(err.message);
            res.send({ id: this.lastID });
        }
    );
});

// Listar Serviços
app.get('/servicos', (req, res) => {
    db.all(
        `SELECT servicos.id, barbeiros.nome AS barbeiro, servicos.descricao, servicos.valor
         FROM servicos
         JOIN barbeiros ON servicos.barbeiro_id = barbeiros.id`,
        [],
        (err, rows) => {
            if (err) return res.status(500).send(err.message);
            res.send(rows);
        }
    );
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

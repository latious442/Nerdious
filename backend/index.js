const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const Book = require('./models/Book');
const AdminCredential = require('./models/AdminCredential');
const AdminSession = require('./models/AdminSession');
const { ALLOWED_TAGS } = require('./constants/tags');
const app = express();
const mongoUrl = process.env.MONGO_URI;
const DEFAULT_ADMIN_NAME = 'mma';
const DEFAULT_ADMIN_PASSWORD = '123';
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const photosDir = path.join(__dirname, 'public', 'photos');
const pdfsDir = path.join(__dirname, 'public', 'pdfs');
fs.mkdirSync(photosDir, { recursive: true });
fs.mkdirSync(pdfsDir, { recursive: true });

const maxImageBytes = 5 * 1024 * 1024;
const maxPdfBytes = 40 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        if (file.fieldname === 'pdf') {
            return cb(null, pdfsDir);
        }
        return cb(null, photosDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || (file.fieldname === 'pdf' ? '.pdf' : '.jpg');
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: maxPdfBytes },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === 'photo') {
            if (file.mimetype.startsWith('image/')) {
                return cb(null, true);
            }
            return cb(new Error('Cover must be an image file'));
        }
        if (file.fieldname === 'pdf') {
            if (file.mimetype === 'application/pdf') {
                return cb(null, true);
            }
            return cb(new Error('Book file must be a PDF'));
        }
        return cb(new Error('Unexpected upload field'));
    },
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
]);

function unlinkUploadedFiles(files) {
    if (!files) return;
    ['photo', 'pdf'].forEach((key) => {
        const entry = files[key]?.[0];
        if (entry?.path) {
            fs.unlink(entry.path, () => {});
        }
    });
}

function hashSessionToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function parseCookies(req) {
    const raw = req.headers?.cookie || '';
    return raw.split(';').reduce((acc, chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return acc;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex < 0) return acc;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = decodeURIComponent(trimmed.slice(eqIndex + 1));
        acc[key] = value;
        return acc;
    }, {});
}

async function getSessionFromRequest(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
        return null;
    }
    const tokenHash = hashSessionToken(token);
    const session = await AdminSession.findOne({ tokenHash });
    if (!session) {
        return null;
    }
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
        await AdminSession.deleteOne({ _id: session._id });
        return null;
    }
    return session;
}

async function ensureDatabaseConnection() {
    if (!mongoUrl) {
        throw new Error('Missing MONGO_URI in .env file');
    }

    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }

    await mongoose.connect(mongoUrl);
}

async function ensureDefaultAdminCredential() {
    const { salt, passwordHash } = AdminCredential.createPasswordRecord(DEFAULT_ADMIN_PASSWORD);
    await AdminCredential.updateOne({
        username: DEFAULT_ADMIN_NAME,
    }, {
        $setOnInsert: {
            username: DEFAULT_ADMIN_NAME,
            salt,
            passwordHash,
        },
    }, {
        upsert: true,
    });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/photos', express.static(photosDir));
app.use('/pdfs', express.static(pdfsDir));

mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
});

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/',async(req,res)=>{
    try {
        await ensureDatabaseConnection();
        const book = await Book.find().sort({ createdAt: -1 });
        return res.render('index', { book });
    } catch (err) {
        console.error('Failed to fetch books:', err.message);
        res.status(500).send('Failed to load data');
    }
});

app.get('/api/books', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const raw = String(req.query.tag || 'all').toLowerCase();
        const filter = raw !== 'all' && ALLOWED_TAGS.includes(raw) ? { tag: raw } : {};

        const books = await Book.find(filter).sort({ createdAt: 1 });
        return res.json(books);
    } catch (err) {
        console.error('Failed to fetch books API:', err.message);
        return res.status(500).json({ message: 'Failed to fetch books' });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.json(book);
    } catch (err) {
        console.error('Failed to fetch single book API:', err.message);
        return res.status(500).json({ message: 'Failed to fetch book' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const username = String(req.body?.username || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        let credential = await AdminCredential.findOne({ username });
        if (!credential && username === DEFAULT_ADMIN_NAME && password === DEFAULT_ADMIN_PASSWORD) {
            const { salt, passwordHash } = AdminCredential.createPasswordRecord(DEFAULT_ADMIN_PASSWORD);
            credential = await AdminCredential.create({
                username: DEFAULT_ADMIN_NAME,
                salt,
                passwordHash,
            });
        }

        if (!credential || !credential.verifyPassword(password)) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashSessionToken(token);
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

        await AdminSession.create({
            username,
            tokenHash,
            expiresAt,
        });

        res.cookie(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: SESSION_TTL_MS,
        });

        return res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Failed to login:', err.message);
        return res.status(500).json({ message: 'Failed to login' });
    }
});

app.post('/api/auth/change-password', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const session = await getSessionFromRequest(req);
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const username = String(session.username || '').trim().toLowerCase();
        const oldPassword = String(req.body?.oldPassword || '');
        const newPassword = String(req.body?.newPassword || '');

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }
        if (newPassword.length < 3) {
            return res.status(400).json({ message: 'New password must be at least 3 characters' });
        }

        const credential = await AdminCredential.findOne({ username });
        if (!credential || !credential.verifyPassword(oldPassword)) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        const { salt, passwordHash } = AdminCredential.createPasswordRecord(newPassword);
        credential.salt = salt;
        credential.passwordHash = passwordHash;
        await credential.save();

        return res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Failed to change password:', err.message);
        return res.status(500).json({ message: 'Failed to change password' });
    }
});

app.get('/api/auth/session', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const session = await getSessionFromRequest(req);
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.json({ username: session.username });
    } catch (err) {
        console.error('Failed to check session:', err.message);
        return res.status(500).json({ message: 'Failed to check session' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const cookies = parseCookies(req);
        const token = cookies[SESSION_COOKIE_NAME];
        if (token) {
            await AdminSession.deleteOne({ tokenHash: hashSessionToken(token) });
        }
        res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: false });
        return res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('Failed to logout:', err.message);
        return res.status(500).json({ message: 'Failed to logout' });
    }
});

app.post('/books', upload, async (req, res) => {
    const files = req.files;
    const photoFile = files?.photo?.[0];
    const pdfFile = files?.pdf?.[0];

    if (photoFile && photoFile.size > maxImageBytes) {
        unlinkUploadedFiles(files);
        return res.status(400).json({ message: 'Cover image must be 5MB or smaller' });
    }

    try {
        await ensureDatabaseConnection();

        const { title, author, description, tag } = req.body;
        const tagNormalized = String(tag || '').toLowerCase().trim();
        if (!ALLOWED_TAGS.includes(tagNormalized)) {
            unlinkUploadedFiles(files);
            return res.status(400).json({ message: 'Choose a valid book tag' });
        }

        const result = await Book.create({
            title,
            author,
            description,
            tag: tagNormalized,
            photo: photoFile ? photoFile.filename : '',
            pdf: pdfFile ? pdfFile.filename : '',
        });

        return res.status(201).json(result);
    } catch (err) {
        unlinkUploadedFiles(files);
        console.error('Failed to save book:', err.message);
        return res.status(500).json({ message: `Failed to save book: ${err.message}` });
    }
});

app.get('/download/pdf/:filename', async (req, res) => {
    try {
        const safe = path.basename(req.params.filename);
        const base = path.resolve(pdfsDir);
        const filePath = path.resolve(base, safe);
        if (!filePath.startsWith(`${base}${path.sep}`)) {
            return res.status(400).json({ message: 'Invalid file' });
        }
        await fs.promises.access(filePath);
        return res.download(filePath, safe);
    } catch {
        return res.status(404).json({ message: 'PDF not found' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        await ensureDatabaseConnection();
        const deleted = await Book.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (deleted.photo) {
            fs.unlink(path.join(photosDir, deleted.photo), () => {});
        }
        if (deleted.pdf) {
            fs.unlink(path.join(pdfsDir, deleted.pdf), () => {});
        }

        return res.status(200).json({ message: 'Book deleted', id: req.params.id });
    } catch (err) {
        console.error('Failed to delete book:', err.message);
        return res.status(500).json({ message: 'Failed to delete book' });
    }
});

app.use((err, req, res, next) => {
    if (
        err?.message === 'Cover must be an image file'
        || err?.message === 'Book file must be a PDF'
        || err?.message === 'Unexpected upload field'
    ) {
        return res.status(400).json({ message: err.message });
    }
    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Uploaded file is too large' });
    }
    if (req.path === '/books' || (req.path && req.path.startsWith('/api'))) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
    return next(err);
});

app.use((req,res)=>{
    res.status(404).render('mono');
});
async function startServer() {
    try {
        await ensureDatabaseConnection();
        await ensureDefaultAdminCredential();
        console.log('Connected to MongoDB');

        app.listen(3001, () => {
            console.log('Server running on http://localhost:3001');        });
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
    }
}

startServer();

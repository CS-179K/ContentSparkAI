require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const expressSanitizer = require('express-sanitizer');
const hpp = require('hpp');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 5005;

app.disable('x-powered-by');

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(expressSanitizer());
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(hpp());

// CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        "https://accounts.google.com/gsi/client",
        "https://apis.google.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https://accounts.google.com"],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.googleapis.com",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["https://accounts.google.com"],
      childSrc: ["'none'"],
      formAction: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
  })
);

// HSTS (HTTP Strict Transport Security)
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use('/api/', apiLimiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Error connecting to MongoDB:', err));

// Define schemas and models
const filterSchema = new mongoose.Schema({
  contentType: String,
  industry: String,
  ageRange: String,
  interests: [String],
  gender: String,
  incomeLevel: String,
  tone: String,
  themes: [String],
  contentGoal: String,
  maxContentLength: String,
  language: String,
  isFavourite: { type: Boolean, default: false }
});

const Filter = mongoose.model("Filter", filterSchema);

const contentSchema = new mongoose.Schema({
  filters: {
    contentType: String,
    industry: String,
    ageRange: String,
    interests: [String],
    gender: String,
    incomeLevel: String,
    tone: String,
    themes: [String],
    contentGoal: String,
    maxContentLength: String,
    language: String,
  },
  prompt: String,
  response: String,
});

const GeneratedContent = mongoose.model("GeneratedContent", contentSchema);

// Define validation and sanitization rules for saveFilter endpoint
const filterValidationRules = [
  body('contentType').trim().escape(),
  body('industry').trim().escape(),
  body('ageRange').trim().escape(),
  body('interests').optional().isArray().customSanitizer(value => Array.isArray(value) ? value.map(item => item.trim().escape()) : []),
  body('gender').trim().escape(),
  body('incomeLevel').trim().escape(),
  body('tone').trim().escape(),
  body('themes').optional().isArray().customSanitizer(value => Array.isArray(value) ? value.map(item => item.trim().escape()) : []),
  body('contentGoal').trim().escape(),
  body('maxContentLength').trim().escape(),
  body('language').trim().escape()
];

// Endpoint to save filter data to the database with validation and sanitization
app.post("/api/saveFilter", filterValidationRules, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filterData = new Filter(req.body);
    await filterData.save();
    res.status(201).send({ message: "Filter saved successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Failed to save filter data" });
  }
});

// Define validation and sanitization rules for save-content endpoint
const contentValidationRules = [
  body('filters.contentType').trim().escape(),
  body('filters.industry').trim().escape(),
  body('filters.ageRange').trim().escape(),
  body('filters.interests').optional().isArray().customSanitizer(value => Array.isArray(value) ? value.map(item => item.trim().escape()) : []),
  body('filters.gender').trim().escape(),
  body('filters.incomeLevel').trim().escape(),
  body('filters.tone').trim().escape(),
  body('filters.themes').optional().isArray().customSanitizer(value => Array.isArray(value) ? value.map(item => item.trim().escape()) : []),
  body('filters.contentGoal').trim().escape(),
  body('filters.maxContentLength').trim().escape(),
  body('filters.language').trim().escape(),
  body('prompt').trim().escape(),
  body('response').trim().escape()
];

// Endpoint to save generated content to the database with validation and sanitization
app.post("/api/save-content", contentValidationRules, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { filters, prompt, response } = req.body;

    // Create a new document using the GeneratedContent model
    const newContent = new GeneratedContent({
      filters,
      prompt,
      response,
    });

    // Save the document to the database
    await newContent.save();

    res.status(201).send({ message: "Content saved successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Failed to save content" });
  }
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
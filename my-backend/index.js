require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const expressSanitizer = require("express-sanitizer");
const hpp = require("hpp");
const { body, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 5005;

app.disable("x-powered-by");

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressSanitizer());
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
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
app.use("/api/", apiLimiter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Enable Mongoose debugging (optional)
// mongoose.set('debug', true);

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true }, // Unique Google ID to identify the user
  email: String,
  name: String,
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the user was created
  lastLogin: { type: Date, default: Date.now }, // Last login timestamp
});

const User = mongoose.model("User", userSchema);

// Define Content Schema and Model
const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user
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
  title: String,
  isFavourite: { type: Boolean, default: false },
});

const GeneratedContent = mongoose.model("GeneratedContent", contentSchema);
// Define Filter Schema and Model
const filterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user
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
});

const Filter = mongoose.model("Filter", filterSchema);

// Middleware to authenticate token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Access token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Now we use the MongoDB ObjectId stored in the token
    console.log("User ID from token:", req.userId); // Logging the user ID
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid access token" });
  }
};

// Login Route
app.post("/api/login", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.decode(token);
    const { sub: googleId, email, name } = decoded;

    // Find or create the user in the database
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name });
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

app.post("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token Not Found" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(401).json({ message: "Invalid Refresh Token" });
  }
});

app.get("/api/check", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-googleId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ isAuthenticated: true, user });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Validation rules for saving filter and content data
const filterValidationRules = [
  body("contentType").trim().escape(),
  body("industry").trim().escape(),
  body("ageRange").trim().escape(),
  body("interests")
    .optional()
    .isArray()
    .customSanitizer((value) =>
      Array.isArray(value)
        ? value.map((item) => (typeof item === "string" ? item.trim() : item))
        : []
    ),
  body("gender").trim().escape(),
  body("incomeLevel").trim().escape(),
  body("tone").trim().escape(),
  body("themes")
    .optional()
    .isArray()
    .customSanitizer((value) =>
      Array.isArray(value)
        ? value.map((item) => (typeof item === "string" ? item.trim() : item))
        : []
    ),
  body("contentGoal").trim().escape(),
  body("maxContentLength").trim().escape(),
  body("language").trim().escape(),
];

const contentValidationRules = [
  body("filters.contentType").trim().escape(),
  body("filters.industry").trim().escape(),
  body("filters.ageRange").trim().escape(),
  body("filters.interests")
    .optional()
    .isArray()
    .customSanitizer((value) =>
      Array.isArray(value)
        ? value.map((item) => (typeof item === "string" ? item.trim() : item))
        : []
    ),
  body("filters.gender").trim().escape(),
  body("filters.incomeLevel").trim().escape(),
  body("filters.tone").trim().escape(),
  body("filters.themes")
    .optional()
    .isArray()
    .customSanitizer((value) =>
      Array.isArray(value)
        ? value.map((item) => (typeof item === "string" ? item.trim() : item))
        : []
    ),
  body("filters.contentGoal").trim().escape(),
  body("filters.maxContentLength").trim().escape(),
  body("filters.language").trim().escape(),
  body("prompt").trim().escape(),
  body("response").trim().escape(),
];

// Save filters endpoint
app.post(
  "/api/save-filter",
  authenticate,
  filterValidationRules,
  async (req, res) => {
    console.log("Received filter data:", JSON.stringify(req.body, null, 2));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const filterData = new Filter({ ...req.body, userId: req.userId });
      console.log(
        "Filter data after validation:",
        JSON.stringify(filterData, null, 2)
      );
      await filterData.save();
      res.status(201).send({ message: "Filter saved successfully!" });
    } catch (error) {
      console.error("Error saving filter:", error);
      res.status(500).send({ error: "Failed to save filter data" });
    }
  }
);

// Save generated content endpoint
app.post(
  "/api/save-content",
  authenticate,
  contentValidationRules,
  async (req, res) => {
    console.log("Received content data:", JSON.stringify(req.body, null, 2));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { filters, prompt, response, title } = req.body;

      // Create a new document using the GeneratedContent model
      const newContent = new GeneratedContent({
        userId: req.userId, // This is now the MongoDB ObjectId
        filters,
        prompt,
        response,
        title,
      });
      console.log(
        "Content data after validation:",
        JSON.stringify(newContent, null, 2)
      );
      // Save the document to the database
      await newContent.save();

      res.status(201).send(newContent); // Return the newly created content
    } catch (error) {
      console.error("Error saving content:", error);
      res.status(500).send({ error: "Failed to save content" });
    }
  }
);

// Fetch user history endpoint
app.get("/api/get-history", authenticate, async (req, res) => {
  try {
    const history = await GeneratedContent.find({ userId: req.userId });
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error); // Log the error for debugging
    res.status(500).send({ error: "Failed to fetch history" });
  }
});

// Fetch user favorites endpoint
app.get("/api/get-favorites", authenticate, async (req, res) => {
  try {
    const favorites = await GeneratedContent.find({
      userId: req.userId,
      isFavourite: true,
    });
    const filters = await Filter.find({ userId: req.userId });
    res.status(200).json({ favorites, filters });
  } catch (error) {
    console.error("Error fetching favorites:", error); // Log the error for debugging
    res.status(500).send({ error: "Failed to fetch favorites" });
  }
});

// Mark/unmark content as favorite endpoint
app.post("/api/set-favorite", authenticate, async (req, res) => {
  const { contentId } = req.body;
  try {
    const content = await GeneratedContent.findOne({
      _id: contentId,
      userId: req.userId,
    });
    if (!content) {
      return res.status(404).json({
        message: "Content not found or you don't have permission to modify it.",
      });
    }
    content.isFavourite = !content.isFavourite;
    await content.save();
    res.status(200).json({
      message: content.isFavourite
        ? "Content added to favorites"
        : "Content removed from favorites",
      isFavourite: content.isFavourite,
    });
  } catch (error) {
    console.error("Error updating favorite status:", error);
    res.status(500).send({ error: "Failed to update favorite status" });
  }
});

app.post("/api/set-favorite", authenticate, async (req, res) => {
  const { contentId } = req.body;
  try {
    let content;
    if (!contentId) {
      content = await GeneratedContent.findOne({ userId: req.userId }).sort({
        createdAt: -1,
      });
    } else {
      content = await GeneratedContent.findOne({
        _id: contentId,
        userId: req.userId,
      });
    }

    if (!content) {
      return res.status(404).json({
        message: "Content not found or you don't have permission to modify it.",
      });
    }

    content.isFavourite = true;
    await content.save();

    res.status(200).json({ message: "Content saved as favorite", content });
  } catch (error) {
    console.error("Error saving content as favorite:", error);
    res.status(500).send({ error: "Failed to save content as favorite" });
  }
});

app.delete("/api/delete-content/:id", async (req, res) => {
  try {
    const contentId = req.params.id;
    console.log("Attempting to delete content with ID:", contentId); // Add this log
    const existingContent = await GeneratedContent.findById({
      _id: contentId,
      userId: req.userId,
    });
    if (!existingContent) {
      console.log("Content not found in database"); // Add this log
      return res.status(404).json({ error: "Content not found" });
    }

    const deletedContent = await GeneratedContent.findByIdAndDelete(contentId);

    if (deletedContent) {
      console.log("Content deleted successfully:", deletedContent); // Add this log
      res.status(200).json({ message: "Content deleted successfully" });
    } else {
      console.log("Failed to delete content"); // Add this log
      res.status(500).json({ error: "Failed to delete content" });
    }
  } catch (error) {
    console.error("Error deleting content:", error);
    res
      .status(500)
      .json({ error: "Failed to delete content", details: error.message });
  }
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

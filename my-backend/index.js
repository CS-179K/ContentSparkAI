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
const snoowrap = require("snoowrap");
const axios = require("axios");
const cron = require("node-cron");

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
        "https://www.reddit.com",
        "https://oauth.reddit.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://www.reddit.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://accounts.google.com",
        "https://www.reddit.com",
        "https://oauth.reddit.com",
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.googleapis.com",
        "https://www.reddit.com",
        "https://oauth.reddit.com",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["https://accounts.google.com", "https://www.reddit.com"],
      childSrc: ["'none'"],
      formAction: [
        "'self'",
        "https://accounts.google.com",
        "https://www.reddit.com",
      ],
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
  redditRefreshToken: String,
});

const User = mongoose.model("User", userSchema);

// Define Content Schema and Model
const contentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
    redditMetrics: {
      postId: String,
      upvotes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      lastUpdated: Date,
    },
    UpdatedAtReddit: Date, // New field to track when content was last updated on Reddit
  },
  { timestamps: true }
);


const GeneratedContent = mongoose.model("GeneratedContent", contentSchema);
// Define Filter Schema and Model
const filterSchema = new mongoose.Schema(
  {
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
    title: String,
  },
  { timestamps: true }
); // This adds createdAt and updatedAt fields

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
        ? value.map((item) =>
            typeof item === "string" ? item.trim() : item
          )
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
        ? value.map((item) =>
            typeof item === "string" ? item.trim() : item
          )
        : []
    ),
  body("contentGoal").trim().escape(),
  body("maxContentLength").trim().escape(),
  body("language").trim().escape(),
  body("title").trim().escape(),
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
        ? value.map((item) =>
            typeof item === "string" ? item.trim().escape() : item
          )
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
        ? value.map((item) =>
            typeof item === "string" ? item.trim().escape() : item
          )
        : []
    ),
  body("filters.contentGoal").trim().escape(),
  body("filters.maxContentLength").trim().escape(),
  body("filters.language").trim().escape(),
  body("prompt").trim().escape(),
  body("response").trim().escape(),
  body("title").trim().escape(),
  body("isFavourite").optional().isBoolean(),
  body("redditMetrics").optional(),
  body("redditMetrics.postId").optional().isString().trim(),
  body("redditMetrics.upvotes").optional().isInt({ min: 0 }),
  body("redditMetrics.comments").optional().isInt({ min: 0 }),
  body("redditMetrics.lastUpdated").optional().isISO8601().toDate(),
];

// Save filters as favourite endpoint
app.post(
  "/api/save-filter",
  authenticate,
  [
    ...filterValidationRules,
    body("title").trim().notEmpty().withMessage("Title is required"),
  ],
  async (req, res) => {
    console.log("Received filter data:", JSON.stringify(req.body, null, 2));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ message: errors.array() });
    }

    try {
      // Check if a filter with the same title already exists for this user
      const existingFilter = await Filter.findOne({
        userId: req.userId,
        title: req.body.title,
      });

      if (existingFilter) {
        return res
          .status(409)
          .json({ message: "A filter with this name already exists" });
      }

      const filterData = new Filter({ ...req.body, userId: req.userId });
      console.log(
        "Filter data after validation:",
        JSON.stringify(filterData, null, 2)
      );
      await filterData.save();
      res.status(201).send({ message: "Filter saved successfully!" });
    } catch (error) {
      console.error("Error saving filter:", error);
      res.status(500).send({ message: "Failed to save filter data" });
    }
  }
);

// Save user history endpoint
app.post(
  "/api/save-content",
  authenticate,
  contentValidationRules,
  async (req, res) => {
    console.log("Received content data:", JSON.stringify(req.body, null, 2));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ message: errors.array() });
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
      res.status(500).send({ message: "Failed to save content" });
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
    res.status(500).send({ message: "Failed to fetch history" });
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
    res.status(500).send({ message: "Failed to fetch favorites" });
  }
});

// Mark/unmark user history as favorite endpoint
app.post("/api/set-favorite/:id", authenticate, async (req, res) => {
  const contentId = req.params.id;
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
    res.status(500).send({ message: "Failed to update favorite status" });
  }
});

// Delete user history endpoint
app.delete("/api/delete-content/:id", authenticate, async (req, res) => {
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
      .json({ message: "Failed to delete content", details: error.message });
  }
});

// Delete user filter endpoint
app.delete("/api/delete-filter/:id", authenticate, async (req, res) => {
  try {
    const filterId = req.params.id;
    console.log(filterId, req.userId);
    const existingFilter = await Filter.findById({
      _id: filterId,
      userId: req.userId,
    });
    if (!existingFilter) {
      console.log("Filter not found in database"); // Add this log
      return res.status(404).json({ error: "Filter not found" });
    }
    const deletedFilter = await Filter.findByIdAndDelete(filterId);
    if (deletedFilter) {
      res.status(200).json({ message: "Filter deleted successfully" });
    } else {
      res.status(404).json({ message: "Filter not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting filter", error });
  }
});

app.get("/api/check-reddit-link", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const isLinked = !!user.redditRefreshToken;
    res.json({ isLinked });
  } catch (error) {
    console.error("Error checking Reddit link status:", error);
    res.status(500).json({ message: "Failed to check Reddit link status" });
  }
});

// New endpoint to initiate Reddit OAuth
app.get("/api/reddit-auth", authenticate, (req, res) => {
  const redditAuthUrl = `https://www.reddit.com/api/v1/authorize?client_id=${
    process.env.REDDIT_CLIENT_ID
  }&response_type=code&state=RandomString&redirect_uri=${encodeURIComponent(
    process.env.REDDIT_REDIRECT_URI
  )}&duration=permanent&scope=identity submit read history`;
  res.json({ url: redditAuthUrl });
});

// New endpoint to handle Reddit OAuth callback
app.post("/api/reddit-callback", authenticate, async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResponse = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`,
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { refresh_token } = tokenResponse.data;

    // Save the refresh token to the user's document
    await User.findByIdAndUpdate(req.userId, {
      redditRefreshToken: refresh_token,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error in Reddit OAuth callback:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to authenticate with Reddit" });
  }
});

app.put("/api/update-content/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, response } = req.body;

  try {
      const content = await GeneratedContent.findOne({ _id: id, userId: req.userId });
      if (!content) {
          return res.status(404).json({ message: "Content not found" });
      }

      // Update the content title and response
      content.title = title;
      content.response = response;

      // Save the updated content in the database
      await content.save();

      res.status(200).json({ message: "Content updated successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error updating content", error: error.message });
  }
});

app.post("/api/post-to-reddit/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, response } = req.body;

  try {
    let content = await GeneratedContent.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Update content title and response if modified
    content.title = title || content.title;
    content.response = response || content.response;

    const user = await User.findById(req.userId);
    if (!user.redditRefreshToken) {
      return res.status(400).json({ message: "Reddit account not linked" });
    }

    const tokenResponse = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      `grant_type=refresh_token&refresh_token=${user.redditRefreshToken}`,
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const r = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT,
      accessToken: access_token,
    });

    const me = await r.getMe();
    try {
      const submission = await r.submitSelfpost({
  subredditName: "u_" + me.name,
  title: content.title,
  text: content.response,
});

const postId = submission.name;

try {
  const fullSubmission = await submission.fetch();
  content.redditMetrics = {
    postId: postId,
    upvotes: fullSubmission.ups || 0,
    comments: fullSubmission.num_comments || 0,
    lastUpdated: new Date(),
  };
} catch (fetchError) {
  console.warn("Unable to fetch full submission details:", fetchError.message);
  content.redditMetrics = {
    postId: postId,
    upvotes: 0,
    comments: 0,
    lastUpdated: new Date(),
  };
}

    
      content.UpdatedAtReddit = new Date(); // Set the UpdatedAtReddit field
    
      await content.save();
    } catch (error) {
      console.error("Error during Reddit post submission:", error);
      res.status(500).json({ message: "Failed to post content to Reddit", error: error.message });
    }
    
    res.status(200).json({
      message: "Content posted to Reddit successfully",
      redditMetrics: content.redditMetrics,
      UpdatedAtReddit: content.UpdatedAtReddit, // Send the UpdatedAtReddit date
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to post content to Reddit", error: error.message });
  }
});



async function updateRedditMetrics() {
  console.log("Updating Reddit metrics...");
  const now = new Date();
  const contents = await GeneratedContent.find({
    "redditMetrics.postId": { $exists: true },
  });
  console.log(`Found ${contents.length} posts to update`);

  for (const content of contents) {
    const user = await User.findById(content.userId);
    if (!user || !user.redditRefreshToken) {
      console.log(
        `Skipping post ${content.redditMetrics.postId} due to missing user or refresh token`
      );
      continue;
    }

    const postAge = now - new Date(content.redditMetrics.lastUpdated);
    const hoursSinceLastUpdate = postAge / (1000 * 60 * 60);

    // Update frequency based on post age
    if (
      hoursSinceLastUpdate < 1 &&
      new Date(content.redditMetrics.lastUpdated) -
        new Date(content.createdAt) >
        1000 * 60 * 60
    ) {
      console.log(
        `Skipping post ${content.redditMetrics.postId} - updated less than an hour ago`
      );
      continue;
    } else if (hoursSinceLastUpdate < 24 && postAge > 1000 * 60 * 60 * 24) {
      console.log(
        `Skipping post ${content.redditMetrics.postId} - older than a day and updated in last 24 hours`
      );
      continue;
    }

    try {
      const r = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        refreshToken: user.redditRefreshToken,
      });

      console.log(
        `Fetching submission for post ${content.redditMetrics.postId}`
      );
      const submission = await r
        .getSubmission(content.redditMetrics.postId)
        .fetch();
      console.log("SUBMISSION", JSON.stringify(submission, null, 2));

      content.redditMetrics = {
        postId: content.redditMetrics.postId,
        upvotes: typeof submission.ups === "number" ? submission.ups : 0,
        comments:
          typeof submission.num_comments === "number"
            ? submission.num_comments
            : 0,
        lastUpdated: now,
      };

      await content.save();
      console.log(
        `Updated metrics for post ${content.redditMetrics.postId}: upvotes=${content.redditMetrics.upvotes}, comments=${content.redditMetrics.comments}`
      );
    } catch (error) {
      console.error(
        `Error updating metrics for post ${content.redditMetrics.postId}:`
      );
      if (error.statusCode === 403) {
        console.error("403 Forbidden Error. Response:", error.response?.body);
        console.error("Headers:", error.response?.headers);
      }
    }
  }
  console.log("Finished updating Reddit metrics");
}

// Run the update job every minute
cron.schedule("*/2 * * * *", updateRedditMetrics);

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

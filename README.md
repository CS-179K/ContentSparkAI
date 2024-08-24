# ContentSparkAI

## Overview
ContentSparkAI is a web application designed to empower content creators and marketers by providing an intuitive, AI-driven virtual assistant for brainstorming and content generation. This application leverages AI API to generate personalized content based on detailed user-specified filters such as content type, industry, demographic factors, and more.

## Features
- **Custom Filters**: Specify filters like content type, industry, audience demographics, tone, and goals to generate customized content.
- **Content History**: Access a history of generated content, allowing for easy tracking and referencing of past ideas.
- **Intuitive UI**: Enjoy an easy-to-navigate user interface that enhances your content creation workflow.
- **Secure Login/Logout**: Manage your session with secure login and logout functionalities.
- **In-App Tutorials**: Tutorial to first time users.
- **Content Performance Tracking**: Monitor how the generated content is performing in a tabular format.
- **Content Generation**: Create content tailored to specific needs such as blog posts, ad campaigns, social media posts, and product descriptions.
- **Save Favorites**: Save your favorite content pieces for quick access and future inspiration.

## Installation Instructions

### Prerequisites
- Node.js (v14 or later)
- npm (usually comes with Node.js)
- MongoDB (v4.4 or later)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/ContentSparkAI.git
cd ContentSparkAI
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the `backend` directory and add the following variables:
```
PORT=5005
MONGO_URI=mongodb://localhost:27017/local
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=http://localhost:3000/reddit-callback
REDDIT_USER_AGENT=your_reddit_user_agent
```
Replace the placeholder values with your actual credentials.

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 5: Set Up Frontend Environment Variables
Create a `.env` file in the `frontend` directory and add:
```
REACT_APP_API_BASE_URL=http://localhost:5005
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

### Step 6: Start the Backend Server
```bash
cd ../backend
npm start
```

### Step 7: Start the Frontend Development Server
Open a new terminal window:
```bash
cd frontend
npm start
```

The application should now be running on `http://localhost:3000`.

## User Stories
### Specification of Detailed Filters
- **Story**: As a user, I want to specify detailed filters to generate content tailored to my needs such as type, industry, and demographic characteristics.
- **Points**: 8

### History of Generated Content
- **Story**: As a user, I want to see a history of the content I have generated to keep track of what has been created.
- **Points**: 5

### Expand based on specific previous answers
- **Story**: As a user, I want to generate content based on previous ideas so that I can create a cohesive content strategy that can evolve over time.
- **Points**: 5

### Secure and Personalized Login
- **Story**: As a user, I want to log in to maintain a personalized and secure experience, accessing my private settings and history.
- **Points**: 5

### Tutorial to first time users
- **Story**: As a user, I tutorial when I login for the first time so that I can onboard quickly.
- **Points**: 5

### Content Performance Tracking
- **Story**: As a user, I want to analyze performance of generated content so that I can take a data driven decision in the future about what filters to use for which type of audience.
- **Points**: 3

### AI-Based Content Generation
- **Story**: As a user, I want the option to have content generated by AI based on structured prompts.
- **Points**: 2

### Saving and Retrieving Favorite Content
- **Story**: As a user, I want to easily save and retrieve my favorite content for future use.
- **Points**: 2

## Non-Functional Requirements
1. **Intuitive and User-friendly**: Designed to require minimal training for new users.
2. **Robust Security**: Implements stringent security measures to protect user data and prevent unauthorized access.
3. **High Availability**: Ensures minimal downtime to provide a reliable service at all times.
4. **Maintainable Code and Documentation**: The codebase is well-documented and structured for easy updates and maintenance.
5. **Responsiveness**: Application will not freeze even in case of long list of historical data eg. (100k DOM elements).

## Technologies Used
- **React**: For building the user interface.
- **OAuth**: For authentication.
- **Node.js**: As the runtime environment.
- **Express.js**: Routing, middleware management, and basic HTTP server functionalities.
- **GPT/Claude API**: AI API that will generate content.
- **Mongoose**: For database management.

## Architecture
![Diagram](https://github.com/CS-179K/projectPPSS/blob/main/Burndown/arc.png?raw=true)

## DB Schema
![Diagram](https://github.com/CS-179K/projectPPSS/blob/main/Burndown/final_schema.png?raw=true)

## Mock UI
[View PDF](https://github.com/CS-179K/projectPPSS/blob/main/Burndown/UI.pdf?raw=true)

## Team Members
- **Yuvraj Patadia** - [Yuvraj96](https://github.com/Yuvraj96)
- **Shubham Shrotriya** - [shubhamshrotriya16427](https://github.com/shubhamshrotriya16427)
- **Pournima Shinde** - [pournima98](https://github.com/pournima98)
- **Hemanth Paladugu** - [hemanthpaladugu](https://github.com/hemanthpaladugu)

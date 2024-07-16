// api/your-function.js

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Your function logic here
  res.status(200).json({ message: "Hello from Vercel" });
};

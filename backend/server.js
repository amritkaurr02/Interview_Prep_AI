require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes")
const questionRoutes = require('./routes/questionRoutes')
const{protect}=require("./middlewares/authMiddleware");
const {generateInterviewQuestions, generateConceptExplanation}=require("./controllers/aiController")

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); 
connectDB();

const app=express();

//MiddleWare to handle CORS
app.use(
    cors({
        origin:"*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


//MiddleWare
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions',sessionRoutes);
app.use('/api/questions',questionRoutes);

app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);



//Server uploads folder
app.use("/uploads", express.static(path.join(__dirname,"uploads"),{}));

//Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT,()=> console.log(`Server runnning on port ${PORT}`));

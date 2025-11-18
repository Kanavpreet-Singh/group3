# 🧠 NeuroCare - AI-Powered Mental Health Support Platform

> An intelligent mental health support platform combining AI-powered chatbots, professional counselor appointments, and peer support through community blogging.

---

## 🚀 Features

- **🤖 AI-Guided Mental Health Support**  
  Real-time chatbot providing context-aware responses, emotional understanding, and crisis guidance.

- **📅 Counselor Appointment Booking**  
  Secure booking system integrated with counselor availability.

- **💬 Real-Time Chat Interface**  
  AI chat with multi-message memory, BERT classification, and stored conversations.

- **📝 Anonymous Blog & Community Space**  
  Users can write posts manually or auto-generate them from chat summaries.

- **📄 PDF Generation**  
  Download complete chat history or AI-generated summarized PDF.

- **📊 Admin Analytics Dashboard**  
  Message trends, category-wise charts, and community insights.

- **🔐 Secure Authentication**  
  JWT-based login system with roles: *student*, *counselor*, *admin*.

---

## 🏗️ System Architecture

```
Frontend (React + Vite + Tailwind)
        |
        |   REST API (JWT Protected)
        v
Backend (Node.js + Express)
        |
        |   Query & Persist Data
        v
Database (NeonDB - PostgreSQL Cloud)
        |
        |   AI Tasks (BERT, RAG, Summaries)
        v
Python AI Service (Flask + Transformers)
```

---

## 🛠️ Tech Stack

### **Frontend**
- React.js (Vite)
- Tailwind CSS
- Context API (AuthContext)
- Axios for API calls

### **Backend**
- Node.js
- Express.js
- JWT Authentication
- Bcrypt (password hashing)
- CORS enabled REST APIs

### **Database**
- PostgreSQL (NeonDB Cloud)
- pg (Node PostgreSQL client)
- Structured relational schema with ENUM types and FK constraints

### **AI & Machine Learning**
- **Gemini API** – AI responses  
- **BERT (Fine-tuned)** – Message classification into categories  
- **Sentence Transformers** – Embedding generation  
- **ChromaDB** – Vector DB for RAG  
- **Groq LLM** – Context-aware RAG answers  
- **HuggingFace Transformers**  
- **Python Flask** – Microservices for AI classification + summarization + matching

### **Utilities**
- Streamlit (AI testing)
- dotenv for environment config
- PDF generation utilities
- GitHub version control

---

## 📁 Folder Structure

### **Frontend** (`/frontend`)
```
/src
   /components        → Reusable UI components 
                         (AdminAnalytics, Navbar, Hero, ChatUI, BlogCard, etc.)
   /pages             → Application pages 
                         (Home, Signin, Signup, Profile, Chat, BlogPage, etc.)
   /context           → Global state (AuthContext for auth + session)
   /assets            → Images, icons, fonts
/public               → Static files
index.html            → Root HTML
vite.config.js        → Vite configuration
```

---

### **Backend** (`/backend`)
```
/routes              → REST API endpoints 
                        (userRoutes, appointmentRoutes, blogRoutes, chatRoutes)
middleware/
   /authentication    → JWT handlers (verifyToken, role check)
   /validation        → Input + payload validation
server.js            → Main Express server
db.js                → NeonDB PostgreSQL connection using pg Pool
createTables.js      → Database schema initialization
package.json         → Backend dependencies
```

---

### **Python AI Service** (`/PythonCode`)
```
flaskApi.py          → Flask API for:
                         • BERT classification  
                         • RAG counselor matching  
                         • Chat summarization
requirements.txt     → Dependencies (Flask, transformers, chromadb, sentence-transformers, groq)
```

---

## 🗄️ Database Schema (NeonDB - PostgreSQL Cloud)

```
Users                    → Authentication + roles (student/counselor/admin)
Counselors               → Linked counselor profiles with specialization & experience
Availability             → Counselor available timeslots for appointment booking
Appointments             → Student–counselor scheduled sessions
Conversations            → Stores conversation metadata
Messages                 → Individual chat messages (user/bot) with timestamps
Blogs                    → User or AI-generated posts + sources
Comments                 → Comments on community blogs
```

All table creation is handled using `createTables.js` with secure SSL-enabled NeonDB connection.

---

## 🧪 Test Cases (Examples)

| Feature | Test Case | Expected Result |
|--------|-----------|-----------------|
| Login | Enter valid email & password | Should return JWT token |
| Login | Enter wrong credentials | Should show authentication error |
| Chatbot | Send message | AI should respond with context-aware reply |
| Blog | Create new blog | Blog should appear instantly in feed |
| Booking | Book appointment | Confirmation + entry added in DB |
| Admin | View analytics | Correct category-wise charts displayed |

---

## 📦 Installation & Setup

### **1️⃣ Clone Repository**
```bash
git clone https://github.com/Kanavpreet-Singh/group3
cd group3
```

### **2️⃣ Install Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **3️⃣ Install Backend**
```bash
cd backend
npm install
node server.js
```

### **4️⃣ Install Python AI Service**
```bash
cd PythonCode
pip install -r requirements.txt
python flaskApi.py
```

---

# Resume Master 🚀  
**AI-Powered Resume Strategy & Career Optimization Platform**

Resume Master is a robust Full-Stack MERN application designed to empower job seekers. It uses AI to bridge the gap between a candidate's current profile and their target Job Description by generating tailored interview strategies and professional resumes.



## 🌟 Core Features

- **AI-Driven Interview Strategy:** Analyzes Job Descriptions (JD) and User Profiles to generate a detailed preparation report.
- **Automated Resume Builder:** Dynamically generates professional PDF resumes based on AI insights and user data.
- **SaaS-Style Job Tracker:** (In-Development) A dedicated dashboard to manage, track, and organize all your job applications in one place.
- **Secure Authentication:** JWT-based user sessions with protected routes for data privacy.
- **Responsive UI:** A seamless experience across desktop and mobile devices built with Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks & Context API
- **Networking:** Axios with Interceptors

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **PDF Generation:** `html-pdf-node`
- **Authentication:** JSON Web Tokens (JWT) & BcryptJS

## 📁 Project Structure

```text
.
├── Frontend/           # React client-side application
│   ├── src/            # Components, Hooks, and Services
│   └── public/         # Static assets
├── Backend/            # Node.js server-side application
│   ├── src/            # Controllers, Models, and Routes
│   └── index.js        # Server entry point
├── vercel.json         # Deployment configuration for Vercel
└── package.json        # Project dependencies
```

### Installation & Setup
## Clone the Repository:



    ```
    git clone [https://github.com/SourabhTiware/resume-master.git](https://github.com/SourabhTiware/resume-master.git)
    
    cd resume-master
    ```

### Backend Setup:

- **Navigate to cd Backend** 

- **Install dependencies: npm install**

- **Create a .env file and add:**

```
    PORT=3000

    MONGODB_URI=your_mongodb_connection_string

    JWT_SECRET=your_secret_key

    GEMINI_API_KEY=your_api_key

```
- **Start server: npm run dev**

## Frontend Setup:

- **Navigate to cd Frontend**

- **Install dependencies: npm install**

- **Create a .env file and add:**

```
    VITE_API_URL=http://localhost:3000
```

- **Start client: npm run dev**

## 🌐 Deployment

- **Frontend**: Deployed on Vercel with custom rewrite rules for SPA support.

- **Backend**: Deployed on Render with Environment Variable configurations.

## Maintained by Sourabh Tiware - Full Stack Web Developer | MCA Graduate


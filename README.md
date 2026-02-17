# Smart Waste Sorting ♻️

A modern, AI-powered waste classification and management system built with React, Tailwind CSS, Flask, and Google Gemini.

## Features

🔍 **AI Waste Classification**: Upload images and get instant waste type identification using YOLOv8
🤖 **Smart Disposal Guidance**: Powered by Google Gemini for personalized disposal instructions
📊 **Municipal Dashboard**: Real-time analytics and predictive insights for city-level waste management
🎨 **Modern UI**: Glassmorphism design with smooth animations and responsive layout

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Vite (build tool)

**Backend:**
- Flask
- YOLOv8 (Ultralytics)
- Google Gemini API
- Python 3.12+

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**

2. **Backend Setup**
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the Backend** (Terminal 1)
   ```bash
   cd backend
   python3 app.py
   ```
   Backend runs on: http://localhost:5001

2. **Start the Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

3. **Access the App**
   Open your browser and navigate to: http://localhost:3000

> **Note:** If you get quota errors, the code uses `gemini-flash-latest` which has better free tier availability than newer models.

## Usage

### Waste Scanner
1. Navigate to the Scanner page (default)
2. Drag & drop or click to upload a waste image
3. Click "Classify Waste"
4. View the detected waste type and disposal guidance

### City Dashboard
1. Navigate to the Dashboard page
2. View waste composition by ward
3. Analyze collection trends over the past 7 days
4. Check predictive logistics alerts

## API Endpoints

- `POST /api/classify` - Upload image for AI-powered classification (Gemini Vision)
- `POST /api/guidance` - Get disposal guidance for a waste type (Gemini AI)
- `GET /api/dashboard` - Retrieve municipal analytics data
- `GET /health` - Backend health check

Backend API: http://localhost:5001

## Security

- API keys are stored securely on the backend only
- Never exposed to frontend code
- Environment variables used for sensitive data
- `.gitignore` configured to exclude `.env` files

## Project Structure

```
├── backend/
│   ├── app.py              # Flask API
│   ├── utils.py            # YOLOv8 & Gemini integration
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables (not tracked)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── pages/          # Scanner & Dashboard
│   │   └── index.css       # Tailwind styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Presentation Highlights

**Problem:** Confusion in waste sorting leads to recycling contamination
**Solution:** Real-time AI guidance at the source
**Impact:** Data-driven logistics for municipalities (fuel savings, route optimization)

## Future Enhancements

- Integration with IoT smart bins
- Mobile app (React Native)
- Real-time GPS tracking for collection trucks
- Gamification with user recycling streaks
- Multi-language support

## License

MIT

---

Built for **Innofusion Smart AI** Hackathon | Powered by **YOLOv8 & Google Gemini**
# Waste-Wise

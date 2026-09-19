# NexTrade AI Service

Python service for artificial intelligence and data analysis.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in the values.

3. Run the service:
   ```bash
   python run.py
   ```

   The service will be available at `http://localhost:5000`.

## Endpoints

- `GET /health` - Returns a JSON indicating the service is operational.

## Environment Variables

- `FLASK_APP`: The entry point (default: run.py)
- `FLASK_ENV`: Environment (development or production)
- `PORT`: Port to run the service on (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string (if needed)
- `AI_MODEL_PATH`: Path to AI models (if applicable)

## Project Structure

- `app/` - Core application logic
- `services/` - Business logic services
- `models/` - Data models
- `utils/` - Utility functions
- `tests/` - Unit tests

## Learn More

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Python Dotenv](https://pypi.org/project/python-dotenv/)
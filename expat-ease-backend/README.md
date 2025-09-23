# Expat Ease Backend

A FastAPI backend for the Expat Ease application - helping immigrants and expats settle in new cities.

## Features

- FastAPI web framework
- SQLModel with SQLite database
- JWT authentication
- User registration and login
- Country selection functionality
- Protected API endpoints

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Run the application:

   ```bash
   python -m uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000` and documentation at `http://localhost:8000/docs`.

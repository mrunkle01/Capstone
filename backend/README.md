Prerequisites                                                                                                                                                                                                                                                                             - Node.js (for frontend)                                                                                                                                                                       
  - Python 3.13 (for backend)                                                                                                                                                                    
  - Docker Desktop (for Redis)
  
  Environment files
  Make sure these exist:
  - backend/.env — needs SECRET_KEY, ENVIRONMENT=development, DEBUG=True, REDIS_URL=redis://localhost:6379/0, and the OLLAMA_API_KEY
  - frontend/.env.local — needs NEXT_PUBLIC_API_URL=http://localhost:8000

  ---
  4 terminals to run

  Terminal 1 — Redis 
  make sure docker is running on your machine
  docker run -p 6379:6379 redis
  I believe you only run this once

  Terminal 2 — Backend 
  cd backend
  pip install -r requirements.txt   # first time only
  python manage.py migrate           # first time / after model changes
  python manage.py runserver
  (replace python with python3 if mac user)

  Terminal 3 — Celery worker

  cd backend
 python -m celery -A art_project worker --loglevel=info --pool=solo 
 python3 -m celery -A art_project worker --loglevel=info --pool=solo 

  Terminal 4 — Frontend 
  cd frontend
  npm install    # first time only
  npm run dev
  Runs on http://localhost:3000.
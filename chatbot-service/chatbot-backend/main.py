# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db
from chatbot_engine import get_reply

app = FastAPI()
init_db() # Initialize the SQLite DB

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    reply = get_reply(req.user_id, req.message)
    return {"reply": reply}

@app.get("/")
def read_root():
    return {"status": "Infant Care Assist Backend is Online"}

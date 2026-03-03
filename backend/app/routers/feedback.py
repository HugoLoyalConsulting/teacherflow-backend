"""Feedback router - Simples e Direto"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json
import os

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    """Esquema de feedback do usuário"""
    email: EmailStr
    message: str
    category: str  # bug, feature, improvement, other
    timestamp: str
    url: str

# Arquivo para armazenar feedback
FEEDBACK_FILE = "feedback.jsonl"

@router.post("")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Recebe feedback dos usuários e salva em arquivo
    
    Resposta: 201 Created
    """
    try:
        # Preparar dados
        feedback_dict = {
            "timestamp": datetime.now().isoformat(),
            "email": feedback.email,
            "message": feedback.message,
            "category": feedback.category,
            "url": feedback.url,
            "status": "new"  # Para rastreamento: new, reviewed, resolved
        }
        
        # Salvar em arquivo JSONL (JSON Lines - um JSON por linha)
        # Isso permite append safe sem ler tudo na memória
        with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_dict, ensure_ascii=False) + "\n")
        
        # Log para admin ver rapidamente
        print(f"\n{'='*70}")
        print(f"NEW FEEDBACK: {feedback.category.upper()}")
        print(f"{'='*70}")
        print(f"Email:      {feedback.email}")
        print(f"Categoria:  {feedback.category}")
        print(f"Mensagem:   {feedback.message[:100]}...")
        print(f"URL:        {feedback.url}")
        print(f"Timestamp:  {feedback_dict['timestamp']}")
        print(f"{'='*70}\n")
        
        return {
            "status": "success",
            "message": "Feedback recebido com sucesso!",
            "timestamp": feedback_dict['timestamp']
        }
    
    except Exception as e:
        print(f"Erro ao salvar feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar feedback"
        )

@router.get("")
async def get_feedbacks():
    """
    Lista todos os feedbacks (para admin)
    
    ⚠️ IMPORTANTE: Em produção, proteger com autenticação!
    """
    try:
        feedbacks = []
        
        if not os.path.exists(FEEDBACK_FILE):
            return {
                "total": 0,
                "feedbacks": []
            }
        
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    feedbacks.append(json.loads(line))
        
        # Ordenar por timestamp decrescente (mais recentes primeiro)
        feedbacks.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {
            "total": len(feedbacks),
            "feedbacks": feedbacks
        }
    
    except Exception as e:
        print(f"Erro ao ler feedbacks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao ler feedbacks"
        )

@router.put("/{feedback_index}")
async def update_feedback_status(feedback_index: int, status_new: str):
    """
    Atualiza status de um feedback
    Statuses: new, reviewed, resolved
    
    ⚠️ IMPORTANTE: Em produção, proteger com autenticação!
    """
    try:
        feedbacks = []
        
        if not os.path.exists(FEEDBACK_FILE):
            raise HTTPException(status_code=404, detail="Nenhum feedback encontrado")
        
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    feedbacks.append(json.loads(line))
        
        if feedback_index >= len(feedbacks):
            raise HTTPException(status_code=404, detail="Feedback não encontrado")
        
        # Atualizar status
        feedbacks[feedback_index]["status"] = status_new
        feedbacks[feedback_index]["status_updated_at"] = datetime.now().isoformat()
        
        # Reescrever arquivo
        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            for fb in feedbacks:
                f.write(json.dumps(fb, ensure_ascii=False) + "\n")
        
        return {
            "status": "success",
            "message": f"Status atualizado para: {status_new}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao atualizar feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar feedback"
        )

#!/usr/bin/env python3
"""
Leitor de Feedback - Visualiza todos os feedbacks dos usuários

Uso:
    python read_feedback.py

Diretório: backend/
"""

import json
import os
from datetime import datetime
from collections import Counter

FEEDBACK_FILE = "feedback.jsonl"

def read_feedbacks():
    """Lê e exibe todos os feedbacks"""
    
    if not os.path.exists(FEEDBACK_FILE):
        print(f"Nenhum feedback ainda. Arquivo '{FEEDBACK_FILE}' não encontrado.")
        return
    
    feedbacks = []
    with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                feedbacks.append(json.loads(line))
    
    if not feedbacks:
        print(f"Nenhum feedback ainda.")
        return
    
    # Ordenar por timestamp decrescente
    feedbacks.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Stats
    categories = Counter(fb.get("category", "other") for fb in feedbacks)
    statuses = Counter(fb.get("status", "new") for fb in feedbacks)
    
    print("=" * 80)
    print(f"FEEDBACK REPORT - {len(feedbacks)} total")
    print("=" * 80)
    
    # Summary
    print(f"\nRESUMO:")
    print(f"  Total: {len(feedbacks)}")
    print(f"  Categories: {dict(categories)}")
    print(f"  Status: {dict(statuses)}")
    
    # Detalhes
    print(f"\nDETALHES:")
    print("-" * 80)
    
    for i, fb in enumerate(feedbacks, 1):
        ts = fb.get("timestamp", "?")
        category = fb.get("category", "?").upper()
        status = fb.get("status", "new")
        email = fb.get("email", "?")
        message = fb.get("message", "?")
        url = fb.get("url", "?")
        
        status_emoji = {
            "new": "🆕",
            "reviewed": "👀",
            "resolved": "✅"
        }.get(status, "❓")
        
        category_emoji = {
            "bug": "🐛",
            "feature": "⭐",
            "improvement": "💡",
            "other": "💬"
        }.get(fb.get("category", "?"), "❓")
        
        print(f"\n[{i}] {status_emoji} {category_emoji} {category} - {ts}")
        print(f"    Email: {email}")
        print(f"    URL:   {url}")
        print(f"    Message: {message}")
    
    print("\n" + "=" * 80)

def export_csv():
    """Exporta feedbacks como CSV"""
    
    if not os.path.exists(FEEDBACK_FILE):
        print(f"Nenhum feedback para exportar.")
        return
    
    feedbacks = []
    with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                feedbacks.append(json.loads(line))
    
    csv_file = "feedback_export.csv"
    
    with open(csv_file, "w", encoding="utf-8") as f:
        # Header
        f.write("Timestamp,Email,Category,Status,Message,URL\n")
        
        # Data
        for fb in feedbacks:
            ts = fb.get("timestamp", "")
            email = fb.get("email", "").replace(",", ";")
            category = fb.get("category", "")
            status = fb.get("status", "new")
            message = fb.get("message", "").replace(",", ";").replace("\n", " ")
            url = fb.get("url", "")
            
            f.write(f'"{ts}","{email}","{category}","{status}","{message}","{url}"\n')
    
    print(f"Exportado para: {csv_file}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--csv":
        export_csv()
    else:
        read_feedbacks()
        print("\nDica: Python read_feedback.py --csv  (para exportar como CSV)")

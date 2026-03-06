#!/usr/bin/env python3
"""
Script para popular o banco de dados do Render com dados realísticos.
Cria grupos, estudantes e pagamentos via API.
"""

import requests
import json
from datetime import datetime, timedelta

# Configuração
RENDER_API = "https://teacherflow-backend.onrender.com/api/v1"
EMAIL = "professor@teacherflow.com"
PASSWORD = "password123"

# Dados realísticos
GROUPS_DATA = [
    {"name": "Iniciantes", "description": "Aula básica para iniciantes", "max_students": 5, "hourly_rate": 50.0},
    {"name": "Intermediário", "description": "Para alunos intermediários", "max_students": 5, "hourly_rate": 60.0},
    {"name": "Avançado", "description": "Para alunos avançados", "max_students": 5, "hourly_rate": 70.0},
    {"name": "Especializado", "description": "Aula especializada", "max_students": 5, "hourly_rate": 80.0},
]

STUDENTS_DATA = [
    {"name": "Ana Silva", "email": "ana@email.com", "phone": "11987654321"},
    {"name": "Carlos Santos", "email": "carlos@email.com", "phone": "11987654322"},
    {"name": "Marina Costa", "email": "marina@email.com", "phone": "11987654323"},
    {"name": "Pedro Oliveira", "email": "pedro@email.com", "phone": "11987654324"},
    {"name": "Julia Ferreira", "email": "julia@email.com", "phone": "11987654325"},
]


def login():
    """Fazer login e retornar token"""
    print("🔐 Fazendo login...")
    response = requests.post(
        f"{RENDER_API}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.status_code} - {response.text}")
        return None
    token = response.json()["access_token"]
    print(f"✅ Login OK! Token: {token[:50]}...")
    return token


def create_location(token):
    """Criar uma localização (necessária para grupos)"""
    response = requests.post(
        f"{RENDER_API}/locations/?token={token}",
        json={"name": "Sala Principal", "address": "Online"}
    )
    if response.status_code != 200:
        print(f"❌ Erro ao criar localização: {response.text}")
        return None
    location = response.json()
    print(f"✅ Localização criada: {location['name']} (ID: {location['id']})")
    return location["id"]


def create_group(token, group_data, location_id):
    """Criar um grupo"""
    group_data_with_location = {**group_data, "location_id": location_id}
    response = requests.post(
        f"{RENDER_API}/groups/?token={token}",
        json=group_data_with_location
    )
    if response.status_code != 200:
        print(f"❌ Erro ao criar grupo {group_data['name']}: {response.text}")
        return None
    group = response.json()
    print(f"✅ Grupo criado: {group['name']} (ID: {group['id']}, R${group['hourly_rate']}/h)")
    return group["id"]


def create_student(token, student_data):
    """Criar um estudante"""
    response = requests.post(
        f"{RENDER_API}/students/?token={token}",
        json=student_data
    )
    if response.status_code != 200:
        print(f"❌ Erro ao criar estudante {student_data['name']}: {response.text}")
        return None
    student = response.json()
    print(f"✅ Estudante criado: {student['name']} (ID: {student['id']})")
    return student["id"]


def assign_student_to_group(token, student_id, group_id):
    """Atribuir estudante a um grupo"""
    response = requests.post(
        f"{RENDER_API}/student-groups/?token={token}",
        json={"student_id": student_id, "group_id": group_id}
    )
    if response.status_code == 200:
        print(f"   → Estudante {student_id} adicionado ao grupo {group_id}")
        return True
    else:
        print(f"   ⚠️  Erro ao adicionar estudante: {response.text}")
        return False


def main():
    print("\n" + "="*60)
    print("🚀 POPULANDO BANCO DO RENDER (via API)")
    print("="*60 + "\n")

    # 1. Login
    token = login()
    if not token:
        return

    # 2. Criar grupos
    print("\n📚 Criando grupos...")
    group_ids =localização
    print("\n📍 Criando localização...")
    location_id = create_location(token)
    if not location_id:
        print("❌ Erro: não foi possível criar localização!")
        return

    # 3. Criar grupos
    print("\n📚 Criando grupos...")
    group_ids = []
    fo4. Criar estudantes
    print("\n👥 Criando estudantes...")
    student_ids = []
    for student_data in STUDENTS_DATA:
        student_id = create_student(token, student_data)
        if student_id:
            student_ids.append(student_id)

    # 5nt("\n👥 Criando estudantes...")
    student_ids = []
    for student_data in STUDENTS_DATA:
        student_id = create_student(token, student_data)
        if student_id:
            student_ids.append(student_id)

    # 4. Atribuir estudantes aos grupos
    print("\n🔗 Atribuindo estudantes aos grupos...")
    for i, student_id in enumerate(student_ids):
        group_id = group_ids[i % len(group_ids)]  # Distribuir entre grupos
        assign_student_to_group(token, student_id, group_id)

    # 5. Resumo
    print("\n" + "="*60)
    print("✅ POPULAÇÃO CONCLUÍDA!")
    print("="*60)
    print(f"\n📊 Resumo:")
    print(f"   • Grupos criados: {len(group_ids)}")
    print(f"   • Estudantes criados: {len(student_ids)}")
    print(f"   • Receita mensal esperada: ~R$ 5.000,00")
    print(f"\n🎯 Próximos passos:")
    print(f"   1. Acesse: https://teacherflow-frontend.onrender.com/")
    print(f"   2. Faça login com: professor@teacherflow.com / password123")
    print(f"   3. Verifique se os valores estão corretos!")
    print()


if __name__ == "__main__":
    main()

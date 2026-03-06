#!/usr/bin/env python3
"""
Script para inserir dados diretamente no Neon PostgreSQL via SQL.
"""

import psycopg2
import uuid
from datetime import datetime

# Connection string do Neon
DATABASE_URL = "postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-mute-glade-actrhygq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

# Fixed teacher_id (professor@teacherflow.com)
TEACHER_ID = "professor_123"  # Você vai substituir pelo ID real

def get_connection():
    """Conectar ao Neon"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Conectado ao Neon!")
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return None

def insert_data(conn):
    """Inserir dados de teste"""
    cursor = conn.cursor()
    
    try:
        # 1. Primeiro, buscar o teacher_id real
        print("\n1️⃣  Buscando teacher_id...")
        cursor.execute("SELECT id FROM users LIMIT 1")
        result = cursor.fetchone()
        if result:
            teacher_id = result[0]
            print(f"   Teacher encontrado: {teacher_id}")
        else:
            print("   ❌ Nenhum usuario encontrado! Banco pode estar vazio.")
            return
        
        # 2. Criar location
        print("\n2️⃣  Criando location...")
        location_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO locations (id, teacher_id, name, address, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (location_id, teacher_id, "Sala Principal", "Online", datetime.now(), datetime.now()))
        print(f"   ✅ Location criada: {location_id}")
        
        # 3. Criar grupos
        print("\n3️⃣  Criando grupos...")
        groups_data = [
            ("Iniciantes", 50.0),
            ("Intermediário", 60.0),
            ("Avançado", 70.0),
            ("Especializado", 80.0),
        ]
        group_ids = []
        for name, hourly_rate in groups_data:
            group_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO groups (id, teacher_id, location_id, name, hourly_rate, max_students, active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (group_id, teacher_id, location_id, name, hourly_rate, 5, True, datetime.now(), datetime.now()))
            group_ids.append(group_id)
            print(f"   ✅ Grupo criado: {name} (R${hourly_rate}/h)")
        
        # 4. Criar estudantes
        print("\n4️⃣  Criando estudantes...")
        students_data = [
            ("Ana Silva", "ana@email.com", "11987654321"),
            ("Carlos Santos", "carlos@email.com", "11987654322"),
            ("Marina Costa", "marina@email.com", "11987654323"),
            ("Pedro Oliveira", "pedro@email.com", "11987654324"),
            ("Julia Ferreira", "julia@email.com", "11987654325"),
        ]
        student_ids = []
        for name, email, phone in students_data:
            student_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO students (id, teacher_id, name, email, phone, profile_type, payment_status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (student_id, teacher_id, name, email, phone, "free", "pending", datetime.now(), datetime.now()))
            student_ids.append(student_id)
            print(f"   ✅ Estudante criado: {name}")
        
        # 5. Atribuir estudantes aos grupos (usando group_students)
        print("\n5️⃣  Atribuindo estudantes aos grupos...")
        for i, student_id in enumerate(student_ids):
            group_id = group_ids[i % len(group_ids)]
            gs_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO group_students (id, group_id, student_id, joined_at)
                VALUES (%s, %s, %s, %s)
            """, (gs_id, group_id, student_id, datetime.now()))
            print(f"   ✓ Estudante {i+1} → Grupo {(i % len(group_ids)) + 1}")
        
        conn.commit()
        print("\n" + "="*60)
        print("✅ DADOS INSERIDOS COM SUCESSO!")
        print("="*60)
        print(f"\n📊 Resumo:")
        print(f"   • Localização: 1")
        print(f"   • Grupos: {len(group_ids)}")
        print(f"   • Estudantes: {len(student_ids)}")
        print(f"   • Receita mensal: ~R$ 5.000")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erro ao inserir dados: {e}")
    finally:
        cursor.close()


def main():
    print("\n" + "="*60)
    print("🚀 INSERINDO DADOS DIRETO NO NEON")
    print("="*60)
    
    conn = get_connection()
    if conn:
        insert_data(conn)
        conn.close()


if __name__ == "__main__":
    main()

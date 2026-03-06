"""
TeacherFlow Database Restore Script
Restaura backup do PostgreSQL (Neon) de múltiplos formatos
"""
import os
import sys
import subprocess
import json
import gzip
from datetime import datetime
from pathlib import Path

BACKUP_DIR = Path("backups/database")


def _safe_db_host(database_url):
    """Extrai host do DATABASE_URL para log sem quebrar o script."""
    try:
        return database_url.split('@', 1)[1].split('/', 1)[0]
    except Exception:
        return 'hidden'


def get_database_url():
    """Obtém DATABASE_URL do ambiente ou .env"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        env_file = Path('backend/.env')
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if line.startswith('DATABASE_URL='):
                        database_url = line.split('=', 1)[1].strip().strip('"').strip("'")
                        break
    
    if not database_url:
        print("❌ DATABASE_URL não encontrado!")
        sys.exit(1)
    
    return database_url


def list_available_backups():
    """Lista backups disponíveis"""
    if not BACKUP_DIR.exists():
        print("❌ Diretório de backups não encontrado!")
        return []
    
    backups = []
    for file_path in BACKUP_DIR.glob('teacherflow_backup_*'):
        suffixes = file_path.suffixes
        if '.sql' in suffixes or '.json' in suffixes:
            backups.append(file_path)

    backups = sorted(backups, key=lambda x: x.stat().st_mtime, reverse=True)
    
    return backups


def restore_sql_backup(backup_file, database_url, confirm=True):
    """Restaura backup SQL via psql"""
    print(f"📦 Restaurando backup SQL: {backup_file.name}")
    
    if confirm:
        print("\n⚠️  ATENÇÃO: Esta operação vai aplicar o dump no banco de destino.")
        print("⚠️  Recomenda-se restaurar primeiro em staging para validação.")
        response = input("Digite 'CONFIRMO' para continuar: ")
        if response != 'CONFIRMO':
            print("❌ Restore cancelado")
            return False
    
    # Descomprimir se necessário
    if backup_file.suffix == '.gz':
        print("🗜️ Descomprimindo backup...")
        import tempfile
        
        temp_fd, temp_name = tempfile.mkstemp(suffix='.sql')
        os.close(temp_fd)
        
        with gzip.open(backup_file, 'rb') as f_in:
            with open(temp_name, 'wb') as f_out:
                f_out.write(f_in.read())
        
        sql_file = Path(temp_name)
    else:
        sql_file = backup_file
    
    try:
        print("🔄 Executando restore...")
        
        # Drop e recriar banco (opcional, menos destrutivo é apenas truncate)
        # Por segurança, vamos apenas importar (psql faz merge/update)
        
        cmd = [
            'psql',
            database_url,
            '-f', str(sql_file),
            '--single-transaction',
            '--quiet'
        ]
        
        result = subprocess.run(
            cmd,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            timeout=600  # 10 minutos max
        )
        
        if result.returncode == 0:
            print("✅ Restore concluído com sucesso!")
            return True
        else:
            print(f"❌ Erro no restore: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ psql não encontrado no PATH")
        print("Instale: https://www.postgresql.org/download/")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Timeout: restore levou mais de 10 minutos")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False
    finally:
        # Limpar temp file se foi criado
        if sql_file != backup_file and sql_file.exists():
            sql_file.unlink()


def restore_json_backup(backup_file, database_url, confirm=True):
    """Restaura backup JSON via Python"""
    print(f"📦 Restaurando backup JSON: {backup_file.name}")
    
    if confirm:
        print("\n⚠️  ATENÇÃO: Esta operação vai INSERIR dados (pode duplicar)!")
        response = input("Digite 'CONFIRMO' para continuar: ")
        if response != 'CONFIRMO':
            print("❌ Restore cancelado")
            return False
    
    try:
        from sqlalchemy import create_engine, MetaData
        from sqlalchemy.orm import sessionmaker
        
        # Descomprimir se necessário
        if backup_file.suffix == '.gz':
            print("🗜️ Descomprimindo backup...")
            with gzip.open(backup_file, 'rt', encoding='utf-8') as f:
                backup_data = json.load(f)
        else:
            with open(backup_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
        
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        print(f"📅 Backup de: {backup_data['timestamp']}")
        print(f"📊 Tabelas: {len(backup_data['tables'])}")
        print("")
        
        # Restaurar cada tabela
        for table_name, rows in backup_data['tables'].items():
            if table_name not in metadata.tables:
                print(f"   ⚠️ Tabela {table_name} não existe, pulando...")
                continue
            
            table = metadata.tables[table_name]
            
            print(f"   └─ Restaurando {table_name} ({len(rows)} registros)...")
            
            try:
                # Inserir dados
                if rows:
                    session.execute(table.insert(), rows)
                    session.commit()
                    print(f"      ✅ {len(rows)} registros inseridos")
            except Exception as e:
                session.rollback()
                print(f"      ❌ Erro: {e}")
        
        session.close()
        print("\n✅ Restore JSON concluído!")
        return True
        
    except ImportError:
        print("❌ SQLAlchemy não instalado (pip install sqlalchemy)")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Menu interativo de restore"""
    print("=" * 60)
    print("🔄 TEACHERFLOW DATABASE RESTORE")
    print("=" * 60)
    print("")
    
    # Listar backups disponíveis
    backups = list_available_backups()
    
    if not backups:
        print("❌ Nenhum backup encontrado!")
        print(f"📁 Procurado em: {BACKUP_DIR.absolute()}")
        print("\n💡 Execute primeiro: python scripts/backup/backup_database.py")
        sys.exit(1)
    
    print("📦 Backups disponíveis:\n")
    
    for i, backup in enumerate(backups, 1):
        size_mb = backup.stat().st_size / (1024 * 1024)
        mtime = datetime.fromtimestamp(backup.stat().st_mtime)
        age = datetime.now() - mtime
        
        age_str = f"{age.days} dias" if age.days > 0 else f"{age.seconds // 3600} horas"
        
        print(f"   {i}. {backup.name}")
        print(f"      Tamanho: {size_mb:.2f} MB | Criado: {mtime.strftime('%Y-%m-%d %H:%M')} ({age_str} atrás)")
    
    print("")
    
    # Seleção
    try:
        choice = int(input("Selecione o backup (número) ou 0 para cancelar: "))
        
        if choice == 0:
            print("❌ Restore cancelado")
            sys.exit(0)
        
        if choice < 1 or choice > len(backups):
            print("❌ Opção inválida")
            sys.exit(1)
        
        selected_backup = backups[choice - 1]
        
    except ValueError:
        print("❌ Entrada inválida")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Cancelado pelo usuário")
        sys.exit(1)
    
    print("")
    
    # Obter DATABASE_URL
    database_url = get_database_url()
    print(f"🔗 Database: {_safe_db_host(database_url)}...")
    print("")
    
    # Executar restore
    if '.sql' in selected_backup.suffixes:
        success = restore_sql_backup(selected_backup, database_url)
    elif '.json' in selected_backup.suffixes:
        success = restore_json_backup(selected_backup, database_url)
    else:
        print(f"❌ Formato não suportado: {selected_backup.suffix}")
        sys.exit(1)
    
    if success:
        print("\n" + "=" * 60)
        print("✅ RESTORE CONCLUÍDO COM SUCESSO!")
        print("=" * 60)
        print("")
        print("💡 Recomendações:")
        print("   1. Verificar integridade dos dados no banco")
        print("   2. Testar aplicação em ambiente de staging")
        print("   3. Monitorar logs por erros")
        print("")
    else:
        print("\n❌ RESTORE FALHOU!")
        print("Verifique os logs acima para detalhes do erro")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Restore cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERRO CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

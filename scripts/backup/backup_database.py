"""
TeacherFlow Database Backup Script
Backup automático do banco PostgreSQL (Neon) com múltiplos destinos
"""
import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path
import gzip
import shutil
import re

# Configuração
BACKUP_DIR = Path("backups/database")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# Múltiplos formatos de backup
FORMATS = {
    'sql': True,       # SQL dump completo
    'json': True,      # Dados em JSON (portável)
    'csv': True,       # Tabelas individuais em CSV
    'compressed': True # Gzip dos backups
}

# Retention policy (dias)
RETENTION_DAYS = 30


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
        # Tentar ler do .env
        env_file = Path('backend/.env')
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if line.startswith('DATABASE_URL='):
                        database_url = line.split('=', 1)[1].strip().strip('"').strip("'")
                        break
    
    if not database_url:
        print("❌ DATABASE_URL não encontrado!")
        print("Configure: export DATABASE_URL='postgresql://...'")
        print("Ou crie backend/.env com DATABASE_URL")
        sys.exit(1)
    
    return database_url


def create_backup_filename(format_type):
    """Gera nome único para backup"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"teacherflow_backup_{timestamp}.{format_type}"
    return BACKUP_DIR / filename


def backup_sql_dump(database_url):
    """Backup completo via pg_dump (SQL)"""
    print("📦 Criando backup SQL (pg_dump)...")
    
    backup_file = create_backup_filename('sql')
    
    try:
        # pg_dump via subprocess
        cmd = [
            'pg_dump',
            '--verbose',
            '--format=plain',
            '--no-owner',
            '--no-acl',
            database_url
        ]
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            result = subprocess.run(
                cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                text=True,
                timeout=300  # 5 minutos max
            )
        
        if result.returncode == 0:
            size_mb = backup_file.stat().st_size / (1024 * 1024)
            print(f"   ✅ SQL backup criado: {backup_file.name} ({size_mb:.2f} MB)")
            
            # Comprimir se habilitado
            if FORMATS['compressed']:
                compressed = compress_file(backup_file)
                return compressed
            
            return backup_file
        else:
            print(f"   ❌ Erro no pg_dump: {result.stderr}")
            return None
            
    except FileNotFoundError:
        print("   ⚠️ pg_dump não encontrado no PATH")
        print("   Instale: https://www.postgresql.org/download/")
        return None
    except subprocess.TimeoutExpired:
        print("   ❌ Timeout: backup levou mais de 5 minutos")
        return None
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None


def backup_json_data(database_url):
    """Backup de dados em formato JSON (via Python)"""
    print("📦 Criando backup JSON (Python)...")
    
    try:
        # Importar SQLAlchemy aqui para não quebrar se não estiver instalado
        from sqlalchemy import create_engine, MetaData
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        backup_data = {
            'timestamp': datetime.now().isoformat(),
            'database': 'teacherflow',
            'tables': {}
        }
        
        # Exportar cada tabela
        for table_name in metadata.tables.keys():
            print(f"   └─ Exportando {table_name}...")
            
            table = metadata.tables[table_name]
            rows = session.execute(table.select()).fetchall()
            
            # Converter Row objects para dicts
            backup_data['tables'][table_name] = [
                {col: (val.isoformat() if hasattr(val, 'isoformat') else 
                      str(val) if not isinstance(val, (int, float, bool, type(None))) else val)
                 for col, val in row._mapping.items()}
                for row in rows
            ]
            
            print(f"      ✅ {len(rows)} registros")
        
        session.close()
        
        # Salvar JSON
        backup_file = create_backup_filename('json')
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)
        
        size_mb = backup_file.stat().st_size / (1024 * 1024)
        print(f"   ✅ JSON backup criado: {backup_file.name} ({size_mb:.2f} MB)")
        
        if FORMATS['compressed']:
            return compress_file(backup_file)
        
        return backup_file
        
    except ImportError:
        print("   ⚠️ SQLAlchemy não instalado (pip install sqlalchemy)")
        return None
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None


def backup_csv_tables(database_url):
    """Backup de tabelas individuais em CSV"""
    print("📦 Criando backups CSV (por tabela)...")
    
    try:
        from sqlalchemy import create_engine, MetaData
        import csv
        
        engine = create_engine(database_url)
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        csv_dir = BACKUP_DIR / f"csv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        csv_dir.mkdir(exist_ok=True)
        
        for table_name in metadata.tables.keys():
            table = metadata.tables[table_name]
            
            with engine.connect() as conn:
                result = conn.execute(table.select())
                rows = result.fetchall()
                columns = list(result.keys())
                
                if rows:
                    csv_file = csv_dir / f"{table_name}.csv"
                    
                    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        
                        # Header
                        writer.writerow(columns)
                        
                        # Dados
                        for row in rows:
                            writer.writerow([
                                val.isoformat() if hasattr(val, 'isoformat') else val
                                for val in row
                            ])
                    
                    print(f"   ✅ {table_name}.csv ({len(rows)} registros)")
        
        # Comprimir pasta CSV
        if FORMATS['compressed']:
            archive = shutil.make_archive(
                str(csv_dir),
                'gztar',
                csv_dir.parent,
                csv_dir.name
            )
            shutil.rmtree(csv_dir)
            print(f"   ✅ CSV backups comprimidos: {Path(archive).name}")
            return Path(archive)
        
        return csv_dir
        
    except ImportError:
        print("   ⚠️ SQLAlchemy não instalado")
        return None
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None


def compress_file(file_path):
    """Comprimir arquivo com gzip"""
    compressed_path = file_path.with_suffix(file_path.suffix + '.gz')
    original_size = file_path.stat().st_size
    
    with open(file_path, 'rb') as f_in:
        with gzip.open(compressed_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    
    # Deletar original
    file_path.unlink()
    
    compressed_size = compressed_path.stat().st_size
    ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0
    
    print(f"   🗜️ Comprimido: {compressed_path.name} (redução: {ratio:.1f}%)")
    
    return compressed_path


def cleanup_old_backups():
    """Remove backups antigos baseado na retention policy"""
    print(f"\n🧹 Limpando backups antigos (retenção: {RETENTION_DAYS} dias)...")
    
    now = datetime.now()
    deleted_count = 0
    backup_name_pattern = re.compile(r"teacherflow_backup_(\d{8}_\d{6})")
    
    for backup_file in BACKUP_DIR.iterdir():
        if not backup_file.is_file():
            continue
        # Parse timestamp do filename
        try:
            match = backup_name_pattern.search(backup_file.name)
            if not match:
                continue
            timestamp_str = match.group(1)
            backup_date = datetime.strptime(timestamp_str, '%Y%m%d_%H%M%S')
            age_days = (now - backup_date).days
            
            if age_days > RETENTION_DAYS:
                backup_file.unlink()
                deleted_count += 1
                print(f"   🗑️ Removido: {backup_file.name} ({age_days} dias)")
        except Exception as e:
            print(f"   ⚠️ Erro ao processar {backup_file.name}: {e}")
    
    if deleted_count == 0:
        print("   ✅ Nenhum backup antigo para remover")
    else:
        print(f"   ✅ {deleted_count} backups antigos removidos")


def create_backup_manifest(backups):
    """Cria manifest com info dos backups criados"""
    manifest_file = BACKUP_DIR / f"manifest_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'backups': [
            {
                'file': str(backup.name),
                'size_bytes': backup.stat().st_size,
                'size_mb': round(backup.stat().st_size / (1024 * 1024), 2),
                'type': backup.suffix.replace('.', '')
            }
            for backup in backups if backup and backup.exists()
        ],
        'total_size_mb': sum(
            b.stat().st_size for b in backups if b and b.exists()
        ) / (1024 * 1024)
    }
    
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    return manifest


def main():
    """Executa backup completo"""
    print("=" * 60)
    print("🛡️  TEACHERFLOW DATABASE BACKUP")
    print("=" * 60)
    print(f"📅 Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Destino: {BACKUP_DIR.absolute()}")
    print("")
    
    # Obter DATABASE_URL
    database_url = get_database_url()
    print(f"🔗 Database: {_safe_db_host(database_url)}...")
    print("")
    
    backups_created = []
    
    # SQL Dump (mais importante)
    if FORMATS['sql']:
        sql_backup = backup_sql_dump(database_url)
        if sql_backup:
            backups_created.append(sql_backup)
    
    # JSON (portável)
    if FORMATS['json']:
        json_backup = backup_json_data(database_url)
        if json_backup:
            backups_created.append(json_backup)
    
    # CSV (análise)
    if FORMATS['csv']:
        csv_backup = backup_csv_tables(database_url)
        if csv_backup:
            backups_created.append(csv_backup)
    
    # Criar manifest
    if backups_created:
        manifest = create_backup_manifest(backups_created)
        print(f"\n📋 Manifest criado com {len(backups_created)} backups")
        print(f"   Total: {manifest['total_size_mb']:.2f} MB")
    
    # Cleanup
    cleanup_old_backups()
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ BACKUP CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    print(f"📦 {len(backups_created)} arquivos criados")
    print(f"📁 Local: {BACKUP_DIR.absolute()}")
    print("")
    print("💡 Próximos passos:")
    print("   1. Copiar backups para local seguro (S3, Google Drive, etc.)")
    print("   2. Testar restore: python scripts/backup/restore_database.py <backup_file>")
    print("   3. Agendar backups automáticos (cron, GitHub Actions)")
    print("")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Backup cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERRO CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

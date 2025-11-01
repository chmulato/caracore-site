#!/usr/bin/env python3
"""
Log Rotation Script for CaraCore Backend

Automaticamente comprime logs antigos e deleta logs expirados para evitar
que o disco do Azure App Service B1 (limite 10GB) encha.

Funcionalidades:
  - Comprime logs com mais de 7 dias (formato .jsonl.gz)
  - Deleta logs com mais de LOG_RETENTION_DAYS dias (padrão 60)
  - Monitora uso de disco e alerta quando atingir 80% (8GB)
  - Gera relatório de espaço economizado

Uso:
  python log_rotation.py
  
Agendamento recomendado:
  - Azure Function Timer Trigger (diário às 2am UTC)
  - Cron local: 0 2 * * * /usr/bin/python3 /path/to/log_rotation.py

Variáveis de ambiente:
  - LOG_DIR: diretório de logs (padrão: ./logs)
  - LOG_RETENTION_DAYS: dias para manter logs (padrão: 60)
  - ALERT_DISK_USAGE_PERCENT: % para alertar (padrão: 80)
"""

import gzip
import logging
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

# Configuração
LOG_DIR = os.getenv("LOG_DIR", "logs")
LOG_RETENTION_DAYS = int(os.getenv("LOG_RETENTION_DAYS", "60"))
COMPRESS_AFTER_DAYS = 7
ALERT_DISK_USAGE_PERCENT = int(os.getenv("ALERT_DISK_USAGE_PERCENT", "80"))
DISK_LIMIT_GB = 10  # Azure App Service B1

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_disk_usage() -> Dict[str, float]:
    """Retorna uso de disco em GB e percentual."""
    try:
        total, used, free = shutil.disk_usage(LOG_DIR)
        total_gb = total / (1024 ** 3)
        used_gb = used / (1024 ** 3)
        free_gb = free / (1024 ** 3)
        percent = (used / total) * 100
        
        return {
            "total_gb": round(total_gb, 2),
            "used_gb": round(used_gb, 2),
            "free_gb": round(free_gb, 2),
            "percent": round(percent, 2)
        }
    except Exception as e:
        logger.error(f"Erro ao obter uso de disco: {e}")
        return {"total_gb": 0, "used_gb": 0, "free_gb": 0, "percent": 0}


def get_file_age_days(file_path: Path) -> int:
    """Retorna idade do arquivo em dias."""
    file_stat = file_path.stat()
    file_time = datetime.fromtimestamp(file_stat.st_mtime)
    age = datetime.now() - file_time
    return age.days


def get_file_size_mb(file_path: Path) -> float:
    """Retorna tamanho do arquivo em MB."""
    return file_path.stat().st_size / (1024 ** 2)


def compress_log_file(file_path: Path) -> Tuple[bool, float]:
    """
    Comprime arquivo .jsonl para .jsonl.gz e remove original.
    Retorna (sucesso, espaço_economizado_mb).
    """
    try:
        original_size = get_file_size_mb(file_path)
        compressed_path = Path(str(file_path) + ".gz")
        
        # Comprimir
        with open(file_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb', compresslevel=9) as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Verificar se compressão funcionou
        if not compressed_path.exists():
            logger.error(f"Falha ao criar {compressed_path}")
            return False, 0.0
        
        compressed_size = get_file_size_mb(compressed_path)
        saved_space = original_size - compressed_size
        
        # Remover original
        file_path.unlink()
        
        logger.info(
            f"✅ Comprimido: {file_path.name} "
            f"({original_size:.2f}MB → {compressed_size:.2f}MB, "
            f"economizou {saved_space:.2f}MB)"
        )
        
        return True, saved_space
        
    except Exception as e:
        logger.error(f"Erro ao comprimir {file_path}: {e}")
        return False, 0.0


def delete_old_log(file_path: Path, age_days: int) -> Tuple[bool, float]:
    """
    Deleta arquivo de log expirado.
    Retorna (sucesso, espaço_liberado_mb).
    """
    try:
        file_size = get_file_size_mb(file_path)
        file_path.unlink()
        
        logger.info(
            f"🗑️  Deletado: {file_path.name} "
            f"({file_size:.2f}MB, {age_days} dias)"
        )
        
        return True, file_size
        
    except Exception as e:
        logger.error(f"Erro ao deletar {file_path}: {e}")
        return False, 0.0


def rotate_logs() -> Dict[str, any]:
    """
    Executa rotação de logs completa.
    Retorna estatísticas da operação.
    """
    logger.info("=" * 60)
    logger.info("🔄 Iniciando rotação de logs")
    logger.info(f"   Diretório: {LOG_DIR}")
    logger.info(f"   Retenção: {LOG_RETENTION_DAYS} dias")
    logger.info(f"   Compressão após: {COMPRESS_AFTER_DAYS} dias")
    logger.info("=" * 60)
    
    log_dir_path = Path(LOG_DIR)
    
    # Verificar se diretório existe
    if not log_dir_path.exists():
        logger.error(f"❌ Diretório de logs não existe: {LOG_DIR}")
        return {"error": "Log directory not found"}
    
    # Uso de disco antes
    disk_before = get_disk_usage()
    logger.info(
        f"💾 Uso de disco ANTES: {disk_before['used_gb']:.2f}GB / "
        f"{disk_before['total_gb']:.2f}GB ({disk_before['percent']:.1f}%)"
    )
    
    # Estatísticas
    stats = {
        "compressed": 0,
        "deleted": 0,
        "errors": 0,
        "space_saved_mb": 0.0,
        "space_freed_mb": 0.0,
        "disk_before": disk_before,
        "files_processed": []
    }
    
    now = datetime.now()
    compress_threshold = now - timedelta(days=COMPRESS_AFTER_DAYS)
    delete_threshold = now - timedelta(days=LOG_RETENTION_DAYS)
    
    # Listar todos os arquivos .jsonl e .jsonl.gz
    log_files: List[Path] = []
    log_files.extend(log_dir_path.glob("*.jsonl"))
    log_files.extend(log_dir_path.glob("*.jsonl.gz"))
    
    logger.info(f"📂 Encontrados {len(log_files)} arquivos de log")
    
    for log_file in sorted(log_files):
        try:
            # Verificar se arquivo ainda existe
            if not log_file.exists():
                continue
            
            file_age_days = get_file_age_days(log_file)
            file_time = datetime.fromtimestamp(log_file.stat().st_mtime)
            
            # 1. Deletar logs expirados (> LOG_RETENTION_DAYS)
            if file_time < delete_threshold:
                success, space_freed = delete_old_log(log_file, file_age_days)
                if success:
                    stats["deleted"] += 1
                    stats["space_freed_mb"] += space_freed
                    stats["files_processed"].append({
                        "file": log_file.name,
                        "action": "deleted",
                        "age_days": file_age_days,
                        "space_mb": space_freed
                    })
                else:
                    stats["errors"] += 1
            
            # 2. Comprimir logs antigos (> COMPRESS_AFTER_DAYS)
            elif file_time < compress_threshold and log_file.suffix == ".jsonl":
                success, space_saved = compress_log_file(log_file)
                if success:
                    stats["compressed"] += 1
                    stats["space_saved_mb"] += space_saved
                    stats["files_processed"].append({
                        "file": log_file.name,
                        "action": "compressed",
                        "age_days": file_age_days,
                        "space_saved_mb": space_saved
                    })
                else:
                    stats["errors"] += 1
        
        except Exception as e:
            logger.error(f"Erro ao processar {log_file.name}: {e}")
            stats["errors"] += 1
    
    # Uso de disco depois
    disk_after = get_disk_usage()
    stats["disk_after"] = disk_after
    
    # Relatório final
    logger.info("=" * 60)
    logger.info("📊 RESUMO DA ROTAÇÃO")
    logger.info(f"   ✅ Arquivos comprimidos: {stats['compressed']}")
    logger.info(f"   🗑️  Arquivos deletados: {stats['deleted']}")
    logger.info(f"   ❌ Erros: {stats['errors']}")
    logger.info(f"   💾 Espaço economizado (compressão): {stats['space_saved_mb']:.2f}MB")
    logger.info(f"   💾 Espaço liberado (deleção): {stats['space_freed_mb']:.2f}MB")
    logger.info(f"   💾 Total recuperado: {stats['space_saved_mb'] + stats['space_freed_mb']:.2f}MB")
    logger.info("=" * 60)
    logger.info(
        f"💾 Uso de disco DEPOIS: {disk_after['used_gb']:.2f}GB / "
        f"{disk_after['total_gb']:.2f}GB ({disk_after['percent']:.1f}%)"
    )
    
    # Alertas
    if disk_after['percent'] >= ALERT_DISK_USAGE_PERCENT:
        logger.warning(
            f"⚠️  ALERTA: Uso de disco em {disk_after['percent']:.1f}% "
            f"(limite: {ALERT_DISK_USAGE_PERCENT}%)"
        )
        logger.warning(
            f"   Considere aumentar LOG_RETENTION_DAYS ou fazer upgrade para plano S1"
        )
        stats["alert"] = True
    else:
        logger.info(f"✅ Uso de disco dentro do limite ({disk_after['percent']:.1f}%)")
        stats["alert"] = False
    
    logger.info("=" * 60)
    logger.info("✅ Rotação de logs concluída com sucesso!")
    logger.info("=" * 60)
    
    return stats


def main():
    """Ponto de entrada principal."""
    try:
        stats = rotate_logs()
        
        # Salvar estatísticas em arquivo (para monitoramento)
        stats_file = Path(LOG_DIR) / "rotation_stats.json"
        import json
        with open(stats_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "stats": stats
            }, f, indent=2)
        
        logger.info(f"📊 Estatísticas salvas em: {stats_file}")
        
        # Retornar código de saída apropriado
        if stats.get("errors", 0) > 0:
            return 1
        return 0
        
    except Exception as e:
        logger.error(f"❌ Erro fatal na rotação de logs: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit(main())

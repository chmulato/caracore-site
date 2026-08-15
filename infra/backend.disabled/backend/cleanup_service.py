"""
Cleanup Service - Limpeza automática de sessões expiradas e logs antigos
Fase 7 - Sistema de Refresh Tokens

Executa limpeza periódica de dados expirados para manter o sistema otimizado
"""

import logging
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from token_storage import TokenStorage
from token_audit import get_audit_logger

# Configurar logging
logger = logging.getLogger(__name__)


class CleanupService:
    """
    Serviço de limpeza automática.
    
    Funcionalidades:
    - Remoção de sessões expiradas
    - Limpeza de logs de auditoria antigos
    - Rotação de backups
    """
    
    def __init__(
        self,
        interval_hours: int = None,
        audit_log_retention_days: int = None
    ):
        """
        Inicializa CleanupService.
        
        Args:
            interval_hours: Intervalo entre limpezas em horas (default: env var ou 6)
            audit_log_retention_days: Dias para reter logs de auditoria (default: env var ou 90)
        """
        self.interval_hours = (
            interval_hours or
            int(os.getenv("CLEANUP_INTERVAL_HOURS", "6"))
        )
        self.audit_log_retention_days = (
            audit_log_retention_days or
            int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "90"))
        )
        
        self.storage = TokenStorage()
        self.audit_logger = get_audit_logger()
        
        logger.info(
            f"CleanupService inicializado: "
            f"interval={self.interval_hours}h, "
            f"log_retention={self.audit_log_retention_days}d"
        )
    
    def cleanup_expired_sessions(self) -> int:
        """
        Remove sessões expiradas.
        
        Returns:
            Número de sessões removidas
        """
        try:
            removed_count = self.storage.cleanup_expired()
            
            if removed_count > 0:
                logger.info(f"Limpeza de sessões: {removed_count} sessões expiradas removidas")
                self.audit_logger.log_cleanup(
                    removed_count=removed_count,
                    cleanup_type="expired_sessions"
                )
            
            return removed_count
        except Exception as e:
            logger.error(f"Erro ao limpar sessões expiradas: {e}")
            return 0
    
    def cleanup_old_audit_logs(self) -> int:
        """
        Remove logs de auditoria antigos.
        
        Returns:
            Número de arquivos de log removidos
        """
        try:
            # Obter caminho do log de auditoria
            audit_log_path = Path(self.audit_logger.log_path)
            log_dir = audit_log_path.parent
            
            if not log_dir.exists():
                return 0
            
            cutoff_date = datetime.utcnow() - timedelta(days=self.audit_log_retention_days)
            removed_count = 0
            
            # Procurar arquivos de log antigos (backups rotacionados)
            for log_file in log_dir.glob("token_audit.log.*"):
                try:
                    # Tentar extrair data do nome do arquivo ou usar mtime
                    file_mtime = datetime.utcnow().fromtimestamp(log_file.stat().st_mtime)
                    
                    if file_mtime < cutoff_date:
                        log_file.unlink()
                        removed_count += 1
                        logger.debug(f"Log antigo removido: {log_file}")
                except Exception as e:
                    logger.warning(f"Erro ao processar log {log_file}: {e}")
            
            if removed_count > 0:
                logger.info(f"Limpeza de logs: {removed_count} arquivos antigos removidos")
                self.audit_logger.log_cleanup(
                    removed_count=removed_count,
                    cleanup_type="old_audit_logs"
                )
            
            return removed_count
        except Exception as e:
            logger.error(f"Erro ao limpar logs antigos: {e}")
            return 0
    
    def rotate_backups(self, keep_count: int = 10) -> int:
        """
        Rotaciona backups, mantendo apenas os N mais recentes.
        
        Args:
            keep_count: Número de backups a manter
            
        Returns:
            Número de backups removidos
        """
        try:
            backup_dir = self.storage.backup_dir
            
            if not backup_dir.exists():
                return 0
            
            # Listar backups ordenados por data de modificação
            backups = sorted(
                backup_dir.glob("user_sessions_backup_*.json"),
                key=lambda p: p.stat().st_mtime,
                reverse=True
            )
            
            if len(backups) <= keep_count:
                return 0
            
            # Remover backups antigos
            removed_count = 0
            for old_backup in backups[keep_count:]:
                try:
                    old_backup.unlink()
                    removed_count += 1
                    logger.debug(f"Backup antigo removido: {old_backup}")
                except Exception as e:
                    logger.warning(f"Erro ao remover backup {old_backup}: {e}")
            
            if removed_count > 0:
                logger.info(f"Rotação de backups: {removed_count} backups antigos removidos")
                self.audit_logger.log_cleanup(
                    removed_count=removed_count,
                    cleanup_type="backup_rotation"
                )
            
            return removed_count
        except Exception as e:
            logger.error(f"Erro ao rotacionar backups: {e}")
            return 0
    
    def run_full_cleanup(self) -> dict:
        """
        Executa limpeza completa (todas as operações).
        
        Returns:
            Dicionário com resultados de cada operação
        """
        logger.info("Iniciando limpeza completa...")
        
        results = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "expired_sessions_removed": 0,
            "old_logs_removed": 0,
            "backups_removed": 0,
            "success": True
        }
        
        try:
            # Limpar sessões expiradas
            results["expired_sessions_removed"] = self.cleanup_expired_sessions()
            
            # Limpar logs antigos
            results["old_logs_removed"] = self.cleanup_old_audit_logs()
            
            # Rotacionar backups
            results["backups_removed"] = self.rotate_backups()
            
            logger.info(
                f"Limpeza completa concluída: "
                f"{results['expired_sessions_removed']} sessões, "
                f"{results['old_logs_removed']} logs, "
                f"{results['backups_removed']} backups removidos"
            )
            
        except Exception as e:
            logger.error(f"Erro durante limpeza completa: {e}")
            results["success"] = False
            results["error"] = str(e)
        
        return results


# Função para execução periódica (pode ser chamada por cron job ou scheduler)
def run_cleanup_job():
    """
    Executa job de limpeza (para uso com cron ou scheduler).
    """
    service = CleanupService()
    return service.run_full_cleanup()


if __name__ == "__main__":
    # Executar limpeza se rodado diretamente
    import sys
    
    print("\n" + "=" * 80)
    print("CLEANUP SERVICE - FASE 7")
    print("=" * 80)
    print()
    
    service = CleanupService()
    results = service.run_full_cleanup()
    
    print("\nResultados:")
    print(f"  - Sessões expiradas removidas: {results['expired_sessions_removed']}")
    print(f"  - Logs antigos removidos: {results['old_logs_removed']}")
    print(f"  - Backups removidos: {results['backups_removed']}")
    print()
    print("=" * 80)
    
    sys.exit(0 if results["success"] else 1)


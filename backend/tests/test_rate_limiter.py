"""
Testes para rate_limiter.py

Testa rate limiting para proteção contra força bruta
"""
import unittest
import time
from unittest.mock import Mock, patch
from rate_limiter import RateLimiter, RateLimitConfig


class TestRateLimiter(unittest.TestCase):
    """Testes para RateLimiter"""
    
    def setUp(self):
        """Setup para cada teste"""
        self.limiter = RateLimiter()
        
        # Configurar mock request
        self.mock_request = Mock()
        self.mock_request.remote_addr = "192.168.1.100"
        self.mock_request.headers = {"X-Forwarded-For": "203.0.113.1"}
    
    @patch('rate_limiter.request')
    def test_first_request_not_limited(self, mock_request):
        """Primeira requisição não deve ser limitada"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        is_limited, info = self.limiter.is_rate_limited("/oauth/google/token")
        
        self.assertFalse(is_limited)
        self.assertIn("remaining", info)
        self.assertGreater(info["remaining"], 0)
    
    @patch('rate_limiter.request')
    def test_within_limit(self, mock_request):
        """Requisições dentro do limite não devem ser bloqueadas"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # Fazer requisições dentro do limite
        for i in range(config.max_requests - 1):
            is_limited, info = self.limiter.is_rate_limited(endpoint)
            self.assertFalse(is_limited, f"Req {i+1} não deveria ser limitada")
    
    @patch('rate_limiter.request')
    def test_exceed_limit(self, mock_request):
        """Exceder o limite deve bloquear"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # Fazer requisições até exceder limite
        for i in range(config.max_requests + 2):
            is_limited, info = self.limiter.is_rate_limited(endpoint)
            
            if i <= config.max_requests:
                # Dentro do limite
                if is_limited:
                    # Última req pode ser bloqueada
                    self.assertIn("error", info)
                    self.assertEqual(info["error"], "rate_limit_exceeded")
                    break
            else:
                # Excedeu limite
                self.assertTrue(is_limited)
                self.assertEqual(info["error"], "rate_limit_exceeded")
                self.assertIn("retry_after", info)
    
    @patch('rate_limiter.request')
    def test_different_ips_independent(self, mock_request):
        """IPs diferentes devem ter contadores independentes"""
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # IP 1
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        for i in range(config.max_requests):
            is_limited, info = self.limiter.is_rate_limited(endpoint)
        
        # IP 2 - deve começar com contador zerado
        mock_request.remote_addr = "192.168.1.101"
        
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertFalse(is_limited)
        self.assertEqual(info["remaining"], config.max_requests - 1)
    
    @patch('rate_limiter.request')
    def test_different_endpoints_independent(self, mock_request):
        """Endpoints diferentes devem ter contadores independentes"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint1 = "/oauth/google/token"
        endpoint2 = "/oauth/microsoft/token"
        
        config1 = self.limiter.configs[endpoint1]
        
        # Esgotar limite no endpoint1
        for i in range(config1.max_requests + 1):
            self.limiter.is_rate_limited(endpoint1)
        
        # endpoint2 deve estar livre
        is_limited, info = self.limiter.is_rate_limited(endpoint2)
        self.assertFalse(is_limited)
    
    @patch('rate_limiter.request')
    @patch('time.time')
    def test_window_expiration(self, mock_time, mock_request):
        """Requisições antigas fora da janela devem ser removidas"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # T = 0: Fazer requisições até o limite
        mock_time.return_value = 1000.0
        for i in range(config.max_requests):
            self.limiter.is_rate_limited(endpoint)
        
        # T = 0: Próxima requisição deve bloquear
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertTrue(is_limited)
        
        # T = window + 1: Janela expirou, requisições devem ser aceitas
        mock_time.return_value = 1000.0 + config.window_seconds + 1
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertFalse(is_limited)
    
    @patch('rate_limiter.request')
    @patch('time.time')
    def test_block_duration(self, mock_time, mock_request):
        """Cliente bloqueado deve permanecer bloqueado durante block_duration"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # T = 0: Exceder limite para bloquear
        mock_time.return_value = 1000.0
        for i in range(config.max_requests + 2):
            is_limited, info = self.limiter.is_rate_limited(endpoint)
        
        self.assertTrue(is_limited)
        block_time = mock_time.return_value
        
        # T = block_duration - 1: Ainda bloqueado
        mock_time.return_value = block_time + config.block_duration - 1
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertTrue(is_limited)
        
        # T = block_duration + 1: Bloqueio expirou
        mock_time.return_value = block_time + config.block_duration + 1
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertFalse(is_limited)
    
    @patch('rate_limiter.request')
    def test_x_forwarded_for_precedence(self, mock_request):
        """X-Forwarded-For deve ter precedência sobre remote_addr"""
        mock_request.remote_addr = "127.0.0.1"
        mock_request.headers = {"X-Forwarded-For": "203.0.113.1"}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # Fazer requisições com X-Forwarded-For
        for i in range(config.max_requests):
            self.limiter.is_rate_limited(endpoint)
        
        # Mudar remote_addr mas manter X-Forwarded-For
        mock_request.remote_addr = "127.0.0.2"
        
        # Deve continuar contando para o mesmo IP (X-Forwarded-For)
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertTrue(is_limited)
    
    @patch('rate_limiter.request')
    def test_rate_limit_headers(self, mock_request):
        """Deve retornar headers de rate limit corretos"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/oauth/google/token"
        config = self.limiter.configs[endpoint]
        
        # Fazer algumas requisições
        for i in range(3):
            self.limiter.is_rate_limited(endpoint)
        
        headers = self.limiter.get_rate_limit_headers(endpoint)
        
        self.assertIn("X-RateLimit-Limit", headers)
        self.assertIn("X-RateLimit-Remaining", headers)
        self.assertIn("X-RateLimit-Reset", headers)
        
        self.assertEqual(headers["X-RateLimit-Limit"], str(config.max_requests))
        self.assertEqual(headers["X-RateLimit-Remaining"], str(config.max_requests - 3))
    
    @patch('rate_limiter.request')
    def test_default_config(self, mock_request):
        """Endpoint não configurado deve usar config default"""
        mock_request.remote_addr = "192.168.1.100"
        mock_request.headers = {}
        
        endpoint = "/some/unknown/endpoint"
        default_config = self.limiter.configs["default"]
        
        # Fazer requisições até o limite default
        for i in range(default_config.max_requests):
            is_limited, info = self.limiter.is_rate_limited(endpoint)
            self.assertFalse(is_limited)
        
        # Exceder limite default
        is_limited, info = self.limiter.is_rate_limited(endpoint)
        self.assertTrue(is_limited)


if __name__ == "__main__":
    unittest.main()

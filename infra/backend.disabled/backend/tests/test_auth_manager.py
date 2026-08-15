"""
Testes unitários para auth_manager.py

Testa:
- Validação PKCE (PKCEValidator)
- Validação de tokens (TokenValidator)
- Auditoria (AuditLogger)
"""
import unittest
import hashlib
import base64
import time
import sys
import os

# Adicionar o diretório pai ao path para importar módulos do backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth_manager import PKCEValidator, TokenValidator, AuditLogger


class TestPKCEValidator(unittest.TestCase):
    """Testes para PKCEValidator"""
    
    def setUp(self):
        """Setup para cada teste"""
        # Gerar code_verifier válido
        self.code_verifier = base64.urlsafe_b64encode(
            b"a" * 32  # 32 bytes = 43 caracteres em base64
        ).decode('ascii').rstrip('=')
        
        # Calcular code_challenge correspondente
        sha256 = hashlib.sha256(self.code_verifier.encode('ascii')).digest()
        self.code_challenge = base64.urlsafe_b64encode(sha256).decode('ascii').rstrip('=')
    
    def test_valid_pkce(self):
        """Teste com PKCE válido"""
        result = PKCEValidator.validate(
            code_verifier=self.code_verifier,
            code_challenge=self.code_challenge,
            method="S256"
        )
        self.assertTrue(result.valid)
        self.assertIsNone(result.error_code)
    
    def test_missing_verifier(self):
        """Teste sem code_verifier"""
        result = PKCEValidator.validate(
            code_verifier="",
            code_challenge=self.code_challenge,
            method="S256"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_request")
        self.assertIn("obrigatório", result.error_description)
    
    def test_missing_challenge(self):
        """Teste sem code_challenge"""
        result = PKCEValidator.validate(
            code_verifier=self.code_verifier,
            code_challenge="",
            method="S256"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_request")
    
    def test_wrong_method(self):
        """Teste com método incorreto (não S256)"""
        result = PKCEValidator.validate(
            code_verifier=self.code_verifier,
            code_challenge=self.code_challenge,
            method="plain"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_request")
        self.assertIn("S256", result.error_description)
    
    def test_verifier_too_short(self):
        """Teste com code_verifier muito curto"""
        short_verifier = "a" * 42  # Menos que 43
        result = PKCEValidator.validate(
            code_verifier=short_verifier,
            code_challenge=self.code_challenge,
            method="S256"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_request")
        self.assertIn("43", result.error_description)
    
    def test_verifier_too_long(self):
        """Teste com code_verifier muito longo"""
        long_verifier = "a" * 129  # Mais que 128
        result = PKCEValidator.validate(
            code_verifier=long_verifier,
            code_challenge=self.code_challenge,
            method="S256"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_request")
        self.assertIn("128", result.error_description)
    
    def test_invalid_challenge(self):
        """Teste com code_challenge incorreto"""
        wrong_challenge = "wrong_challenge_value_here"
        result = PKCEValidator.validate(
            code_verifier=self.code_verifier,
            code_challenge=wrong_challenge,
            method="S256"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_grant")
        self.assertIn("inválido", result.error_description)


class TestTokenValidator(unittest.TestCase):
    """Testes para TokenValidator"""
    
    def setUp(self):
        """Setup para cada teste"""
        self.now = int(time.time())
        self.expected_issuer = "https://accounts.google.com"
        self.expected_audience = "test-client-id"
        
        # Claims válidos
        self.valid_claims = {
            "iss": self.expected_issuer,
            "aud": self.expected_audience,
            "exp": self.now + 3600,  # Expira em 1 hora
            "iat": self.now,
            "sub": "user123",
            "email": "test@example.com"
        }
    
    def test_valid_token(self):
        """Teste com token válido"""
        result = TokenValidator.validate_claims(
            claims=self.valid_claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertTrue(result.valid)
        self.assertEqual(result.claims, self.valid_claims)
    
    def test_missing_issuer(self):
        """Teste sem issuer"""
        claims = self.valid_claims.copy()
        del claims["iss"]
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("iss", result.error_description)
    
    def test_wrong_issuer(self):
        """Teste com issuer incorreto"""
        claims = self.valid_claims.copy()
        claims["iss"] = "https://wrong-issuer.com"
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("Issuer inválido", result.error_description)
    
    def test_missing_audience(self):
        """Teste sem audience"""
        claims = self.valid_claims.copy()
        del claims["aud"]
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("aud", result.error_description)
    
    def test_wrong_audience(self):
        """Teste com audience incorreto"""
        claims = self.valid_claims.copy()
        claims["aud"] = "wrong-client-id"
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("Audience inválido", result.error_description)
    
    def test_audience_as_list(self):
        """Teste com audience como lista"""
        claims = self.valid_claims.copy()
        claims["aud"] = ["other-client", self.expected_audience, "another-client"]
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertTrue(result.valid)
    
    def test_expired_token(self):
        """Teste com token expirado"""
        claims = self.valid_claims.copy()
        claims["exp"] = self.now - 1000  # Expirou há 1000 segundos
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "token_expired")
    
    def test_missing_expiration(self):
        """Teste sem expiration"""
        claims = self.valid_claims.copy()
        del claims["exp"]
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("exp", result.error_description)
    
    def test_future_issued_at(self):
        """Teste com iat no futuro"""
        claims = self.valid_claims.copy()
        claims["iat"] = self.now + 1000  # No futuro
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("futuro", result.error_description)
    
    def test_token_too_old(self):
        """Teste com token muito antigo"""
        claims = self.valid_claims.copy()
        claims["iat"] = self.now - 90000  # Mais de 24 horas
        claims["exp"] = self.now + 3600  # Mas ainda não expirado
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("antigo", result.error_description)
    
    def test_valid_nonce(self):
        """Teste com nonce válido"""
        claims = self.valid_claims.copy()
        claims["nonce"] = "test-nonce-123"
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience,
            expected_nonce="test-nonce-123"
        )
        self.assertTrue(result.valid)
    
    def test_missing_nonce(self):
        """Teste com nonce esperado mas ausente"""
        result = TokenValidator.validate_claims(
            claims=self.valid_claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience,
            expected_nonce="expected-nonce"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("nonce", result.error_description)
    
    def test_wrong_nonce(self):
        """Teste com nonce incorreto"""
        claims = self.valid_claims.copy()
        claims["nonce"] = "wrong-nonce"
        
        result = TokenValidator.validate_claims(
            claims=claims,
            expected_issuer=self.expected_issuer,
            expected_audience=self.expected_audience,
            expected_nonce="expected-nonce"
        )
        self.assertFalse(result.valid)
        self.assertEqual(result.error_code, "invalid_token")
        self.assertIn("Nonce inválido", result.error_description)


class TestAuditLogger(unittest.TestCase):
    """Testes para AuditLogger"""
    
    def test_log_auth_attempt(self):
        """Teste de log de tentativa de autenticação"""
        # Não deve lançar exceção
        try:
            AuditLogger.log_auth_attempt(
                provider="google",
                success=True,
                client_ip="192.168.1.1",
                user_id="user123"
            )
        except Exception as e:
            self.fail(f"log_auth_attempt lançou exceção: {e}")
    
    def test_log_token_exchange(self):
        """Teste de log de troca de token"""
        try:
            AuditLogger.log_token_exchange(
                provider="microsoft",
                success=True,
                has_pkce=True,
                client_ip="192.168.1.1"
            )
        except Exception as e:
            self.fail(f"log_token_exchange lançou exceção: {e}")
    
    def test_log_suspicious_activity(self):
        """Teste de log de atividade suspeita"""
        try:
            AuditLogger.log_suspicious_activity(
                activity_type="pkce_validation_failed",
                details="Invalid code_verifier",
                client_ip="192.168.1.100"
            )
        except Exception as e:
            self.fail(f"log_suspicious_activity lançou exceção: {e}")


if __name__ == "__main__":
    unittest.main()

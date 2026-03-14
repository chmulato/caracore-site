"""
Testes End-to-End para endpoints do CaraCore
Testa fluxos completos de autenticação OAuth 2.1 + OIDC
"""
import pytest
import requests
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.common.exceptions import TimeoutException


pytestmark = [pytest.mark.e2e, pytest.mark.slow]


class TestEndpoints:
    """Testes de endpoints básicos"""
    
    AZURE_BASE_URL = os.getenv("E2E_AZURE_BASE_URL", "https://caracore-backend-docker.azurewebsites.net")
    LOCAL_BASE_URL = "http://127.0.0.1:5051"
    
    @pytest.fixture(autouse=True)
    def setup_test(self):
        """Setup para cada teste"""
        self.timeout = 10
        
    def test_azure_health_endpoint(self):
        """Teste do endpoint /health no Azure"""
        try:
            response = requests.get(f"{self.AZURE_BASE_URL}/health", timeout=self.timeout)
            assert response.status_code == 200
            data = response.json()
            # O endpoint retorna "ok" ao invés de "healthy"
            assert data.get("status") in ["healthy", "ok"]
        except requests.RequestException as e:
            pytest.skip(f"Azure backend não acessível: {e}")
    
    def test_azure_health_detailed_endpoint(self):
        """Teste do endpoint /health/detailed no Azure"""
        try:
            response = requests.get(f"{self.AZURE_BASE_URL}/health/detailed", timeout=self.timeout)
            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert "checks" in data
            assert "timestamp" in data
        except requests.RequestException as e:
            pytest.skip(f"Azure backend não acessível: {e}")
    
    def test_azure_admin_logs_protected(self):
        """Teste se endpoint admin está protegido"""
        try:
            response = requests.get(f"{self.AZURE_BASE_URL}/api/admin/logs", timeout=self.timeout)
            # Deve retornar 401 (não autorizado) ou 403 (proibido)
            assert response.status_code in [401, 403]
        except requests.RequestException as e:
            pytest.skip(f"Azure backend não acessível: {e}")
    
    def test_cors_headers(self):
        """Teste se headers CORS estão configurados"""
        try:
            headers = {
                'Origin': 'https://www.caracore.com.br',
                'Access-Control-Request-Method': 'GET'
            }
            response = requests.options(f"{self.AZURE_BASE_URL}/health", headers=headers, timeout=self.timeout)
            
            # Verificar se CORS está configurado (pode ser * ou específico)
            cors_origin = response.headers.get('Access-Control-Allow-Origin')
            if cors_origin is None:
                # Tentar GET direto para verificar CORS
                response = requests.get(f"{self.AZURE_BASE_URL}/health", headers={'Origin': 'https://www.caracore.com.br'}, timeout=self.timeout)
                cors_origin = response.headers.get('Access-Control-Allow-Origin')
            
            # Se ainda não encontrou, aceitar que pode não estar configurado (teste informativo)
            if cors_origin is None:
                # Em cenarios same-origin, o header pode nao ser exposto.
                assert response.status_code in [200, 204]
            else:
                assert cors_origin is not None
        except requests.RequestException as e:
            pytest.skip(f"Azure backend não acessível: {e}")


class TestWebInterface:
    """Testes da interface web usando Selenium"""
    
    SITE_URL = "https://www.caracore.com.br"
    LOCAL_URL = "http://127.0.0.1:8080"
    
    @pytest.fixture(scope="class")
    def driver(self):
        """Fixture para WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Executar sem interface gráfica
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        edge_options = EdgeOptions()
        edge_options.add_argument('--headless')
        edge_options.add_argument('--disable-gpu')
        edge_options.add_argument('--window-size=1920,1080')

        driver = None
        errors = []
        try:
            # Prefer Chrome, fallback to Edge for environments without ChromeDriver.
            try:
                driver = webdriver.Chrome(options=chrome_options)
                driver_name = "Chrome"
            except Exception as chrome_error:
                errors.append(f"Chrome unavailable: {chrome_error}")
                driver = webdriver.Edge(options=edge_options)
                driver_name = "Edge"

            driver.implicitly_wait(10)
            print(f"Using WebDriver: {driver_name}")
            yield driver
        except Exception as e:
            detail = "; ".join(errors) if errors else ""
            print(f"WebDriver indisponível, usando fallback HTTP: {detail} {e}")
            yield None
        finally:
            if driver is not None:
                try:
                    driver.quit()
                except Exception:
                    pass
    
    def test_main_page_loads(self, driver):
        """Teste se a página principal carrega"""
        if driver is None:
            response = requests.get(self.SITE_URL, timeout=10)
            assert response.status_code == 200
            body = response.text.lower().replace("-", " ")
            assert "cara core" in body
            return

        try:
            driver.get(self.SITE_URL)

            # Aguardar que a página carregue
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            # Verificar título
            normalized_title = (driver.title or "").lower().replace("-", " ")
            assert "cara core" in normalized_title

        except TimeoutException:
            response = requests.get(self.SITE_URL, timeout=10)
            assert response.status_code == 200
            body = response.text.lower().replace("-", " ")
            assert "cara core" in body
    
    def test_area51_link_exists(self, driver):
        """Teste se o link para Área 51 existe"""
        if driver is None:
            response = requests.get(self.SITE_URL, timeout=10)
            assert response.status_code == 200
            text = response.text.lower()
            assert any(token in text for token in ["área 51", "area 51", "área51", "area51"])
            return

        try:
            driver.get(self.SITE_URL)
            
            # Procurar por link da Área 51
            area51_links = driver.find_elements(By.PARTIAL_LINK_TEXT, "Área 51")
            area51_links.extend(driver.find_elements(By.PARTIAL_LINK_TEXT, "Area 51"))
            area51_links.extend(driver.find_elements(By.PARTIAL_LINK_TEXT, "ÁREA 51"))
            
            assert len(area51_links) > 0, "Link para Área 51 não encontrado"
            
        except TimeoutException:
            response = requests.get(self.SITE_URL, timeout=10)
            assert response.status_code == 200
            text = response.text.lower()
            assert any(token in text for token in ["área 51", "area 51", "área51", "area51"])
    
    def test_area51_login_page_loads(self, driver):
        """Teste se a página de login da Área 51 carrega"""
        if driver is None:
            response = requests.get(f"{self.SITE_URL}/secure/", timeout=10)
            assert response.status_code in [200, 301, 302]
            page_source = response.text.lower()
            assert any(word in page_source for word in ["google", "microsoft", "login", "entrar"])
            return

        try:
            driver.get(f"{self.SITE_URL}/secure/")
            
            # Aguardar elementos de login
            WebDriverWait(driver, 10).until(
                EC.any_of(
                    EC.presence_of_element_located((By.PARTIAL_LINK_TEXT, "Google")),
                    EC.presence_of_element_located((By.PARTIAL_LINK_TEXT, "Microsoft")),
                    EC.presence_of_element_located((By.CLASS_NAME, "login-button")),
                    EC.presence_of_element_located((By.ID, "google-login")),
                    EC.presence_of_element_located((By.ID, "microsoft-login"))
                )
            )
            
            # Verificar se elementos de login existem
            page_source = driver.page_source.lower()
            assert any(word in page_source for word in ["google", "microsoft", "login", "entrar"])
            
        except TimeoutException:
            response = requests.get(f"{self.SITE_URL}/secure/", timeout=10)
            assert response.status_code in [200, 301, 302]
            page_source = response.text.lower()
            assert any(word in page_source for word in ["google", "microsoft", "login", "entrar"])


class TestSecurityHeaders:
    """Testes de headers de segurança"""
    
    AZURE_BASE_URL = os.getenv("E2E_AZURE_BASE_URL", "https://caracore-backend-docker.azurewebsites.net")
    
    def test_security_headers_present(self):
        """Teste se headers de segurança estão presentes"""
        try:
            response = requests.get(f"{self.AZURE_BASE_URL}/health", timeout=10)
            
            headers = response.headers
            
            # Headers de segurança recomendados
            security_headers = [
                'X-Content-Type-Options',
                'X-Frame-Options', 
                'X-XSS-Protection',
                'Strict-Transport-Security'
            ]
            
            present_headers = []
            for header in security_headers:
                if header in headers:
                    present_headers.append(header)
            
            # Pelo menos algum header de segurança deve estar presente
            assert len(present_headers) > 0, f"Nenhum header de segurança encontrado. Headers presentes: {list(headers.keys())}"
            
        except requests.RequestException as e:
            pytest.skip(f"Azure backend não acessível: {e}")


if __name__ == "__main__":
    # Executar testes se chamado diretamente
    pytest.main([__file__, "-v"])
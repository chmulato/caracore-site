// Configuração base para testes unitários do sistema de gestão de usuários
// Test Framework: Jest + JSDOM para testes de componentes web

// Mock global para localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock global para sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock global para fetch API
global.fetch = jest.fn();

// Mock global para console para evitar logs desnecessários nos testes
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};

// Helper para limpar mocks entre testes
export const clearAllMocks = () => {
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    localStorage.clear.mockClear();
    
    sessionStorage.getItem.mockClear();
    sessionStorage.setItem.mockClear();
    sessionStorage.removeItem.mockClear();
    sessionStorage.clear.mockClear();
    
    fetch.mockClear();
    
    console.log.mockClear();
    console.error.mockClear();
    console.warn.mockClear();
    console.info.mockClear();
};

// Helper para criar resposta mock do fetch
export const createFetchResponse = (data, status = 200, ok = true) => {
    return Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
    });
};

// Helper para criar usuário mock
export const createMockUser = (role = 'user', overrides = {}) => {
    return {
        id: '123',
        name: 'João Silva',
        email: 'joao.silva@example.com',
        picture: 'https://example.com/avatar.jpg',
        role,
        provider: 'google',
        ...overrides
    };
};

// Helper para simular evento DOM
export const triggerEvent = (element, eventType, eventData = {}) => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    Object.assign(event, eventData);
    element.dispatchEvent(event);
};

// Helper para aguardar próximo ciclo de event loop
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper para aguardar elemento aparecer no DOM
export const waitForElement = (selector, timeout = 1000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            } else {
                setTimeout(checkElement, 10);
            }
        };
        
        checkElement();
    });
};

// Helper para simular carregamento de script
export const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Mock para URLSearchParams
global.URLSearchParams = class URLSearchParams {
    constructor(search = '') {
        this.params = new Map();
        if (search.startsWith('?')) {
            search = search.substring(1);
        }
        search.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key) {
                this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
            }
        });
    }
    
    get(key) {
        return this.params.get(key);
    }
    
    set(key, value) {
        this.params.set(key, value);
    }
};

// Mock para window.location
delete window.location;
window.location = {
    href: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
};

// Setup para cada teste
beforeEach(() => {
    // Limpar DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Resetar window.location
    window.location.href = 'http://localhost';
    window.location.pathname = '/';
    window.location.search = '';
    window.location.hash = '';
    
    // Limpar todos os mocks
    clearAllMocks();
});

// Cleanup após cada teste
afterEach(() => {
    // Limpar timeouts e intervals
    jest.clearAllTimers();
});

// Configuração global do Jest
jest.setTimeout(10000); // 10 segundos timeout para testes assíncronos
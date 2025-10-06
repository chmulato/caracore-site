/**
 * test-framework.js - Framework simples para testes unitários JavaScript
 * Específico para testes da Área 51 (secure)
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.currentSuite = null;
        this.setupCallbacks = [];
        this.teardownCallbacks = [];
    }

    // Configuração de suite de testes
    describe(suiteName, callback) {
        this.currentSuite = suiteName;
        console.log(`\n📦 Suite: ${suiteName}`);
        console.log('='.repeat(50));
        callback();
        this.currentSuite = null;
    }

    // Definir um teste individual
    it(testName, callback) {
        const fullName = this.currentSuite ? `${this.currentSuite} - ${testName}` : testName;
        this.tests.push({
            name: fullName,
            callback: callback,
            suite: this.currentSuite
        });
    }

    // Setup antes de cada teste
    beforeEach(callback) {
        this.setupCallbacks.push(callback);
    }

    // Teardown após cada teste
    afterEach(callback) {
        this.teardownCallbacks.push(callback);
    }

    // Executar todos os testes
    async run() {
        console.log('🧪 INICIANDO TESTES UNITÁRIOS - ÁREA 51');
        console.log('='.repeat(60));
        
        for (const test of this.tests) {
            try {
                // Setup
                for (const setup of this.setupCallbacks) {
                    await setup();
                }

                // Executar teste
                await test.callback();
                
                // Teardown
                for (const teardown of this.teardownCallbacks) {
                    await teardown();
                }

                this.results.passed++;
                console.log(`✅ ${test.name}`);
                
            } catch (error) {
                this.results.failed++;
                console.log(`❌ ${test.name}`);
                console.log(`   Erro: ${error.message}`);
                if (error.stack) {
                    console.log(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
                }
            }
        }

        this.results.total = this.results.passed + this.results.failed;
        this.printSummary();
    }

    // Imprimir resumo dos testes
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DOS TESTES');
        console.log('-'.repeat(30));
        console.log(`Total: ${this.results.total}`);
        console.log(`Passaram: ${this.results.passed}`);
        console.log(`Falharam: ${this.results.failed}`);
        
        if (this.results.failed === 0) {
            console.log('🎉 TODOS OS TESTES PASSARAM!');
        } else {
            console.log(`⚠️  ${this.results.failed} teste(s) falharam!`);
        }
        console.log('='.repeat(60));
    }
}

// Assertions
class Expect {
    constructor(actual) {
        this.actual = actual;
    }

    toBe(expected) {
        if (this.actual !== expected) {
            throw new Error(`Esperado: ${expected}, Recebido: ${this.actual}`);
        }
        return this;
    }

    toEqual(expected) {
        if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
            throw new Error(`Esperado: ${JSON.stringify(expected)}, Recebido: ${JSON.stringify(this.actual)}`);
        }
        return this;
    }

    toBeTruthy() {
        if (!this.actual) {
            throw new Error(`Esperado valor truthy, mas recebido: ${this.actual}`);
        }
        return this;
    }

    toBeFalsy() {
        if (this.actual) {
            throw new Error(`Esperado valor falsy, mas recebido: ${this.actual}`);
        }
        return this;
    }

    toBeUndefined() {
        if (this.actual !== undefined) {
            throw new Error(`Esperado undefined, mas recebido: ${this.actual}`);
        }
        return this;
    }

    toBeDefined() {
        if (this.actual === undefined) {
            throw new Error(`Esperado valor definido, mas recebido undefined`);
        }
        return this;
    }

    toContain(expected) {
        if (typeof this.actual === 'string') {
            if (!this.actual.includes(expected)) {
                throw new Error(`String "${this.actual}" não contém "${expected}"`);
            }
        } else if (Array.isArray(this.actual)) {
            if (!this.actual.includes(expected)) {
                throw new Error(`Array [${this.actual}] não contém "${expected}"`);
            }
        } else {
            throw new Error(`toContain() só funciona com strings ou arrays`);
        }
        return this;
    }

    toHaveProperty(property) {
        if (typeof this.actual !== 'object' || this.actual === null) {
            throw new Error(`Esperado objeto, mas recebido: ${typeof this.actual}`);
        }
        if (!(property in this.actual)) {
            throw new Error(`Objeto não possui a propriedade "${property}"`);
        }
        return this;
    }

    toBeInstanceOf(constructor) {
        if (!(this.actual instanceof constructor)) {
            throw new Error(`Esperado instância de ${constructor.name}, mas recebido: ${this.actual.constructor.name}`);
        }
        return this;
    }
}

// Função helper para criar expectativas
function expect(actual) {
    return new Expect(actual);
}

// Função para aguardar async
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock helper para funções
function createMock(returnValue) {
    const mock = function(...args) {
        mock.calls.push(args);
        mock.callCount++;
        if (typeof mock.implementation === 'function') {
            return mock.implementation(...args);
        }
        return returnValue;
    };
    
    mock.calls = [];
    mock.callCount = 0;
    mock.mockReturnValue = (value) => {
        mock.implementation = () => value;
        return mock;
    };
    mock.mockImplementation = (fn) => {
        mock.implementation = fn;
        return mock;
    };
    mock.mockReset = () => {
        mock.calls = [];
        mock.callCount = 0;
        mock.implementation = undefined;
    };
    
    return mock;
}

// Instância global do framework
window.TestFramework = TestFramework;
window.expect = expect;
window.waitFor = waitFor;
window.createMock = createMock;

// Alias globais para compatibilidade
window.describe = function(name, callback) {
    if (!window.testRunner) {
        window.testRunner = new TestFramework();
    }
    window.testRunner.describe(name, callback);
};

window.it = function(name, callback) {
    if (!window.testRunner) {
        window.testRunner = new TestFramework();
    }
    window.testRunner.it(name, callback);
};

window.beforeEach = function(callback) {
    if (!window.testRunner) {
        window.testRunner = new TestFramework();
    }
    window.testRunner.beforeEach(callback);
};

window.afterEach = function(callback) {
    if (!window.testRunner) {
        window.testRunner = new TestFramework();
    }
    window.testRunner.afterEach(callback);
};

// Função para executar todos os testes
window.runTests = function() {
    if (window.testRunner) {
        return window.testRunner.run();
    }
    console.log('Nenhum teste definido!');
};

console.log('📚 Framework de Testes carregado. Use describe(), it(), expect() para criar testes.');
console.log('🚀 Execute runTests() para rodar todos os testes.');
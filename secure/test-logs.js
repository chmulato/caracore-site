/**
 * Script de teste para validar acesso aos logs OIDC
 * Execute no console do navegador para verificar se tudo está funcionando
 */

console.log('🔍 Testando Sistema de Logs OIDC...\n');

// Função de teste principal
function testarLogsOIDC() {
    const resultados = [];
    
    // Teste 1: Verificar se o logger existe
    if (typeof window.OIDCLogger !== 'undefined') {
        resultados.push('✅ OIDCLogger carregado');
    } else {
        resultados.push('❌ OIDCLogger não encontrado');
        return resultados;
    }
    
    // Teste 2: Verificar interface simplificada
    if (typeof window.logOIDC !== 'undefined') {
        resultados.push('✅ Interface logOIDC disponível');
    } else {
        resultados.push('❌ Interface logOIDC não encontrada');
    }
    
    // Teste 3: Verificar se há logs
    const totalLogs = window.OIDCLogger.logs?.length || 0;
    if (totalLogs > 0) {
        resultados.push(`✅ ${totalLogs} logs encontrados`);
    } else {
        resultados.push('⚠️ Nenhum log encontrado ainda');
    }
    
    // Teste 4: Verificar métodos principais
    const metodos = ['error', 'warn', 'info', 'debug', 'authEvent', 'authError'];
    const metodosOk = metodos.filter(m => typeof window.logOIDC[m] === 'function');
    resultados.push(`✅ Métodos disponíveis: ${metodosOk.length}/${metodos.length}`);
    
    // Teste 5: Verificar persistência
    try {
        const saved = localStorage.getItem('oidc_logs');
        if (saved) {
            resultados.push('✅ Persistência no localStorage funcionando');
        } else {
            resultados.push('⚠️ Nenhum log salvo no localStorage ainda');
        }
    } catch (e) {
        resultados.push('❌ Erro ao acessar localStorage: ' + e.message);
    }
    
    // Teste 6: Gerar log de teste
    try {
        window.logOIDC.info('Teste de log', { teste: true, timestamp: new Date() });
        resultados.push('✅ Geração de log funcionando');
    } catch (e) {
        resultados.push('❌ Erro ao gerar log: ' + e.message);
    }
    
    return resultados;
}

// Executar testes
const resultados = testarLogsOIDC();
console.log(resultados.join('\n'));

// Mostrar resumo se disponível
if (window.logOIDC) {
    console.log('\n📊 Resumo da Sessão:');
    console.log(window.logOIDC.summary());
    
    console.log('\n🔗 Links Úteis:');
    console.log('Interface Web: /secure/admin-logs.html');
    console.log('Export JSON: window.logOIDC.export("json")');
    console.log('Export CSV: window.logOIDC.export("csv")');
    console.log('Limpar logs: window.logOIDC.clear()');
}

// Bookmarklet pronto para usar
const bookmarklet = `javascript:(function(){
    if(!window.OIDCLogger){
        alert('Sistema de logs não encontrado nesta página');
        return;
    }
    const summary = window.logOIDC.summary();
    const errors = window.OIDCLogger.logs.filter(l=>l.level==='ERROR').slice(-5);
    let report = '🔍 LOGS OIDC - ' + summary.sessionId + '\\n\\n';
    report += '📊 Total: ' + summary.totalLogs + ' | Erros: ' + (summary.levels.ERROR||0) + ' | Provider: ' + summary.provider + '\\n';
    report += '⏱️ Duração: ' + Math.floor(summary.duration/60000) + 'min\\n\\n';
    if(errors.length>0){
        report += '❌ ÚLTIMOS ERROS:\\n';
        errors.forEach(e=>report+='• ' + e.message + ' (' + new Date(e.timestamp).toLocaleTimeString() + ')\\n');
    } else {
        report += '✅ Nenhum erro recente';
    }
    if(confirm(report + '\\n\\nBaixar logs completos?')){
        window.logOIDC.export('json');
    }
})();`;

console.log('\n📌 Bookmarklet (adicione aos favoritos):');
console.log(bookmarklet);

export { testarLogsOIDC, bookmarklet };
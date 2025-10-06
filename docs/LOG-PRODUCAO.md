# 📊 Guia de Acesso aos Logs OIDC em Produção

## 🚀 **Métodos de Acesso aos Logs**

### **1. Interface Web Administrativa** ⭐ **RECOMENDADO**

Acesse diretamente no navegador:

```
https://www.caracore.com.br/secure/admin-logs.html
```

**Recursos:**

- ✅ Interface visual completa
- ✅ Filtros por nível, provider, data
- ✅ Estatísticas em tempo real
- ✅ Export em JSON/CSV/Texto
- ✅ Auto-refresh a cada 30s
- ✅ Busca por texto

### **2. Console do Navegador** 🛠️

Abra DevTools (F12) e use:

```javascript
// Resumo rápido da sessão
window.logOIDC.summary()

// Ver todos os logs
console.table(window.OIDCLogger.logs)

// Apenas erros
window.OIDCLogger.logs.filter(log => log.level === 'ERROR')

// Logs da última hora
const oneHourAgo = new Date(Date.now() - 3600000);
window.OIDCLogger.logs.filter(log => new Date(log.timestamp) > oneHourAgo)

// Download dos logs
window.logOIDC.export('json')
```

### **3. API Programática** 🔧

Use a API para integrações:

```javascript
// Carregar API se não estiver disponível
const script = document.createElement('script');
script.src = '/secure/api-logs.js';
document.head.appendChild(script);

// Usar API
window.OIDCLogsAPI.getSummary()
window.OIDCLogsAPI.getErrors(5)
window.OIDCLogsAPI.getHealthCheck()
```

### **4. Bookmarklet para Acesso Rápido** 📌

Adicione este bookmarklet nos favoritos:

```javascript
javascript:(function(){
    if(!window.OIDCLogger){
        alert('Sistema de logs não encontrado nesta página');
        return;
    }
    const summary = window.logOIDC.summary();
    const errors = window.OIDCLogger.logs.filter(l=>l.level==='ERROR').slice(-5);
    let report = `🔍 LOGS OIDC - ${summary.sessionId}\n\n`;
    report += `📊 Total: ${summary.totalLogs} | Erros: ${summary.levels.ERROR||0} | Provider: ${summary.provider}\n`;
    report += `⏱️ Duração: ${Math.floor(summary.duration/60000)}min\n\n`;
    if(errors.length>0){
        report += `❌ ÚLTIMOS ERROS:\n`;
        errors.forEach(e=>report+=`• ${e.message} (${new Date(e.timestamp).toLocaleTimeString()})\n`);
    } else {
        report += `✅ Nenhum erro recente`;
    }
    if(confirm(report + '\n\nBaixar logs completos?')){
        window.logOIDC.export('json');
    }
})();
```

### **5. Monitoramento Automático** 📈

Para monitoramento contínuo, adicione ao seu código:

```javascript
// Verificar erros a cada 5 minutos
setInterval(() => {
    const errors = window.OIDCLogger.logs
        .filter(log => log.level === 'ERROR')
        .filter(log => Date.now() - new Date(log.timestamp) < 300000); // 5 min
    
    if (errors.length > 0) {
        console.warn(`🚨 ${errors.length} erros OIDC nos últimos 5 minutos`);
        // Enviar para sistema de monitoramento
        // fetch('/api/alerts', { method: 'POST', body: JSON.stringify(errors) });
    }
}, 300000);
```

## 🔍 **Cenários de Troubleshooting**

### **Problema: Login não funciona**
```javascript
// Ver erros de autenticação
window.OIDCLogger.logs.filter(log => 
    log.message.includes('auth') || log.level === 'ERROR'
).slice(-10)
```

### **Problema: Token expira muito rápido**
```javascript
// Ver eventos de token
window.OIDCLogger.logs.filter(log => 
    log.message.includes('token') || log.message.includes('expire')
)
```

### **Problema: Provider específico não funciona**
```javascript
// Ver logs de um provider específico
window.OIDCLogger.logs.filter(log => 
    log.data?.provider === 'google' || log.context?.currentProvider === 'google'
)
```

## 📱 **Acesso Mobile/Remoto**

### **Via URL Direta:**
```
https://seu-site.com/secure/admin-logs.html
```

### **Via JavaScript no console mobile:**
```javascript
// Resumo rápido
console.log(JSON.stringify(window.logOIDC.summary(), null, 2))

// Download via data URL
const data = window.logOIDC.export('json');
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
window.open(url);
```

## 🚨 **Alertas Críticos**

O sistema automaticamente:
- ✅ Salva logs no localStorage
- ✅ Captura erros JavaScript globais
- ✅ Rastreia promises rejeitadas
- ✅ Monitora eventos de token
- ✅ Registra mudanças de provider

### **Configurar Nível de Log para Produção:**
```javascript
// Produção: apenas warnings e erros
window.logOIDC.setLevel('WARN')

// Debug: todos os níveis
window.logOIDC.setLevel('DEBUG')
```

## 🔧 **Integração com Sistemas Externos**

### **Enviar logs para servidor:**
```javascript
function enviarLogsParaServidor() {
    const logs = window.logOIDC.export('json');
    
    fetch('/api/logs/oidc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: logs
    });
}

// Enviar automaticamente em caso de erro
window.addEventListener('error', () => {
    setTimeout(enviarLogsParaServidor, 1000);
});
```

### **Webhook para Slack/Teams:**
```javascript
function alertarEquipe(logs) {
    const errors = logs.filter(log => log.level === 'ERROR');
    if (errors.length > 0) {
        fetch('https://hooks.slack.com/seu-webhook', {
            method: 'POST',
            body: JSON.stringify({
                text: `🚨 ${errors.length} erros OIDC detectados`,
                attachments: [{
                    color: 'danger',
                    text: errors.map(e => e.message).join('\n')
                }]
            })
        });
    }
}
```

---

**💡 Dica:** Para produção, recomende usar a **Interface Web** (`/secure/admin-logs.html`) que oferece a melhor experiência de usuário para análise de logs.
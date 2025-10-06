# 🌐 Guia: Verificação de Domínio no Azure via DNS TXT

## 📋 **VISÃO GERAL**

A verificação de domínio no Azure via registro DNS TXT é o método mais seguro e confiável. Você adiciona um registro especial no DNS do seu domínio que prova que você é o proprietário.

---

## 🎯 **PASSO 1: Iniciar Verificação no Azure Portal**

### **1.1 Acessar o Azure Portal**

1. Vá para: [https://portal.azure.com]
2. Faça login com sua conta Microsoft
3. No menu lateral, procure por **"Azure Active Directory"** ou **"Microsoft Entra ID"**

### **1.2 Adicionar Domínio Personalizado**

1. No painel do Entra ID, clique em **"Custom domain names"**
2. Clique em **"+ Add custom domain"**
3. Digite: **`caracore.com.br`**
4. Clique em **"Add domain"**

### **1.3 Escolher Método de Verificação**

1. Será exibida uma tela com opções de verificação
2. Selecione **"Add a TXT record to the domain DNS"**
3. O Azure irá gerar as informações necessárias

---

## 🔧 **PASSO 2: Obter Informações do Registro TXT**

### **O Azure fornecerá algo como:**

```
Record Type: TXT
Name: @  (ou deixe em branco, ou use caracore.com.br)
Value: MS=ms12345678  (valor único gerado pelo Azure)
TTL: 3600 (ou padrão do seu provedor)
```

### **📝 Anote estas informações:**

- **Tipo**: TXT
- **Nome/Host**: @ ou caracore.com.br
- **Valor**: MS=ms##### (valor específico do Azure)
- **TTL**: 3600 (1 hora)

---

## 🌐 **PASSO 3: Adicionar Registro no seu Provedor DNS**

### **3.1 Identifique seu Provedor DNS**

Você precisa saber **onde** o DNS do `caracore.com.br` está configurado:

#### **🔍 Para descobrir:**

```powershell
nslookup -type=NS caracore.com.br
```

#### **Provedores Comuns no Brasil:**

- **Registro.br** (se registrou direto)
- **Locaweb**
- **Hostgator**
- **GoDaddy**
- **Cloudflare**
- **Amazon Route 53**

### **3.2 Exemplos por Provedor**

#### **🔹 Registro.br (DNS.br)**

1. Acesse: https://registro.br/
2. Faça login na sua conta
3. Vá em **"Meus Domínios"** > **caracore.com.br**
4. Clique em **"DNS"** ou **"Gerenciar DNS"**
5. Procure por **"Adicionar Registro"** ou **"Add Record"**
6. Selecione **"TXT"**
7. Configure:
   - **Nome**: @ (ou deixe vazio)
   - **Valor**: MS=ms##### (valor do Azure)
   - **TTL**: 3600

#### **🔹 Cloudflare**

1. Acesse: https://dash.cloudflare.com/
2. Selecione o domínio **caracore.com.br**
3. Vá para a aba **"DNS"**
4. Clique em **"Add record"**
5. Configure:
   - **Type**: TXT
   - **Name**: @ (ou caracore.com.br)
   - **Content**: MS=ms##### (valor do Azure)
   - **TTL**: Auto ou 3600

#### **🔹 Locaweb**

1. Acesse o painel de controle da Locaweb
2. Vá em **"Domínios"** > **"Gerenciar DNS"**
3. Selecione **caracore.com.br**
4. Clique em **"Adicionar Registro"**
5. Configure:
   - **Tipo**: TXT
   - **Host**: @ (ou vazio)
   - **Valor**: MS=ms##### (valor do Azure)

#### **🔹 GoDaddy**

1. Acesse: https://account.godaddy.com/
2. Vá em **"My Products"** > **"DNS"**
3. Encontre **caracore.com.br** e clique em **"DNS"**
4. Clique em **"Add"** (botão +)
5. Configure:
   - **Type**: TXT
   - **Host**: @ (ou caracore)
   - **TXT Value**: MS=ms##### (valor do Azure)
   - **TTL**: 1 Hour

---

## ⏰ **PASSO 4: Aguardar Propagação**

### **4.1 Tempo de Propagação**

- **Mínimo**: 15-30 minutos
- **Típico**: 2-4 horas
- **Máximo**: 24-48 horas

### **4.2 Verificar se Propagou**

#### **Usando PowerShell:**

```powershell
nslookup -type=TXT caracore.com.br
```

#### **Usando site online:**

- [https://toolbox.googleapps.com/apps/dig/]
- [https://www.whatsmydns.net/]
- [https://dnschecker.org/]

### **4.3 O que procurar:**

Você deve ver algo como:

```
caracore.com.br    text = "MS=ms12345678"
```

---

## ✅ **PASSO 5: Completar Verificação no Azure**

### **5.1 Voltar ao Azure Portal**

1. Volte para a tela de verificação do domínio
2. O Azure ainda deve estar mostrando as instruções
3. Clique em **"Verify"** ou **"Verificar"**

### **5.2 Se a Verificação Falhar**

- **Aguarde mais tempo** (até 24h)
- **Verifique se o registro** está correto
- **Teste DNS** com as ferramentas acima
- **Tente novamente** após algumas horas

### **5.3 Verificação Bem-sucedida**

- Azure mostrará **"Domain verified successfully"**
- O domínio aparecerá como **"Verified"** na lista
- Agora você pode usar este domínio para Publisher Verification

---

## 🔧 **COMANDOS ÚTEIS PARA DIAGNÓSTICO**

### **Verificar DNS atual:**

```powershell
# Verificar registros TXT
nslookup -type=TXT caracore.com.br

# Verificar servidores DNS
nslookup -type=NS caracore.com.br

# Verificar propagação global
# Use sites como dnschecker.org
```

### **Testar específico servidor DNS:**

```powershell
nslookup -type=TXT caracore.com.br 8.8.8.8
```

---

## ⚠️ **PROBLEMAS COMUNS E SOLUÇÕES**

### **❌ "Registro não encontrado"**

- **Causa**: Ainda não propagou ou registro incorreto
- **Solução**: Aguardar mais tempo ou verificar configuração

### **❌ "Domain verification failed"**

- **Causa**: Valor do TXT incorreto
- **Solução**: Copiar exatamente o valor do Azure

### **❌ "TTL muito alto"**

- **Causa**: Cache DNS demorado
- **Solução**: Reduzir TTL para 300-3600 segundos

### **❌ "Múltiplos registros TXT"**

- **Causa**: Registros duplicados ou conflitantes
- **Solução**: Remover registros antigos, manter só o do Azure

---

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **Antes de Adicionar o Registro:**

- [ ] Anotei corretamente o valor MS=ms##### do Azure
- [ ] Identifiquei onde está o DNS do domínio
- [ ] Tenho acesso ao painel de controle DNS

### **Após Adicionar o Registro:**

- [ ] Registro TXT adicionado corretamente
- [ ] Valor MS=ms##### confere com o Azure
- [ ] TTL configurado (3600 ou menor)
- [ ] Aguardei pelo menos 30 minutos

### **Para Testar:**

- [ ] `nslookup -type=TXT caracore.com.br` retorna o registro
- [ ] Testei em dnschecker.org
- [ ] Cliquei em "Verify" no Azure Portal

---

## 🎯 **EXEMPLO PRÁTICO**

### **Se o Azure deu:**

```text
Type: TXT
Name: @
Value: MS=ms87654321
```

### **No seu DNS, adicione:**

```text
Tipo: TXT
Host: @ (ou caracore.com.br)
Valor: MS=ms87654321
TTL: 3600
```

### **Para testar:**

```powershell
nslookup -type=TXT caracore.com.br
```

### **Resultado esperado:**

```
caracore.com.br    text = "MS=ms87654321"
```

---

## 💡 **DICAS IMPORTANTES**

1. **Não remova** o registro TXT após a verificação - mantenha-o
2. **Copie exatamente** o valor fornecido pelo Azure
3. **Use @** ou **caracore.com.br** como host/name
4. **Aguarde pacientemente** - DNS pode demorar
5. **Teste antes** de verificar no Azure

**Precisa de ajuda com algum provedor específico?** 🤝
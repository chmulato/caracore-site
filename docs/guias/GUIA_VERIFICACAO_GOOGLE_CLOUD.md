# 🔧 Guia: Verificação de Permissões no Google Cloud Console

## 📋 **PASSO 1: Acessar o Google Cloud Console**

1. **Abra seu navegador** e vá para: https://console.cloud.google.com
2. **Faça login** com a conta Google que você usou para criar o projeto
3. **Verifique se está no projeto correto:** 
   - No topo da página, deve aparecer o nome do projeto: **"cara-core-area-51"**
   - Se não estiver, clique no nome do projeto e selecione o correto

---

## 👤 **PASSO 2: Verificar Suas Permissões Atuais**

### **Opção A: Verificação Rápida**
1. No menu lateral esquerdo, clique em **"IAM e Admin"**
2. Clique em **"IAM"**
3. **Procure seu e-mail** na lista de membros
4. **Verifique sua função:**
   - ✅ **IDEAL:** "Owner" (Proprietário) ou "Editor"
   - ⚠️ **PROBLEMA:** "Viewer" (Visualizador) ou outras funções limitadas

### **Opção B: Verificação via Menu**
1. Clique no **ícone do seu perfil** (canto superior direito)
2. Vá em **"Configurações do projeto"**
3. Verifique se você tem acesso completo às configurações

---

## 🔧 **PASSO 3: Corrigir Permissões (Se Necessário)**

### **Se Você É o Criador do Projeto:**
1. Vá para **"IAM e Admin" > "IAM"**
2. Clique no **ícone de lápis** ao lado do seu e-mail
3. Na janela que abrir:
   - Selecione **"Project"** > **"Owner"**
   - Ou **"Project"** > **"Editor"**
4. Clique em **"Salvar"**

### **Se Você NÃO É o Criador:**
1. **Entre em contato** com quem criou o projeto
2. **Peça para adicionar** seu e-mail como "Owner" ou "Editor"
3. **Instruções para quem vai te adicionar:**
   - IAM e Admin > IAM
   - Clique em "ADICIONAR"
   - Digite seu e-mail
   - Selecione função: "Project" > "Owner"
   - Salvar

---

## 🌐 **PASSO 4: Verificar Domínio (Após Ter Permissões)**

### **Método 1: Via Google Cloud Console**
1. No menu lateral, vá para **"APIs e Serviços"**
2. Clique em **"Credenciais"**
3. Procure por **"Verificação de domínio"** ou **"Domain verification"**
4. Clique em **"Adicionar domínio"** ou **"Add domain"**
5. Digite: **caracore.com.br**
6. Siga as instruções para verificação

### **Método 2: Via Google Search Console (Recomendado)**
1. Vá para: https://search.google.com/search-console
2. Clique em **"Adicionar propriedade"**
3. Selecione **"Domínio"**
4. Digite: **caracore.com.br**
5. **Escolha um método de verificação:**

#### **🔹 Opção A: Registro DNS (Mais Seguro)**
- Adicione um registro TXT no DNS do seu domínio
- Use as informações fornecidas pelo Google
- Pode levar até 24h para propagar

#### **🔹 Opção B: Upload de Arquivo HTML**
- Baixe o arquivo fornecido pelo Google
- Faça upload para a raiz do seu site
- Exemplo: `https://caracore.com.br/google123abc.html`

#### **🔹 Opção C: Meta Tag HTML**
- Adicione uma meta tag no `<head>` do seu index.html
- Exemplo: `<meta name="google-site-verification" content="abc123..." />`

---

## 📧 **PASSO 5: Confirmar com o Google**

### **Depois de Verificar o Domínio:**
1. **Volte ao e-mail original** do Google (o primeiro que você recebeu)
2. **Clique em "Responder"**
3. **Use esta mensagem:**

```
Dear Google Third Party Data Safety Team,

I am writing to confirm that we have completed the domain verification process for https://www.caracore.com.br/.

Updates completed:
✅ Privacy policy link added to homepage footer
✅ Domain ownership verified through Google Search Console
✅ Project permissions confirmed (Owner/Editor access)

The verification has been completed and we are ready for the next steps in the OAuth verification process.

Thank you for your guidance.

Best regards,
[Seu Nome]
Cara-Core Informática
```

---

## 🔍 **PROBLEMAS COMUNS E SOLUÇÕES**

### **❌ "Não tenho acesso ao IAM"**
- **Solução:** Você não tem permissões suficientes. Contacte quem criou o projeto.

### **❌ "Não encontro meu projeto"**
- **Solução:** Verifique se está logado com a conta correta do Google.

### **❌ "Verificação de domínio falha"**
- **Solução:** Verifique se o arquivo/DNS foi configurado corretamente. Aguarde até 24h.

### **❌ "Não tenho acesso ao DNS do domínio"**
- **Solução:** Contacte quem gerencia o domínio caracore.com.br.

---

## 📞 **PRECISA DE AJUDA?**

Se encontrar dificuldades:
1. **Anote exatamente** onde travou
2. **Tire screenshots** das telas
3. **Me informe** qual erro apareceu
4. **Posso ajudar** com passos mais específicos

---

## ⏰ **TEMPO ESTIMADO**
- **Com permissões corretas:** 15-30 minutos
- **Precisando ajustar permissões:** +30 minutos
- **Aguardando propagação DNS:** até 24 horas

**BOA SORTE! 🚀**
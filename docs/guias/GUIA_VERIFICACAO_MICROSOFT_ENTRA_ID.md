# 🔧 Guia: Verificação de Aplicativo no Microsoft Entra ID (Azure AD)

## 📋 **VISÃO GERAL**

Assim como o Google, a Microsoft também tem um processo de verificação para aplicativos que acessam dados de usuários através do Microsoft Entra ID (antigo Azure AD). Este processo é necessário para remover a tela de "aplicativo não verificado".

---

## 🎯 **QUANDO É NECESSÁRIO**

### **Situações que Exigem Verificação:**

- Aplicativo acessa **dados sensíveis** dos usuários
- Solicita **permissões de alto privilégio**
- Usuários veem tela de **"Aplicativo não verificado"**
- Aplicativo será usado por **organizações externas**
- Necessário para **compliance empresarial**

### **Permissões que Geralmente Requerem Verificação:**

- `User.Read.All`
- `Directory.Read.All`
- `Mail.Read`
- `Calendars.Read`
- `Files.Read.All`
- Qualquer permissão de **Application** (não delegada)

---

## 🏢 **PROCESSO DE VERIFICAÇÃO DA MICROSOFT**

### **📍 PASSO 1: Microsoft Partner Network (MPN)**

1. **Cadastre-se no MPN** (se ainda não for):
   - Acesse: [https://partner.microsoft.com/]
   - Crie conta empresarial
   - Verifique identidade da empresa

2. **Associe sua aplicação ao MPN**:
   - No Azure Portal, vá para **App Registrations**
   - Selecione sua aplicação
   - Em **Branding**, adicione **MPN ID**

### **📍 PASSO 2: Documentação Necessária**

#### **🔹 Documentos Obrigatórios:**

- **Privacy Policy** (Política de Privacidade) ✅ *Você já tem*
- **Terms of Service** (Termos de Serviço) ✅ *Você já tem*
- **Support Contact** (Contato de Suporte)
- **Publisher Domain** (Domínio Verificado)

#### **🔹 Informações Técnicas:**

- **Descrição detalhada** do aplicativo
- **Justificativa** para cada permissão solicitada
- **Fluxo de autenticação** documentado
- **Arquitetura de segurança**

### **📍 PASSO 3: Verificação de Domínio**

#### **Similar ao Google, mas no Azure:**

1. **Acesse Azure Portal**:
   - [https://portal.azure.com]
   - Vá para **Azure Active Directory** > **Custom domain names**

2. **Adicione seu domínio**:
   - Clique em **Add custom domain**
   - Digite: `caracore.com.br`

3. **Verifique propriedade**:
   - **Método DNS**: Adicione registro TXT
   - **Método HTML**: Upload de arquivo
   - **Método Exchange**: Para domínios Office 365

### **📍 PASSO 4: App Registration Configuration**

1. **No Azure Portal**:
   - **App Registrations** > Sua aplicação
   - **Branding** > Configure:
     - Logo da empresa
     - Privacy policy URL: `https://caracore.com.br/politica/politica-privacidade.html`
     - Terms of service URL: `https://caracore.com.br/politica/termos-servico.html`
     - Publisher domain: `caracore.com.br`

2. **API Permissions**:
   - Documente **justificativa** para cada permissão
   - Use **princípio do menor privilégio**
   - Prefira **delegated** ao invés de **application** permissions

---

## 📧 **PROCESSO DE SUBMISSÃO**

### **📍 PASSO 5: Publisher Verification**

1. **Acesse o processo**:
   - Azure Portal > **App Registrations**
   - Sua aplicação > **Branding**
   - Clique em **Add verified domain**

2. **Submeta documentação**:
   - Preencha formulário detalhado
   - Anexe documentos necessários
   - Aguarde análise (7-14 dias úteis)

### **📍 PASSO 6: App Compliance (Se Necessário)**

Para aplicativos de alto risco:

1. **Microsoft 365 Certification**
2. **CASA (Cloud Application Security Assessment)**
3. **Penetration Testing Report**

---

## 🆚 **COMPARAÇÃO: GOOGLE vs MICROSOFT**

| Aspecto | Google OAuth | Microsoft Entra ID |
|---------|--------------|-------------------|
| **Tempo** | 5-10 dias | 7-14 dias |
| **Complexidade** | Moderada | Alta |
| **Documentação** | Básica | Extensa |
| **Custo** | Gratuito | Gratuito (básico) |
| **MPN Required** | Não | Sim (recomendado) |
| **Domain Verification** | Sim | Sim |
| **Privacy Policy** | Obrigatório | Obrigatório |

---

## 📋 **CHECKLIST PARA MICROSOFT**

### **✅ Pré-requisitos (Você já tem):**

- [x] Domínio verificado (`caracore.com.br`)
- [x] Política de privacidade
- [x] Termos de serviço
- [x] Aplicação funcional

### **🔄 Próximos Passos:**

1. **[ ] Cadastro no MPN**
   - Criar conta no Microsoft Partner Network
   - Verificar identidade empresarial

2. **[ ] Configurar App Registration**
   - Adicionar branding completo
   - Configurar URLs das políticas
   - Documentar permissões

3. **[ ] Verificar domínio no Azure**
   - Adicionar caracore.com.br
   - Completar verificação DNS/HTML

4. **[ ] Submeter para Publisher Verification**
   - Preencher formulário
   - Anexar documentação
   - Aguardar aprovação

---

## ⚠️ **DIFERENÇAS IMPORTANTES**

### **Microsoft é Mais Rigorosa:**

- **MPN Membership** quase obrigatória
- **Documentação técnica** mais detalhada
- **Processo de compliance** mais complexo
- **Tempo de análise** maior

### **Benefícios da Verificação:**

- Remove tela "Aplicativo não verificado"
- Melhora confiança dos usuários
- Permite acesso a APIs sensíveis
- Facilita adoção empresarial

---

## 🚀 **RECOMENDAÇÕES PARA SEU CASO**

### **Prioridade Imediata:**

1. **Complete primeiro** a verificação do Google (quase pronto)
2. **Inicie MPN registration** em paralelo
3. **Configure branding** no Azure App Registration

### **Estratégia:**

- **Reutilize** documentação do Google
- **Adapte** políticas para Microsoft
- **Documente** bem as permissões necessárias

### **Timeline Sugerida:**

- **Semana 1**: MPN registration + Azure domain verification
- **Semana 2**: App registration branding + documentation
- **Semana 3**: Submit for publisher verification
- **Semana 4-5**: Review process

---

## 📞 **RECURSOS E LINKS**

### **Documentação Oficial:**

- **Publisher Verification**: https://docs.microsoft.com/en-us/azure/active-directory/develop/publisher-verification-overview
- **MPN**: https://partner.microsoft.com/
- **App Compliance**: https://docs.microsoft.com/en-us/microsoft-365-app-certification/

### **Ferramentas:**

- **Azure Portal**: https://portal.azure.com
- **Partner Center**: https://partner.microsoft.com/dashboard
- **App Compliance Portal**: https://appcompliance.microsoft.com/

---

## 💡 **DICA IMPORTANTE**

O processo da Microsoft é **mais burocrático** que o Google, mas seguindo os passos sistematicamente, você consegue. O MPN é quase obrigatório, então comece por lá!

**Quer que eu ajude com algum passo específico?** 🤝
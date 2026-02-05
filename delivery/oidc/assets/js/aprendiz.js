// Sistema de Aprendizado Interativo - Reino OIDC
// Gerenciamento de estado global
let gameState = {
    completedPaths: getCompletedPaths(),
    currentPath: null,
    currentCardIndex: 0,
    isFlipped: false,
    shuffledCards: []
};

// Dados dos flashcards organizados por caminho
const flashcardData = {
    iniciante: {
        title: "🌱 Caminho do Iniciante",
        description: "Fundamentos básicos com Lady OAuth, Lord OIDC e Alex Client",
        nextPath: "aventureiro",
        cards: [
            {
                character: "👑",
                question: "O que Lady OAuth representa no Reino OIDC?",
                leigo: "Lady OAuth é como uma porteira que decide quem pode entrar em cada lugar. Ela não se importa com quem você é, só quer saber se você tem permissão.",
                tecnico: "Lady OAuth representa o protocolo OAuth 2.1, responsável pela autorização. Ela define e controla o acesso a recursos protegidos através de tokens de acesso."
            },
            {
                character: "🧙‍♂️",
                question: "Qual é a diferença entre Lady OAuth e Lord OIDC?",
                leigo: "Lady OAuth pergunta 'o que você pode fazer?', enquanto Lord OIDC responde 'quem você é'. Um cuida da permissão, o outro da identidade.",
                tecnico: "OAuth 2.1 fornece autorização (acesso a recursos), enquanto OIDC adiciona autenticação (verificação de identidade) através de ID tokens além dos access tokens."
            },
            {
                character: "🧑‍💼",
                question: "Qual é o papel de Alex Client no reino?",
                leigo: "Alex é como um carteiro que leva mensagens entre você e os serviços. Ele não guarda suas senhas, só pede permissão para acessar o que você autorizar.",
                tecnico: "Alex Client representa a aplicação cliente que inicia o fluxo OAuth/OIDC, redirecionando o usuário para autenticação e recebendo tokens para acessar recursos."
            },
            {
                character: "👑",
                question: "O que são tokens no contexto do Reino OIDC?",
                leigo: "Tokens são como pulseirinhas de festa que provam que você tem permissão para estar em determinados lugares. Elas expiram e precisam ser renovadas.",
                tecnico: "Tokens são strings criptograficamente seguras que representam autorização (access token) ou identidade (ID token), com tempo de expiração e escopo limitado."
            },
            {
                character: "🧙‍♂️",
                question: "Por que o Reino precisa de dois protocolos (OAuth + OIDC)?",
                leigo: "É como precisar de duas coisas: uma carteira de motorista (prova quem você é) e uma permissão especial (prova o que pode fazer). Cada uma tem função diferente.",
                tecnico: "OAuth resolve autorização mas não identidade. OIDC estende OAuth para incluir autenticação padronizada, fornecendo informações verificáveis sobre o usuário."
            },
            {
                character: "🧑‍💼",
                question: "Como Alex Client obtém permissão para acessar dados?",
                leigo: "Alex pede para o usuário: 'Posso acessar suas fotos?'. Se o usuário disser sim, Alex recebe uma permissão temporária, mas nunca a senha.",
                tecnico: "Através do Authorization Code Flow: Alex redireciona para o Authorization Server, usuário autentica, Alex recebe código e troca por tokens."
            },
            {
                character: "👑",
                question: "O que significa 'delegação de acesso' no OAuth?",
                leigo: "É como dar uma chave temporária da sua casa para alguém limpar apenas a sala, sem dar acesso ao quarto. Controle limitado e temporário.",
                tecnico: "Permite que aplicações acessem recursos em nome do usuário com escopo limitado, sem compartilhar credenciais, através de tokens com permissões específicas."
            },
            {
                character: "🧙‍♂️",
                question: "Qual é a principal diferença entre autenticação e autorização?",
                leigo: "Autenticação é 'quem você é' (mostrar RG), autorização é 'o que pode fazer' (ter permissão para entrar na festa VIP).",
                tecnico: "Autenticação verifica identidade do usuário (OIDC), autorização determina quais recursos o usuário/aplicação pode acessar (OAuth)."
            },
            {
                character: "🧑‍💼",
                question: "Por que Alex Client não armazena senhas de usuários?",
                leigo: "É mais seguro! É como um hotel que não guarda cópia da sua chave de casa, mas te dá uma chave temporária do quarto apenas.",
                tecnico: "Reduz superfície de ataque e responsabilidade. Senhas ficam apenas no Authorization Server especializado, cliente recebe apenas tokens limitados."
            },
            {
                character: "👑",
                question: "O que acontece quando um token expira?",
                leigo: "É como um ticket de estacionamento que vence. Você precisa renovar ou pegar um novo, mas não precisa mostrar documento de novo se tiver um refresh token.",
                tecnico: "Access token inválido, aplicação deve usar refresh token para obter novo access token, ou redirecionar usuário para nova autenticação se necessário."
            },
            {
                character: "🧙‍♂️",
                question: "Como Lord OIDC garante que as informações de identidade são confiáveis?",
                leigo: "Como um cartório que certifica documentos. Lord OIDC assina digitalmente as informações, então qualquer um pode verificar se são verdadeiras.",
                tecnico: "Através de assinatura digital (JWS) nos ID tokens usando chaves públicas/privadas, permitindo verificação criptográfica da autenticidade."
            },
            {
                character: "🧑‍💼",
                question: "Quais tipos de aplicações Alex Client pode representar?",
                leigo: "Alex pode ser qualquer app no seu celular, site que você usa, ou até aquela Smart TV que quer acessar seu Netflix.",
                tecnico: "Aplicações web (confidential), SPAs (public), mobile apps, desktop apps, ou qualquer software que precise acessar recursos protegidos."
            },
            {
                character: "👑",
                question: "O que são 'escopos' no contexto do OAuth?",
                leigo: "São como diferentes níveis de permissão. 'Ler emails' é um escopo, 'enviar emails' é outro. Você escolhe o que permitir para cada app.",
                tecnico: "Strings que definem permissões específicas que uma aplicação pode solicitar, limitando o acesso a recursos ou operações específicas."
            },
            {
                character: "🧙‍♂️",
                question: "Quais informações estão normalmente em um ID Token?",
                leigo: "Informações básicas como seu nome, email, e um número único que representa você. Nada muito pessoal, só o necessário para te identificar.",
                tecnico: "Claims como sub (user ID), email, name, iat/exp (timestamps), aud (audience), iss (issuer), e outros atributos do usuário."
            },
            {
                character: "🧑‍💼",
                question: "Como Alex Client é identificado no sistema?",
                leigo: "Alex tem uma carteirinha única (Client ID) que o identifica. É como um número de matrícula que prova que ele é um app válido.",
                tecnico: "Através do Client ID (público) e opcionalmente Client Secret (para apps confidential), registrados previamente no Authorization Server."
            },
            {
                character: "👑",
                question: "Por que Lady OAuth não se preocupa com identidade?",
                leigo: "Ela é especialista em uma coisa só: decidir permissões. É como um segurança que só verifica ingressos, não documentos de identidade.",
                tecnico: "OAuth foi projetado especificamente para autorização. Identidade é responsabilidade do OIDC, mantendo separação clara de responsabilidades."
            },
            {
                character: "🧙‍♂️",
                question: "Quando Lord OIDC entra em ação no fluxo?",
                leigo: "Quando você faz login, Lord OIDC é chamado para confirmar quem você é e preparar uma identidade assinada para entregar junto com as permissões.",
                tecnico: "Durante o fluxo de autenticação quando 'openid' está no escopo solicitado, resultando na emissão de ID token junto com access token."
            },
            {
                character: "🧑‍💼",
                question: "Alex Client pode acessar dados sem o usuário estar presente?",
                leigo: "Depende do tipo de permissão. Com refresh tokens, Alex pode renovar acessos sem incomodar você, mas sempre dentro do que você autorizou inicialmente.",
                tecnico: "Sim, através de refresh tokens (quando suportado) ou client credentials flow (para acesso a recursos próprios da aplicação)."
            },
            {
                character: "👑",
                question: "Qual é a principal evolução do OAuth 2.0 para 2.1?",
                leigo: "OAuth 2.1 é como uma versão 'limpa' que remove coisas perigosas e torna obrigatórias as práticas de segurança que antes eram opcionais.",
                tecnico: "OAuth 2.1 remove fluxos inseguros (implicit, password), torna PKCE obrigatório, e consolida melhores práticas de segurança."
            },
            {
                character: "🧙‍♂️",
                question: "Como garantir que um sistema OAuth/OIDC é seguro?",
                leigo: "Use sempre conexões seguras (HTTPS), verifique se os tokens são verdadeiros, e nunca guarde senhas - só tokens temporários.",
                tecnico: "Implementar PKCE, validar assinaturas JWT, usar HTTPS, gerenciar expiração de tokens, e seguir as especificações OAuth 2.1 e OIDC."
            }
        ]
    },
    aventureiro: {
        title: "⚔️ Caminho do Aventureiro",
        description: "Segurança e tokens com Pixie PKCE, IDA Token e Ace Token",
        nextPath: "mestre",
        cards: [
            {
                character: "🧚",
                question: "O que Pixie PKCE faz para proteger o Reino?",
                leigo: "Pixie é como uma fada protetora que cria senhas secretas temporárias. Ela garante que apenas quem iniciou o processo pode completá-lo.",
                tecnico: "PKCE gera code_verifier (segredo local) e code_challenge (hash público) para garantir que apenas o cliente original pode trocar o authorization code por tokens."
            },
            {
                character: "🧝‍♀️",
                question: "Qual é a missão de IDA Token no reino?",
                leigo: "IDA é a mensageira que carrega sua identidade de forma segura. Ela tem sua 'digital' criptográfica que prova que as informações são verdadeiras.",
                tecnico: "ID Token é um JWT que contém claims sobre a identidade do usuário autenticado, assinado digitalmente pelo Authorization Server para verificação."
            },
            {
                character: "🛡️",
                question: "Como Ace Token difere de IDA Token?",
                leigo: "IDA diz 'quem você é', Ace diz 'o que pode fazer'. IDA é como seu RG, Ace é como uma credencial de acesso a áreas restritas.",
                tecnico: "ID Token contém informações de identidade (claims sobre o usuário), Access Token contém autorização (permissões para acessar recursos/APIs)."
            },
            {
                character: "🧚",
                question: "Por que PKCE é obrigatório no OAuth 2.1?",
                leigo: "Porque protege contra ladrões que podem interceptar códigos no caminho. É como lacrar uma carta registrada para garantir que chegue íntegra.",
                tecnico: "Previne authorization code interception attacks, especialmente importante para aplicações públicas (mobile/SPA) que não podem guardar secrets seguros."
            },
            {
                character: "🧝‍♀️",
                question: "Como verificar se um ID Token é válido?",
                leigo: "É como verificar se uma cédula de dinheiro é verdadeira: você checa a assinatura, a data de validade e se foi emitida pelo banco certo.",
                tecnico: "Verificar assinatura JWS usando chave pública do issuer, validar iat/exp timestamps, conferir audience (aud) e issuer (iss) claims."
            },
            {
                character: "🛡️",
                question: "Onde e como Ace Token deve ser armazenado?",
                leigo: "Ace deve ser guardado em local seguro (nunca em local público como localStorage) e sempre tratado como informação ultra-sensível.",
                tecnico: "Preferencialmente server-side em session storage, ou client-side em httpOnly cookies. Nunca em localStorage ou código JavaScript acessível."
            },
            {
                character: "🧚",
                question: "Como Pixie PKCE cria o desafio criptográfico?",
                leigo: "Pixie inventa uma senha secreta aleatória, depois cria uma versão 'embaralhada' dessa senha que pode ser compartilhada publicamente.",
                tecnico: "Gera code_verifier aleatório (43-128 chars), depois calcula code_challenge = BASE64URL(SHA256(code_verifier)) para enviar na authorization request."
            },
            {
                character: "🧝‍♀️",
                question: "Quais claims são obrigatórios em um ID Token?",
                leigo: "Todo ID Token deve ter pelo menos: quem emitiu, para quem foi feito, quando expira, quando foi criado, e um identificador único do usuário.",
                tecnico: "Claims obrigatórios: iss (issuer), sub (subject), aud (audience), exp (expiration), iat (issued at). Outros claims são opcionais."
            },
            {
                character: "🛡️",
                question: "Por que Ace Token tem vida curta?",
                leigo: "Como um passe temporário de obra: quanto menos tempo nas mãos erradas, menor o risco. Se for roubado, logo fica inútil.",
                tecnico: "Reduz janela de exposição em caso de comprometimento. Tokens de vida curta limitam danos e forçam renovação regular via refresh tokens."
            },
            {
                character: "🧚",
                question: "Em que momento do fluxo Pixie PKCE atua?",
                leigo: "Pixie aparece no início (criando o desafio secreto) e no final (verificando se quem voltou é realmente quem começou a jornada).",
                tecnico: "Na authorization request (enviando code_challenge) e na token request (enviando code_verifier para validação pelo Authorization Server)."
            },
            {
                character: "🧝‍♀️",
                question: "IDA Token pode ser usado para acessar APIs?",
                leigo: "Não! IDA é apenas para identificação. É como usar RG para tentar entrar em área restrita - você precisa de uma credencial de acesso específica.",
                tecnico: "Não. ID Token é apenas para identificação do usuário. Para acessar APIs, deve-se usar Access Token que contém as permissões necessárias."
            },
            {
                character: "🛡️",
                question: "Como Ace Token sabe quais recursos pode acessar?",
                leigo: "Ace carrega uma lista invisível de permissões (escopos). É como um crachá que tem escrito quais andares do prédio você pode visitar.",
                tecnico: "Através de scopes incluídos no token (JWT claims ou validação server-side), que definem quais recursos/operações estão autorizados."
            },
            {
                character: "🧚",
                question: "Pixie PKCE protege contra quais tipos de ataques?",
                leigo: "Protege contra espiões que ficam no meio do caminho tentando roubar códigos de autorização para se passar por você.",
                tecnico: "Authorization code interception attacks, man-in-the-middle attacks, e ataques onde o authorization code é interceptado mas não o code_verifier."
            },
            {
                character: "🧝‍♀️",
                question: "Qual é a estrutura de um ID Token?",
                leigo: "IDA Token tem três partes separadas por pontos: cabeçalho (tipo de assinatura), corpo (suas informações), e assinatura (prova de autenticidade).",
                tecnico: "JWT com três partes Base64URL: header (algoritmo de assinatura), payload (claims do usuário), signature (assinatura criptográfica)."
            },
            {
                character: "🛡️",
                question: "Ace Token pode ser reutilizado indefinidamente?",
                leigo: "Não! Ace envelhece e expira como um passe de ônibus. Quando expira, você precisa de um novo ou usar o 'token de renovação' se tiver um.",
                tecnico: "Não. Access tokens têm tempo de expiração limitado. Para continuar acessando, use refresh token para obter novo access token."
            },
            {
                character: "🧚",
                question: "PKCE é necessário apenas para aplicações móveis?",
                leigo: "Não! Pixie protege todos os tipos de aplicação. Mesmo apps web se beneficiam dessa proteção extra contra interceptação.",
                tecnico: "OAuth 2.1 torna PKCE obrigatório para todos os clientes, não apenas públicos. Adiciona camada extra de segurança para todos os cenários."
            },
            {
                character: "🧝‍♀️",
                question: "Como detectar se um ID Token foi modificado?",
                leigo: "Verificando a assinatura digital. Se alguém mexeu no conteúdo, a assinatura não vai 'bater' mais, como um lacre violado.",
                tecnico: "Validando a assinatura JWS usando a chave pública do issuer. Qualquer alteração no header ou payload invalidará a assinatura."
            },
            {
                character: "🛡️",
                question: "Ace Token pode conter informações do usuário?",
                leigo: "Ace normalmente só carrega permissões, não informações pessoais. É como um crachá de acesso que não precisa ter sua foto, só as autorizações.",
                tecnico: "Pode conter claims básicos como sub (user ID), mas seu propósito primário é autorização (scopes). Informações detalhadas ficam no ID Token."
            },
            {
                character: "🧚",
                question: "Como Pixie PKCE evita replay attacks?",
                leigo: "Cada code_verifier é único e usado apenas uma vez. É como um ticket de cinema: mesmo que alguém copie, só funciona para uma sessão específica.",
                tecnico: "Code_verifier é gerado aleatoriamente para cada fluxo e pode ser usado apenas uma vez. Authorization Server invalida códigos após primeiro uso."
            },
            {
                character: "🧝‍♀️",
                question: "IDA Token deve ser enviado em URLs?",
                leigo: "Nunca! URLs ficam em logs, histórico do navegador e podem vazar. IDA deve viajar apenas por canais seguros e protegidos.",
                tecnico: "Não. ID Tokens devem ser transmitidos apenas via POST request body ou headers, nunca em URL parameters devido a riscos de exposição."
            }
        ]
    },
    mestre: {
        title: "🏆 Caminho do Mestre",
        description: "Implementação prática com Seraph Resource e Devia Desenvolvedora",
        nextPath: null, // Último caminho
        cards: [
            {
                character: "🏦",
                question: "Como Seraph Resource valida tokens recebidos?",
                leigo: "Seraph é um guarda rigoroso que verifica se o token é verdadeiro, não expirou, e se dá permissão para o que está sendo pedido. Três verificações sempre.",
                tecnico: "Valida assinatura JWT, verifica expiração (exp claim), confirma audience (aud), issuer (iss), e valida scopes para a operação solicitada."
            },
            {
                character: "👩‍💻",
                question: "Qual é o primeiro passo que Devia deve fazer ao implementar OIDC?",
                leigo: "Devia deve primeiro entender o que sua aplicação precisa: só saber quem é o usuário, ou também acessar dados dele em outros lugares.",
                tecnico: "Definir requirements: apenas autenticação (ID token) ou também autorização (access token), identificar scopes necessários e escolher o fluxo apropriado."
            },
            {
                character: "🏦",
                question: "Como Seraph deve lidar com tokens expirados?",
                leigo: "Como um porteiro que não aceita documento vencido: Seraph deve negar acesso e pedir para a pessoa renovar suas credenciais.",
                tecnico: "Retornar HTTP 401 Unauthorized com header WWW-Authenticate indicando token expirado, forçando cliente a renovar via refresh token."
            },
            {
                character: "👩‍💻",
                question: "Como Devia pode implementar logout seguro?",
                leigo: "Devia deve 'avisar' todos os lugares onde o usuário está logado, invalidar tokens, e limpar todas as informações guardadas localmente.",
                tecnico: "Implementar revogação de tokens no Authorization Server, limpar sessões locais, e opcionalmente usar RP-initiated logout para single logout."
            },
            {
                character: "🏦",
                question: "Quais informações Seraph deve logar para auditoria?",
                leigo: "Seraph deve anotar quem acessou o quê, quando, e se deu certo ou não. Como um livro de visitantes detalhado para segurança.",
                tecnico: "Timestamp, user ID (sub), client ID, recursos acessados, scopes utilizados, IP address, e resultado da operação (sucesso/falha)."
            },
            {
                character: "👩‍💻",
                question: "Como Devia deve escolher entre diferentes provedores de identidade?",
                leigo: "Devia deve considerar: onde estão seus usuários (Google, Microsoft, Facebook), que informações precisa, e qual oferece melhor segurança para seu caso.",
                tecnico: "Avaliar compliance (SOC2, ISO27001), scopes disponíveis, SLA/uptime, latência, custos, documentação, e compatibilidade com OAuth 2.1/OIDC."
            },
            {
                character: "🏦",
                question: "Como Seraph deve implementar rate limiting?",
                leigo: "Seraph deve limitar quantas vezes alguém pode bater na porta por minuto. Evita que robôs maliciosos sobrecarreguem o sistema.",
                tecnico: "Implementar rate limiting por client ID, user ID, ou IP address usando algoritmos como token bucket ou sliding window, com headers informativos."
            },
            {
                character: "👩‍💻",
                question: "Quais validações Devia deve fazer no frontend vs backend?",
                leigo: "Frontend faz verificações básicas para experiência do usuário, mas backend faz as verificações de segurança de verdade. Nunca confiar só no frontend.",
                tecnico: "Frontend: validação de formato e UX. Backend: validação criptográfica de tokens, verificação de scopes, rate limiting, e todas as validações de segurança."
            },
            {
                character: "🏦",
                question: "Como Seraph deve gerenciar chaves públicas para validação JWT?",
                leigo: "Seraph mantém uma lista atualizada das 'digitais' válidas dos emissores de tokens, verificando periodicamente se não mudaram.",
                tecnico: "Implementar JWKS (JSON Web Key Set) endpoint caching com refresh automático, validação de chaves, e fallback para descoberta via .well-known/openid_configuration."
            },
            {
                character: "👩‍💻",
                question: "Como Devia deve implementar refresh token rotation?",
                leigo: "A cada renovação, Devia descarta o ticket antigo e emite um novo. Como trocar a fechadura cada vez que empresta a chave.",
                tecnico: "A cada uso do refresh token, invalidar o token atual e emitir novo refresh token junto com access token, mantendo auditoria da cadeia."
            },
            {
                character: "🏦",
                question: "Que headers HTTP Seraph deve verificar além do Authorization?",
                leigo: "Seraph deve verificar de onde vem a requisição, que tipo de resposta espera, e se a conexão está realmente segura (HTTPS).",
                tecnico: "Content-Type, Accept, X-Forwarded-For, User-Agent para auditoria, e sempre verificar se requisição chegou via HTTPS."
            },
            {
                character: "👩‍💻",
                question: "Como Devia deve tratar erros de token em aplicações SPA?",
                leigo: "Quando token expira, Devia deve tentar renovar automaticamente. Se não conseguir, redirecionar gentilmente para login sem perder trabalho do usuário.",
                tecnico: "Implementar automatic token refresh com retry logic, graceful degradation, e preservação de estado da aplicação antes de redirect para login."
            },
            {
                character: "🏦",
                question: "Como Seraph deve implementar autorização granular?",
                leigo: "Seraph verifica não apenas se você pode entrar, mas exatamente o que pode fazer: ler, escrever, deletar, e em quais recursos específicos.",
                tecnico: "Implementar RBAC ou ABAC com scopes OAuth, resource-level permissions, e claims-based authorization para controle granular de acesso."
            },
            {
                character: "👩‍💻",
                question: "Quais métricas Devia deve monitorar em produção?",
                leigo: "Devia deve acompanhar: quantos logins por dia, quantos deram erro, tempo de resposta, e se algum comportamento estranho está acontecendo.",
                tecnico: "Token refresh rate, authentication failures, latência de validação, 401/403 errors, concurrent sessions, e throughput de APIs protegidas."
            },
            {
                character: "🏦",
                question: "Como Seraph deve lidar com Cross-Origin Requests?",
                leigo: "Seraph deve verificar se a requisição vem de um site confiável antes de aceitar, mas permitir que apps autorizados funcionem corretamente.",
                tecnico: "Configurar CORS adequadamente com origins específicos, permitir credentials quando necessário, e validar Origin header contra whitelist."
            },
            {
                character: "👩‍💻",
                question: "Como Devia deve implementar descoberta automática de configurações OIDC?",
                leigo: "Em vez de configurar tudo manualmente, Devia pode pedir para o provedor se apresentar: 'Quais são suas URLs e como você funciona?'",
                tecnico: "Usar .well-known/openid_configuration endpoint para descobrir authorization_endpoint, token_endpoint, jwks_uri e supported features automaticamente."
            },
            {
                character: "🏦",
                question: "Como Seraph deve validar o claim 'audience' (aud)?",
                leigo: "Seraph verifica se o token foi mesmo feito para ele. Como verificar se uma carta foi endereçada para sua casa antes de abrir.",
                tecnico: "Validar que o aud claim contém o identifier do resource server (API identifier) configurado, rejeitando tokens destinados a outros recursos."
            },
            {
                character: "👩‍💻",
                question: "Qual é a melhor estratégia de Devia para lidar com múltiplos Authorization Servers?",
                leigo: "Devia pode aceitar 'carteiras de identidade' de diferentes 'países' (Google, Microsoft, etc.), mas deve verificar cada uma com suas próprias regras.",
                tecnico: "Implementar multi-issuer support com validação específica por issuer, discovery separado, key management isolado, e mapeamento de claims consistente."
            },
            {
                character: "🏦",
                question: "Como Seraph deve implementar token introspection?",
                leigo: "Quando Seraph não consegue verificar um token sozinho, ele pode perguntar diretamente para quem emitiu: 'Este token ainda é válido?'",
                tecnico: "Implementar RFC 7662 token introspection endpoint para tokens opacos, com cache adequado e fallback para casos onde validação local falha."
            },
            {
                character: "👩‍💻",
                question: "Como Devia deve projetar a arquitetura para alta disponibilidade?",
                leigo: "Devia deve preparar planos B: se um serviço cair, ter outro de reserva, e garantir que usuários não percam acesso por problemas técnicos.",
                tecnico: "Implementar load balancing, circuit breakers, token caching, múltiplos Authorization Servers, graceful degradation e health checks automatizados."
            }
        ]
    }
};

// Funções de gerenciamento de localStorage
function getCompletedPaths() {
    const completed = localStorage.getItem('reino_oidc_completed_paths');
    return completed ? JSON.parse(completed) : [];
}

function saveCompletedPath(pathName) {
    const completed = getCompletedPaths();
    if (!completed.includes(pathName)) {
        completed.push(pathName);
        localStorage.setItem('reino_oidc_completed_paths', JSON.stringify(completed));
    }
    gameState.completedPaths = completed;
}

function resetProgress() {
    localStorage.removeItem('reino_oidc_completed_paths');
    gameState.completedPaths = [];
}

function allPathsCompleted() {
    return gameState.completedPaths.length === 3;
}

// Função para embaralhar array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Função para atualizar status dos caminhos na interface
function updatePathStatus() {
    const pathCards = document.querySelectorAll('.path-card');
    
    pathCards.forEach((card, index) => {
        const pathNames = ['iniciante', 'aventureiro', 'mestre'];
        const pathName = pathNames[index];
        const isCompleted = gameState.completedPaths.includes(pathName);
        
        if (isCompleted) {
            card.classList.add('border-success');
            card.querySelector('.card-header').classList.remove('bg-success', 'bg-warning', 'bg-danger');
            card.querySelector('.card-header').classList.add('bg-success');
            
            // Adicionar badge de concluído
            let badge = card.querySelector('.completion-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge bg-success completion-badge position-absolute top-0 start-100 translate-middle';
                badge.innerHTML = '✅ Concluído';
                badge.style.fontSize = '0.7rem';
                card.style.position = 'relative';
                card.appendChild(badge);
            }
        }
    });
}

// Função para mostrar próximo caminho recomendado
function getNextRecommendedPath() {
    if (!gameState.completedPaths.includes('iniciante')) return 'iniciante';
    if (!gameState.completedPaths.includes('aventureiro')) return 'aventureiro';
    if (!gameState.completedPaths.includes('mestre')) return 'mestre';
    return null;
}

// Função para iniciar um caminho
function startPath(pathName) {
    gameState.currentPath = pathName;
    gameState.currentCardIndex = 0;
    
    // Embaralhar as perguntas para cada novo acesso
    const pathData = flashcardData[pathName];
    gameState.shuffledCards = shuffleArray(pathData.cards);
    
    document.getElementById('pathSelection').classList.add('d-none');
    document.getElementById('flashcardInterface').classList.remove('d-none');
    
    document.getElementById('pathTitle').textContent = pathData.title;
    document.getElementById('pathDescription').textContent = pathData.description;
    document.getElementById('totalQuestions').textContent = gameState.shuffledCards.length;
    
    loadCard();
}

// Função para carregar um card
function loadCard() {
    if (!gameState.currentPath) return;
    
    const card = gameState.shuffledCards[gameState.currentCardIndex];
    
    document.getElementById('questionCharacter').textContent = card.character;
    document.getElementById('questionText').textContent = card.question;
    document.getElementById('answerLeigo').textContent = card.leigo;
    document.getElementById('answerTecnico').textContent = card.tecnico;
    
    document.getElementById('currentQuestion').textContent = gameState.currentCardIndex + 1;
    
    // Reset flip state
    document.getElementById('flashcard').classList.remove('flipped');
    gameState.isFlipped = false;
    
    // Update progress bar
    const progress = ((gameState.currentCardIndex + 1) / gameState.shuffledCards.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
    
    // Update button states
    document.getElementById('btnPrevious').disabled = gameState.currentCardIndex === 0;
    
    if (gameState.currentCardIndex === gameState.shuffledCards.length - 1) {
        document.getElementById('btnNext').textContent = 'Finalizar 🎉';
    } else {
        document.getElementById('btnNext').textContent = 'Próxima ➡️';
    }
    
    // Hide completion card
    document.getElementById('completionCard').classList.add('d-none');
}

// Função para virar o card
function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    gameState.isFlipped = !gameState.isFlipped;
}

// Função para próximo card
function nextCard() {
    if (!gameState.currentPath) return;
    
    if (gameState.currentCardIndex < gameState.shuffledCards.length - 1) {
        gameState.currentCardIndex++;
        loadCard();
    } else {
        // Fim do caminho
        completeCurrentPath();
    }
}

// Função para card anterior
function previousCard() {
    if (gameState.currentCardIndex > 0) {
        gameState.currentCardIndex--;
        loadCard();
    }
}

// Função para completar caminho atual
function completeCurrentPath() {
    saveCompletedPath(gameState.currentPath);
    
    const pathData = flashcardData[gameState.currentPath];
    
    // Update progress to 100%
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', 100);
    
    // Mostrar tela de conclusão customizada
    showPathCompletion(pathData);
}

// Função para mostrar tela de conclusão do caminho
function showPathCompletion(pathData) {
    document.getElementById('flashcardInterface').classList.add('d-none');
    
    let completionHTML = '';
    
    if (allPathsCompleted()) {
        // Todos os caminhos completados - Grande premiação final
        completionHTML = `
            <div class="card shadow-lg border-0">
                <div class="card-header text-white text-center" style="background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B); padding: 2rem;">
                    <h1 class="display-4">🏆 MESTRE SUPREMO 🏆</h1>
                    <h2 class="mb-0">CONGRATULAÇÕES PELO DOMÍNIO COMPLETO DO REINO OIDC!</h2>
                </div>
                <div class="card-body text-center" style="padding: 2rem;">
                    <div class="row justify-content-center mb-4">
                        <div class="col-md-10">
                            <div class="alert alert-warning border-0 shadow-lg" style="background: linear-gradient(45deg, #FFD700, #FFA500); color: #fff;">
                                <h3 class="alert-heading">👑 CONQUISTA ÉPICA DESBLOQUEADA! 👑</h3>
                                <p class="lead mb-0">Você dominou TODOS os aspectos do OAuth 2.1 e OpenID Connect!</p>
                                <hr style="border-color: rgba(255,255,255,0.3);">
                                <p class="mb-0">🎓 <strong>Status Oficial:</strong> ESPECIALISTA CERTIFICADO EM REINO OIDC</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 class="text-primary mb-4">🎯 Sua Jornada Completa:</h3>
                    <div class="row mt-4">
                        <div class="col-md-4">
                            <div class="card border-success shadow-sm h-100">
                                <div class="card-body text-center">
                                    <h4 class="card-title">🌱 Iniciante</h4>
                                    <span class="badge bg-success p-2">✅ DOMINADO</span>
                                    <p class="card-text mt-2 small">Fundamentos conquistados</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-warning shadow-sm h-100">
                                <div class="card-body text-center">
                                    <h4 class="card-title">⚔️ Aventureiro</h4>
                                    <span class="badge bg-warning p-2">✅ DOMINADO</span>
                                    <p class="card-text mt-2 small">Conceitos avançados</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-danger shadow-sm h-100">
                                <div class="card-body text-center">
                                    <h4 class="card-title">🏆 Mestre</h4>
                                    <span class="badge bg-danger p-2">✅ DOMINADO</span>
                                    <p class="card-text mt-2 small">Maestria completa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-5">
                        <h4 class="text-info">🚀 Continue Sua Jornada de Especialista:</h4>
                        <div class="row mt-3">
                            <div class="col-md-6 mb-2">
                                <a href="mundo_do_conhecimento.html" class="btn btn-primary btn-lg w-100 shadow">
                                    🌍 Implementar na Prática
                                </a>
                            </div>
                            <div class="col-md-6 mb-2">
                                <a href="caminho_feliz.html" class="btn btn-success btn-lg w-100 shadow">
                                    ✨ Ver Fluxo Completo
                                </a>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <a href="personagens.html" class="btn btn-info btn-lg w-100 shadow">
                                    👥 Rever Personagens
                                </a>
                            </div>
                            <div class="col-md-6 mb-2">
                                <button class="btn btn-warning btn-lg w-100 shadow" onclick="resetProgress(); goBackToSelection();">
                                    🔄 Nova Jornada
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-3" style="background: linear-gradient(45deg, #e3f2fd, #fff3e0); border-radius: 10px;">
                        <p class="mb-0 text-muted">
                            <strong>🎯 Você agora possui o conhecimento completo para:</strong><br>
                            ✓ Implementar OAuth 2.1 e OIDC em qualquer aplicação<br>
                            ✓ Entender todos os fluxos e protocolos de segurança<br>
                            ✓ Resolver problemas complexos de autenticação e autorização
                        </p>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Caminho individual completado - Mensagens específicas por caminho
        const nextPath = pathData.nextPath;
        const nextPathData = nextPath ? flashcardData[nextPath] : null;
        
        // Definir mensagens específicas por caminho
        let specificMessage = '';
        let specificTitle = '';
        let bgColor = 'bg-success';
        
        if (gameState.currentPath === 'iniciante') {
            specificTitle = '🌱 Primeira Etapa Concluída com Sucesso!';
            specificMessage = `
                <div class="alert alert-success border-0 shadow-sm">
                    <h5 class="alert-heading">🎉 Parabéns! Você dominou os fundamentos!</h5>
                    <p class="mb-2">Você completou com sucesso o <strong>Caminho do Iniciante</strong> com todas as 20 perguntas randomizadas!</p>
                    <hr>
                    <p class="mb-0">✨ <strong>Conquista desbloqueada:</strong> Fundamentos do Reino OIDC dominados!</p>
                </div>`;
            bgColor = 'bg-success';
        } else if (gameState.currentPath === 'aventureiro') {
            specificTitle = '⚔️ Segunda Etapa Conquistada!';
            specificMessage = `
                <div class="alert alert-warning border-0 shadow-sm">
                    <h5 class="alert-heading">� Excelente! Você avançou para o próximo nível!</h5>
                    <p class="mb-2">Você completou com sucesso o <strong>Caminho do Aventureiro</strong> com todas as 20 perguntas randomizadas!</p>
                    <hr>
                    <p class="mb-0">🔥 <strong>Conquista desbloqueada:</strong> Conceitos Intermediários dominados!</p>
                </div>`;
            bgColor = 'bg-warning';
        } else if (gameState.currentPath === 'mestre') {
            specificTitle = '🏆 Domínio Completo Alcançado!';
            specificMessage = `
                <div class="alert alert-danger border-0 shadow-sm">
                    <h5 class="alert-heading">👑 CONGRATULAÇÕES PELO DOMÍNIO DO ASSUNTO DO REINO OIDC!</h5>
                    <p class="mb-2">Você completou com maestria o <strong>Caminho do Mestre</strong> com todas as 20 perguntas randomizadas!</p>
                    <hr>
                    <p class="mb-0">🎓 <strong>Status Final:</strong> MESTRE SUPREMO DO REINO OIDC!</p>
                </div>`;
            bgColor = 'bg-danger';
        }
        
        completionHTML = `
            <div class="card shadow-lg">
                <div class="card-header ${bgColor} text-white text-center">
                    <h4>${specificTitle}</h4>
                </div>
                <div class="card-body text-center">
                    ${specificMessage}
                    <div class="progress mb-3" style="height: 20px;">
                        <div class="progress-bar ${bgColor.replace('bg-', 'bg-')}" style="width: ${(gameState.completedPaths.length / 3) * 100}%">
                            ${gameState.completedPaths.length}/3 Caminhos Concluídos
                        </div>
                    </div>`;
        
        if (nextPathData && gameState.currentPath !== 'mestre') {
            completionHTML += `
                    <div class="alert alert-info border-0 shadow-sm">
                        <h5>🚀 Próximo Desafio Aguarda Você!</h5>
                        <p><strong>${nextPathData.title}</strong></p>
                        <p>${nextPathData.description}</p>
                        <p class="text-muted">💡 <em>Sugestão: Continue sua jornada para dominar completamente o Reino OIDC!</em></p>
                    </div>
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <button class="btn btn-primary btn-lg w-100 shadow" onclick="startPath('${nextPath}')">
                                🚀 Iniciar ${nextPathData.title}
                            </button>
                        </div>
                        <div class="col-md-6">
                            <button class="btn btn-outline-secondary btn-lg w-100" onclick="goBackToSelection()">
                                📚 Escolher Caminho
                            </button>
                        </div>
                    </div>`;
        } else if (gameState.currentPath === 'mestre') {
            completionHTML += `
                    <div class="alert alert-gold border-0 shadow-sm" style="background: linear-gradient(45deg, #FFD700, #FFA500); color: #fff;">
                        <h5 class="alert-heading">🎯 Jornada Completa!</h5>
                        <p class="mb-0">Você conquistou todos os segredos do Reino OIDC! Agora é um verdadeiro especialista em OAuth 2.1 e OpenID Connect.</p>
                    </div>
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <a href="mundo_do_conhecimento.html" class="btn btn-info btn-lg w-100 shadow mb-2">
                                🌍 Aplicar Conhecimento
                            </a>
                        </div>
                        <div class="col-md-6">
                            <a href="caminho_feliz.html" class="btn btn-success btn-lg w-100 shadow mb-2">
                                ✨ Ver Fluxo Completo
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <button class="btn btn-warning btn-lg w-100" onclick="goBackToSelection()">
                                📚 Explorar Novamente
                            </button>
                        </div>
                    </div>`;
        } else {
            completionHTML += `
                    <div class="row mt-4">
                        <div class="col-md-12">
                            <button class="btn btn-success btn-lg w-100" onclick="goBackToSelection()">
                                📚 Voltar à Seleção
                            </button>
                        </div>
                    </div>`;
        }
        
        completionHTML += `
                </div>
            </div>
        `;
    }
    
    document.getElementById('completionCard').innerHTML = completionHTML;
    document.getElementById('completionCard').classList.remove('d-none');
}

// Função para reiniciar caminho
function resetPath() {
    if (confirm('Tem certeza que deseja reiniciar este caminho?')) {
        gameState.currentCardIndex = 0;
        // Re-embaralhar as cartas
        const pathData = flashcardData[gameState.currentPath];
        gameState.shuffledCards = shuffleArray(pathData.cards);
        loadCard();
    }
}

// Função para voltar à seleção
function goBackToSelection() {
    gameState.currentPath = null;
    gameState.currentCardIndex = 0;
    
    document.getElementById('flashcardInterface').classList.add('d-none');
    document.getElementById('completionCard').classList.add('d-none');
    document.getElementById('pathSelection').classList.remove('d-none');
    
    // Atualizar status dos caminhos
    updatePathStatus();
    
    // Destacar próximo caminho recomendado
    highlightRecommendedPath();
}

// Função para destacar próximo caminho recomendado
function highlightRecommendedPath() {
    const nextPath = getNextRecommendedPath();
    if (nextPath) {
        const pathCards = document.querySelectorAll('.path-card');
        const pathNames = ['iniciante', 'aventureiro', 'mestre'];
        const nextIndex = pathNames.indexOf(nextPath);
        
        if (nextIndex !== -1 && pathCards[nextIndex]) {
            pathCards[nextIndex].classList.add('border-primary', 'border-3');
            // Adicionar badge de recomendado
            let badge = pathCards[nextIndex].querySelector('.recommended-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge bg-primary recommended-badge position-absolute';
                badge.innerHTML = '⭐ Recomendado';
                badge.style.fontSize = '0.7rem';
                badge.style.top = '-8px';
                badge.style.right = '-8px';
                badge.style.zIndex = '10';
                badge.style.borderRadius = '12px';
                badge.style.padding = '4px 8px';
                pathCards[nextIndex].style.position = 'relative';
                pathCards[nextIndex].appendChild(badge);
            }
        }
    }
}

// Event listeners para teclado
document.addEventListener('keydown', function(e) {
    if (gameState.currentPath && !document.getElementById('flashcardInterface').classList.contains('d-none')) {
        if (e.code === 'Space') {
            e.preventDefault();
            flipCard();
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            nextCard();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            previousCard();
        }
    }
});

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    updatePathStatus();
    highlightRecommendedPath();
    
    // Se todos os caminhos estão completos, mostrar opção de reset
    if (allPathsCompleted()) {
        const resetButton = document.createElement('div');
        resetButton.className = 'text-center mt-3';
        resetButton.innerHTML = `
            <div class="alert alert-success">
                <h5>🏆 Todos os caminhos conquistados!</h5>
                <button class="btn btn-warning" onclick="resetProgress(); location.reload();">
                    🔄 Reiniciar Jornada Completa
                </button>
            </div>
        `;
        document.getElementById('pathSelection').appendChild(resetButton);
    }
});
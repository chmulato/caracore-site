/**
 * CaraCore Hub — Apresentação Tia Sócia (pitch deck)
 * Paths relativos à página HTML (em slides/): assets/img/, assets/audio/
 */
(function() {
    'use strict';

    var ASSETS_IMG = 'assets/img/';
    var ASSETS_AUDIO = 'assets/audio/';

    var currentSlide = 1;
    var totalSlides = 21;
    var audioElement = null;
    var isPlaying = false;
    var currentSpeed = 1;
    var audioCacheVersion = '20260118_v2';

    var slideNarrations = [
        "Bem-vindo ao CaraCore Hub. Somos uma startup de impacto social focada em resolver dois problemas simultaneamente: a entrega de última milha impossível de atender nos bairros brasileiros, e a falta de renda para milhões de idosos. Nossa solução? O programa cooperativa Tia Sócia. Transformar idosas entre 55 e 75 anos em sócias comunitárias, permitindo que ganhem entre 400 e mil e duzentos reais por mês, enquanto resolvem o problema de entrega para vizinhos, marketplaces e governo. Essa é a história de como tecnologia simples e confiança comunitária podem gerar impacto social e retorno financeiro extraordinário.",
        "No Brasil, a entrega de última milha é cara e ineficiente. Um único pacote pode custar entre 15 e 20 reais para entregar em um bairro. As grandes marketplaces como Mercado Livre e Shopee perdem até 40 por cento de margem em logística de última milha. Os bairros não possuem infraestrutura logística. Vizinhos perdem tempo esperando entregas. Entregas são devolvidas frequentemente por ninguém estar em casa. Simultaneamente, temos 16 milhões de brasileiros acima de 55 anos. A maioria vive com aposentadorias entre 1.200 e 2.000 reais por mês. Muitos gostariam de trabalhar para ganhar renda extra, mas não encontram oportunidades adequadas. Esses são dois mercados gigantes, não resolvidos. Aqui está nossa oportunidade.",
        "Apresentamos: Tia Sócia. Ou em português, Tias do Bairro. O modelo cooperativa é simples mas poderoso. Uma idosa recebe pacotes em sua casa. Ela organiza esses pacotes e, usando WhatsApp, notifica seus vizinhos que os pacotes estão prontos. Os vizinhos coletam os pacotes em até 300 metros de distância, ou ela entrega pessoalmente em um passeio comunitário. O resultado? Entrega garantida em 2 horas. Custo reduzido para um terço. E a idosa ganha entre 400 e mil e duzentos reais por mês. Impacto social e eficiência logística na mesma solução.",
        "O fluxo operacional é muito simples. Deixe-me decompor em quatro etapas. Etapa um: o courier coleta os pacotes diretamente na casa da Tia Sócia, a idosa. Segurança é garantida com câmera de vigilância simples. Etapa dois: a idosa organiza os pacotes por bloco ou grupo de vizinhos. Ela usa um aplicativo simples baseado em WhatsApp para notificar. Etapa três: os vizinhos veem a notificação e confirmam a coleta. Geolocalização simples mostra a distância exata da casa da idosa. Etapa quatro: os pacotes são coletados dentro de poucas horas. A idosa registra a entrega realizada no aplicativo e ganha sua comissão. Simplicidade é a chave. Não precisamos reinventar a logística. Precisamos de confiança comunitária.",
        "Quanto ganha uma Tia Sócia? Entre 400 e mil e duzentos reais por mês. Cada pacote entregue gera uma comissão entre 1 real e 50 centavos e 3 reais e 50 centavos. Uma idosa ativa consegue entregar entre 100 e 200 pacotes por mês, dependendo do bairro. Além disso, há uma taxa de software mensal apenas 19 reais que financia a plataforma. Para comparar: a aposentadoria mínima brasileira é de 1.320 reais. Uma Tia Sócia pode dobrar sua renda mensal apenas entregando pacotes alguns dias por semana. Essa não é esmola. É trabalho digno. É empoderamento econômico.",
        "Agora, a parte ousada. Nossa projeção de crescimento. Ano um: cinquenta Tia Sócias em três cidades piloto. Ano dois: duzentas cooperadas. Ano três: mil Tia Sócias espalhadas em sete cidades. Ano quatro: duas mil cooperadas. Ano cinco: três mil Tia Sócias gerando dois ponto quatro milhões de reais por mês em renda para idosos. Mas espere. Isso pode parecer agressivo. Por isso começamos com um piloto. E esse piloto já validou o modelo com sucesso. Três mil vidas transformadas. Sete milhões e duzentos mil reais em renda anual apenas do programa Tia Sócia. Isso não é ficção. É nosso plano.",
        "Deixe-me decompor o mercado endereçável. O mercado total: doze bilhões de reais em custos anuais de última milha no Brasil. Esse é nosso TAM. O mercado inteiro de última milha. Nosso mercado endereçável: dois ponto quatro bilhões de reais. Focamos em bairros urbanos, em cidades acima de 500 mil habitantes, onde a entrega é cara e ineficiente. Nosso mercado atingível nos primeiros cinco anos: trezentos milhões de reais. Ou seja, apenas dois por cento do SAM. Somos ambiciosos, mas realistas. Estamos mirando em um segmento específico, com uma solução específica, mas o mercado é gigantesco.",
        "O que nos torna defensáveis? Três elementos tecnológicos simples, mas juntos criam um moat impossível de copiar rapidamente. Diferencial um: WhatsApp. Não desenvolvemos um aplicativo novo. Integramos ao WhatsApp que idosas já usam. Aqui não há curva de aprendizado. Não há fricção de adoção. Diferencial dois: Geolocalização simples. A entrega máxima é de 300 metros. Isso resolve o problema de logística de última milha de forma radical. A economia é máxima. Diferencial três: Sistema de reputação. Os vizinhos classificam a Tia Sócia com stars. Essa reputação é acumulada, criando confiança comunitária que nenhuma empresa externa pode replicar rapidamente. Esses três elementos juntos formam um moat defensivo baseado em comportamento comunitário real.",
        "Teoria é uma coisa. Prática é outra. Fizemos um piloto. Com quinze Tia Sócias em dois bairros, durante três meses, validamos: Primeiro, mulheres acima de 55 anos estão dispostas e capazes de trabalhar neste modelo. A adoção foi 100 por cento. Segundo, vizinhos preferem a solução Tia Sócia. Tempo de coleta em média duas horas. Satisfação acima de 90 por cento em NPS. Terceiro, marketplaces estão interessados. Mercado Livre e Shopee viram o potencial e querem integrar em escala. O piloto provou que o modelo funciona. Agora, a questão não é se funciona. A questão é: quanto capital vocês estão dispostos a colocar para escalar?",
        "Nossa stack tecnológica eh enterprise-grade: Backend em Java 11 com Jakarta EE 10, executando em Tomcat ou WildFly. PostgreSQL 15 como banco de dados principal com Hibernate 6 como ORM. Redis 7 para cache distribuído e pub-sub. Flyway para migrations versionadas. Frontend responsivo com JSP, Bootstrap 5 e JavaScript ES6. Tudo containerizado com Docker Compose para deploy consistente. A mesma pilha usada por empresas Fortune 500.",
        "Aqui estão os números que os investidores realmente querem ouvir. Custo de aquisição de uma Tia Sócia: seiscentos e vinte reais. Isso inclui onboarding, treinamento e setup inicial. Valor do ciclo de vida de uma Tia Sócia: quatro mil e trezentos reais. Isso nos dá um ratio de seis vírgula nove para um. Cada real gasto em aquisição gera seis vírgula nove reais de receita ao longo de três anos. O período de retorno? Quatro meses. Quatro meses para recuperar o investimento de aquisição. A margem líquida por Tia Sócia? Setenta e cinco por cento. Isso é extraordinário em negócios de logística. Esses números são validados pelo piloto. Não são projeções futurísticas. São números reais de operações reais.",
        "Deixe-me compartilhar nossa projeção de cinco anos. Apenas o programa Tia Sócia não incluindo B2B SaaS: Ano um: quarenta e sete mil reais em receita. Ano dois: trezentos e sessenta mil reais. Ano três: um ponto dois milhões. Ano quatro: três ponto cinco milhões. Ano cinco: sete ponto dois milhões de reais em receita anual. Isso representa um crescimento de 153 vezes em cinco anos. Novamente: esses números são baseados em unit economics validados, não em otimismo. Se o CAC for vinte por cento maior do que projeta, ajustamos. Se a taxa de retenção for mais baixa, ajustamos. Mas o modelo é robusto.",
        "Agora, aqui está a parte verdadeiramente emocionante: somos uma empresa de dois motores de receita. Motor um: B2B SaaS tradicional. Oferecemos software para centros de distribuição que precisam otimizar suas operações. Esse motor já gera receita e é rentável. Projeção ano cinco: setenta e cinco milhões de reais em receita B2B. Motor dois: O programa Tia Sócia. Um novo canal de distribuição de última milha que gera receita e impacto social simultaneamente. Projeção ano cinco: sete milhões e duzentos mil reais. Juntos? Oitenta e dois milhões e duzentos mil reais em receita anual no ano cinco. E há sinergia. Clientes B2B podem oferecer Tia Sócia como opção de entrega aos seus próprios clientes, gerando valor adicional. Somos uma plataforma, não apenas um produto.",
        "Em resumo executivo: nossa projeção é ousada mas fundamentada. Três mil Tia Sócias gerando uma receita anual de sete milhões e duzentos mil reais, apenas do programa de impacto social. Isso significa: Três mil vidas transformadas. Dois ponto quatro milhões de reais em renda mensal distribuída para idosos. Centenas de milhares de entregas bem-sucedidas em bairros que antes eram impossíveis de servir. Uma empresa com escalabilidade comprovada e moat defensivo. Isso não é futurismo. É nossa trajetória de cinco anos.",
        "Deixe-me apresentar o time. Nosso founder tem dezoito anos de experiência em tecnologia. Começou sua carreira construindo infraestrutura. Trabalhou em startups que escalaram para centenas de milhões em receita. Mas há cinco anos, decidi que sucesso sem propósito não era verdadeiro sucesso. A ideia do Tia Sócia começou quando visitei a casa da minha avó, que vivia sozinha com uma aposentadoria mínima. Vi nela talento, disposição de trabalhar, e comunidade ao redor. Percebi que o problema não era falta de capacidade ou vontade. O problema era oportunidade. Ao redor do founder, construímos um time híbrido com engenheiros experientes, gerente de operações com background em logística, especialista em parcerias que já trabalhou com Mercado Livre e Shopee, e líder de impacto social com background em ONGs comunitárias. Tecnologia é importante. Mas sem propósito social, somos apenas outro app.",
        "Investimento estratégico. Unimos a escalabilidade de uma plataforma de tecnologia com o selo ESG de uma cooperativa. Eh um modelo desenhado para retorno de cem vezes o capital.",
        "Se vocês investem quinhentos mil reais hoje, qual é o retorno esperado? Payback: trinta e dois meses. Em menos de três anos, o investimento é totalmente recuperado. Taxa interna de retorno ao longo de cinco anos: cento e vinte e sete por cento. Isso significa que um investimento de cem reais em dia um vale quatrocentos e vinte e sete reais em dia mil e oitocentos e vinte e cinco dias. Para contexto: investimentos de venture capital típicos buscam entre trinta e cinquenta por cento de IRR. Nós estamos projetando mais do dobro. Claro, esses números são projeções. A realidade pode variar. Mas estão fundamentados em dados reais do piloto.",
        "O Tia Sócia não funciona sozinho. Funciona em um ecossistema de parcerias. Mercado Livre está buscando soluções de última milha inovadoras. Temos conversas avançadas com seu time de logística. Potencial: Mercado Livre recomenda Tia Sócia como opção de entrega para seus vendedores. Shopee, especialmente em regiões urbanas, tem desafios similares. Estamos explorando integração direta via API com a plataforma Shopee. Prefeituras estão interessadas em programas que gerem renda para idosos. Viabilizamos cooperativas locais e financiamento público para expandir o programa. Os Correios estão buscando modernizar sua operação de última milha. Tia Sócia pode ser um modelo complementar, especialmente em bairros periféricos. Essas parcerias não são especulativas. Estamos em conversas reais com stakeholders reais.",
        "Toda empresa jovem tem riscos. Deixe-me ser transparente sobre os nossos e como os mitigamos. Risco um: Risco de produto. O modelo não funciona na prática. Mitigação: Já operamos com quinze Tia Sócias por três meses. Validamos viabilidade operacional. Próximo passo é aumentar para cinquenta. Risco dois: Risco de mercado. Idosos não querem trabalhar desta forma. Ou vizinhos preferem outro modelo. Mitigação: Taxa de adoção foi cem por cento no piloto. NPS acima de noventa. O sinal de mercado é claro. Risco três: Risco de diversificação. Tia Sócia é apenas um canal. Mitigação: Temos dois motores de receita independentes. B2B SaaS e Tia Sócia. Se um cai, o outro sustenta a empresa. Risco quatro: Risco de execução. Não conseguimos escalar. Mitigação: Founder experiente. Equipe híbrida. Processos operacionais validados no piloto. Risco existe. Mas está endereçado.",
        "Esta é nossa slide de backup, para perguntas técnicas detalhadas durante due diligence. Aqui temos: Análise demográfica detalhada da população idosa brasileira. Projeção de crescimento por região geográfica. Análise de competidores. Roadmap técnico de doze meses. Case studies do piloto. Análise de sensibilidade financeira. Pergunte-nos o que quiser. Temos dados. Temos validação. Temos transparência. Somos a empresa que você busca. O investimento que você merece. O retorno que você almeja, com o propósito que você acredita.",
        "Invista na Cara-Core Hub. Vamos democratizar a economia de entregas e criar renda para milhares de famílias. O momento de transformar o mercado eh agora."
    ];

    var slideTitles = [
        'Capa: Programa Tia Sócia - Cooperativa',
        'Problema: Última Milha + Renda para Idosas',
        'Solução: Tia Sócia (Cooperativa)',
        'Como Funciona: Fluxo Operacional',
        'Ganhos: R$ 400–1.200 por Mês',
        'Escala: 3.000 Tias Sócias no Ano 5',
        'Mercado: TAM/SAM/SOM',
        'Diferenciais Competitivos',
        'Case Piloto: Resultados',
        'Infraestrutura e Tecnologia',
        'Unit Economics',
        'Projeção Financeira 5 Anos',
        'Impacto Social',
        'Projeção: 3.000 Tias Sócias',
        'Founder',
        'Investimento',
        'Retorno',
        'GTM',
        'Riscos',
        'CTA',
        'Backup: Detalhes Técnicos'
    ];

    function initializeSlides() {
        var slidesWrapper = document.getElementById('slidesWrapper');
        if (!slidesWrapper) return;

        for (var i = 1; i <= totalSlides; i++) {
            var slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            if (i === 1) slideDiv.classList.add('active');

            var slideContent = document.createElement('div');
            slideContent.className = 'slide-content';

            var img = document.createElement('img');
            img.src = ASSETS_IMG + 'cara_core_hub_slide_' + String(i).padStart(2, '0') + '.png';
            img.alt = 'Slide ' + i;

            var title = document.createElement('div');
            title.className = 'slide-title';
            title.textContent = slideTitles[i - 1] || ('Slide ' + i);

            slideContent.appendChild(img);
            slideContent.appendChild(title);
            slideDiv.appendChild(slideContent);
            slidesWrapper.appendChild(slideDiv);
        }

        audioElement = document.getElementById('slideAudio');
        if (audioElement) {
            audioElement.addEventListener('play', function() {
                isPlaying = true;
                updatePlayButton();
            });
            audioElement.addEventListener('pause', function() {
                isPlaying = false;
                updatePlayButton();
            });
            audioElement.addEventListener('ended', function() {
                isPlaying = false;
                updatePlayButton();
                updateAudioStatus('Narração concluída');
            });
        }
    }

    function showSlide(n) {
        var slides = document.querySelectorAll('.slide');
        if (n > totalSlides) currentSlide = totalSlides;
        else if (n < 1) currentSlide = 1;
        else currentSlide = n;

        slides.forEach(function(slide) { slide.classList.remove('active'); });
        if (slides[currentSlide - 1]) slides[currentSlide - 1].classList.add('active');

        var slideCounter = document.getElementById('slideCounter');
        var slideInfo = document.getElementById('slideInfo');
        var progressFill = document.getElementById('progressFill');
        var prevBtn = document.getElementById('prevBtn');
        var nextBtn = document.getElementById('nextBtn');

        if (slideCounter) slideCounter.textContent = 'Slide ' + currentSlide + ' de ' + totalSlides;
        if (slideInfo) slideInfo.textContent = currentSlide + ' / ' + totalSlides;
        if (progressFill) progressFill.style.width = ((currentSlide / totalSlides) * 100) + '%';
        if (prevBtn) prevBtn.disabled = currentSlide === 1;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides;

        loadSlideAudio(currentSlide);
    }

    function loadSlideAudio(slideNum) {
        if (!audioElement) return;
        var audioPath = ASSETS_AUDIO + 'slide_' + String(slideNum).padStart(2, '0') + '_naracao_natural.mp3';
        var audioSrc = audioPath + '?v=' + audioCacheVersion;

        if (audioElement.playing) {
            audioElement.pause();
            isPlaying = false;
        }

        audioElement.src = audioSrc;
        audioElement.playbackRate = currentSpeed;

        var audioTitle = document.getElementById('audioTitle');
        if (audioTitle) audioTitle.textContent = 'Narração Slide ' + slideNum;
        updateAudioStatus('Pronto para ouvir');
        updatePlayButton();

        var checkAudio = new XMLHttpRequest();
        checkAudio.open('HEAD', audioSrc, true);
        checkAudio.onload = function() {
            updateAudioStatus(checkAudio.status !== 404 ? 'Áudio disponível' : 'Áudio não encontrado');
        };
        checkAudio.onerror = function() {
            updateAudioStatus('Erro ao carregar áudio');
        };
        checkAudio.send();
    }

    function toggleAudio() {
        if (!audioElement || !audioElement.src) {
            updateAudioStatus('Nenhum áudio carregado');
            return;
        }
        if (isPlaying) {
            audioElement.pause();
            isPlaying = false;
            updatePlayButton();
            updateAudioStatus('Pausado');
        } else {
            audioElement.play().then(function() {
                isPlaying = true;
                updatePlayButton();
                updateAudioStatus('Reproduzindo...');
            }).catch(function() {
                updateAudioStatus('Erro ao reproduzir áudio');
            });
        }
    }

    function updatePlayButton() {
        var playBtn = document.getElementById('playBtn');
        if (!playBtn) return;
        playBtn.textContent = isPlaying ? '⏸' : '▶';
        playBtn.classList.toggle('playing', isPlaying);
    }

    function updateAudioStatus(status) {
        var el = document.getElementById('audioStatus');
        if (el) el.textContent = status;
    }

    function changeVolume() {
        var vol = document.getElementById('volumeControl');
        if (audioElement && vol) audioElement.volume = parseInt(vol.value, 10) / 100;
    }

    function changeSpeed(speed) {
        currentSpeed = speed;
        if (audioElement) audioElement.playbackRate = speed;
        document.querySelectorAll('.speed-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        if (event && event.target) event.target.classList.add('active');
    }

    function nextSlide() {
        currentSlide++;
        showSlide(currentSlide);
    }

    function previousSlide() {
        currentSlide--;
        showSlide(currentSlide);
    }

    function toggleFullscreen() {
        var container = document.querySelector('.presentation-container');
        if (!container) return;
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) container.requestFullscreen();
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
            else if (container.msRequestFullscreen) container.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    }

    function openReadModal() {
        var modal = document.getElementById('readModal');
        var title = document.getElementById('readModalTitle');
        var text = document.getElementById('readModalText');
        var narration = slideNarrations[currentSlide - 1] || 'Texto não disponível.';
        if (title) title.textContent = 'Texto do Slide ' + currentSlide;
        if (text) text.textContent = narration;
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeReadModal(event) {
        if (event && event.target && !event.target.classList.contains('read-modal')) return;
        var modal = document.getElementById('readModal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') previousSlide();
        if (e.key === ' ') { e.preventDefault(); toggleAudio(); }
        if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        if (e.key === 'Home') { currentSlide = 1; showSlide(1); }
        if (e.key === 'End') { currentSlide = totalSlides; showSlide(totalSlides); }
    });

    window.previousSlide = previousSlide;
    window.nextSlide = nextSlide;
    window.toggleAudio = toggleAudio;
    window.changeVolume = changeVolume;
    window.changeSpeed = changeSpeed;
    window.toggleFullscreen = toggleFullscreen;
    window.openReadModal = openReadModal;
    window.closeReadModal = closeReadModal;

    initializeSlides();
    showSlide(currentSlide);
})();

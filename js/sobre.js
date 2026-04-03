/* ============================================================
   sobre.js — RecrutaPro / Página Sobre
   Interatividade:
   - Menu mobile (abrir/fechar)
   - Sombra no cabeçalho ao rolar
   - Animação de contagem dos números (counter-up)
   - Revelação de elementos ao entrar na viewport
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const cabecalho      = document.getElementById('cabecalho');
    const btnMenuMobile  = document.getElementById('btn_menu_mobile');
    const menuMobile     = document.getElementById('menu_mobile');
    const iconeMenu      = document.getElementById('icone_menu');

    /* ----------------------------------------------------------
       MENU MOBILE
    ---------------------------------------------------------- */
    if (btnMenuMobile && menuMobile) {
        btnMenuMobile.addEventListener('click', function () {
            var estaAberto = menuMobile.classList.toggle('aberto');
            iconeMenu.classList.toggle('fa-bars',  !estaAberto);
            iconeMenu.classList.toggle('fa-xmark',  estaAberto);
            btnMenuMobile.setAttribute('aria-label', estaAberto ? 'Fechar menu' : 'Abrir menu');
        });

        menuMobile.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', fecharMenu);
        });

        document.addEventListener('click', function (e) {
            if (cabecalho && !cabecalho.contains(e.target)) fecharMenu();
        });
    }

    function fecharMenu() {
        if (!menuMobile) return;
        menuMobile.classList.remove('aberto');
        if (iconeMenu) { iconeMenu.classList.add('fa-bars'); iconeMenu.classList.remove('fa-xmark'); }
        if (btnMenuMobile) btnMenuMobile.setAttribute('aria-label', 'Abrir menu');
    }

    /* ----------------------------------------------------------
       SOMBRA NO CABEÇALHO AO ROLAR
    ---------------------------------------------------------- */
    if (cabecalho) {
        window.addEventListener('scroll', function () {
            cabecalho.classList.toggle('rolando', window.scrollY > 20);
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       ANIMAÇÃO DE CONTAGEM DOS NÚMEROS (Counter-Up)
    ---------------------------------------------------------- */
    var numerosContados = false;

    function animarContador(elemento, alvo, sufixo, duracao) {
        var inicio   = 0;
        var passo    = duracao / alvo;
        var intervalo = setInterval(function () {
            inicio += Math.max(1, Math.ceil(alvo / (duracao / 16)));
            if (inicio >= alvo) {
                inicio = alvo;
                clearInterval(intervalo);
            }
            elemento.textContent = inicio.toLocaleString('pt-AO') + (sufixo || '');
        }, 16);
    }

    function iniciarContadores() {
        if (numerosContados) return;
        var itens = document.querySelectorAll('.numero_item');
        if (!itens.length) return;

        /* Verifica se a secção está visível */
        var rect = itens[0].closest('.numeros_secao').getBoundingClientRect();
        if (rect.top > window.innerHeight) return;

        numerosContados = true;
        itens.forEach(function (item) {
            var alvo    = parseInt(item.dataset.alvo, 10) || 0;
            var sufixo  = item.dataset.sufixo || '';
            var valorEl = item.querySelector('.numero_valor');
            if (valorEl) animarContador(valorEl, alvo, sufixo, 1500);
        });
    }

    window.addEventListener('scroll', iniciarContadores, { passive: true });
    iniciarContadores(); /* tenta logo ao carregar */

    /* ----------------------------------------------------------
       REVELAÇÃO DE ELEMENTOS AO ENTRAR NA VIEWPORT
    ---------------------------------------------------------- */
    var seletores = [
        '.mvv_card',
        '.timeline_card',
        '.equipa_card',
        '.tech_card',
        '.diferencial_item',
        '.depoimento_card',
        '.numero_item',
        '.equipa_convite'
    ];

    var elementos = document.querySelectorAll(seletores.join(', '));

    if ('IntersectionObserver' in window && elementos.length > 0) {
        var observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visivel');
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        elementos.forEach(function (el, i) {
            el.classList.add('entrada_oculto');
            /* Stagger delay escalonado por linha (cada 4 elementos) */
            var delay = (i % 4) * 100;
            el.style.transitionDelay = delay + 'ms';
            observer.observe(el);
        });
    }

    /* ----------------------------------------------------------
       SCROLL SUAVE PARA ÂNCORAS INTERNAS
    ---------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var id  = link.getAttribute('href').replace('#', '');
            var alvo = document.getElementById(id);
            if (!alvo) return;
            e.preventDefault();
            var offsetTopo = cabecalho ? cabecalho.offsetHeight + 16 : 80;
            var posY = alvo.getBoundingClientRect().top + window.scrollY - offsetTopo;
            window.scrollTo({ top: posY, behavior: 'smooth' });
            fecharMenu();
        });
    });

});

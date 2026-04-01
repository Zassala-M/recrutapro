/* ============================================================
   index.js — RecrutaPro
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       MENU MOBILE — abrir / fechar
    ---------------------------------------------------------- */
    const btnMenuMobile = document.getElementById('btn_menu_mobile');
    const menuMobile    = document.getElementById('menu_mobile');
    const iconeMenu     = document.getElementById('icone_menu');

    if (btnMenuMobile && menuMobile) {
        btnMenuMobile.addEventListener('click', function () {
            const estaAberto = menuMobile.classList.toggle('aberto');

            // Troca ícone hamburguer <-> X
            if (estaAberto) {
                iconeMenu.classList.remove('fa-bars');
                iconeMenu.classList.add('fa-xmark');
                btnMenuMobile.setAttribute('aria-label', 'Fechar menu');
            } else {
                iconeMenu.classList.remove('fa-xmark');
                iconeMenu.classList.add('fa-bars');
                btnMenuMobile.setAttribute('aria-label', 'Abrir menu');
            }
        });

        // Fecha o menu ao clicar em qualquer link dentro dele
        const linksMenu = menuMobile.querySelectorAll('a');
        linksMenu.forEach(function (link) {
            link.addEventListener('click', fecharMenu);
        });

        // Fecha ao clicar fora do cabeçalho
        document.addEventListener('click', function (e) {
            const cabecalho = document.getElementById('cabecalho');
            if (cabecalho && !cabecalho.contains(e.target)) {
                fecharMenu();
            }
        });
    }

    function fecharMenu() {
        if (!menuMobile) return;
        menuMobile.classList.remove('aberto');
        iconeMenu.classList.remove('fa-xmark');
        iconeMenu.classList.add('fa-bars');
        if (btnMenuMobile) btnMenuMobile.setAttribute('aria-label', 'Abrir menu');
    }


    /* ----------------------------------------------------------
       CABEÇALHO — sombra ao rolar a página
    ---------------------------------------------------------- */
    const cabecalho = document.getElementById('cabecalho');

    if (cabecalho) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 20) {
                cabecalho.classList.add('rolando');
            } else {
                cabecalho.classList.remove('rolando');
            }
        }, { passive: true });
    }


    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA — elementos ao entrar na viewport
    ---------------------------------------------------------- */
    const elementosAnimados = document.querySelectorAll(
        '.funcionalidade_card, .depoimento_card, .publico_card, .numero_item'
    );

    if ('IntersectionObserver' in window && elementosAnimados.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity    = '1';
                    entrada.target.style.transform  = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        elementosAnimados.forEach(function (el, i) {
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(24px)';
            el.style.transition = 'opacity 0.5s ease ' + (i * 60) + 'ms, transform 0.5s ease ' + (i * 60) + 'ms';
            observer.observe(el);
        });
    }

});

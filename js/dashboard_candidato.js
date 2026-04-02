/* ============================================================
   dashboard_candidato.js — RecrutaPro / Dashboard Candidato
   Apenas interatividade:
   - Sidebar mobile (abrir/fechar via overlay)
   - Sidebar desktop (recolher/expandir)
   - Abas (Buscar Vagas / Minhas Candidaturas)
   - Busca e filtro de vagas em tempo real
   - Animação de entrada nos cards
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const sidebar           = document.getElementById('sidebar');
    const sidebarOverlay    = document.getElementById('sidebar_overlay');
    const btnSidebarMobile  = document.getElementById('btn_sidebar_mobile');
    const sidebarToggleBtn  = document.getElementById('sidebar_toggle_btn');
    const sidebarToggleIcone= document.getElementById('sidebar_toggle_icone');
    const conteudoPrincipal = document.getElementById('conteudo_principal');

    const abaBtns           = document.querySelectorAll('.aba_btn');
    const paineis           = document.querySelectorAll('.aba_painel');

    const buscaVagas        = document.getElementById('busca_vagas');
    const filtroModalidade  = document.getElementById('filtro_modalidade_vagas');
    const vagasLista        = document.getElementById('vagas_lista');
    const semResultados     = document.getElementById('sem_resultados_vagas');
    const todasVagas        = vagasLista ? Array.from(vagasLista.querySelectorAll('.vaga_card')) : [];

    /* ----------------------------------------------------------
       SIDEBAR MOBILE — abrir / fechar
    ---------------------------------------------------------- */
    function abrirSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('aberta');
        sidebarOverlay && sidebarOverlay.classList.add('visivel');
        document.body.style.overflow = 'hidden';
    }

    function fecharSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('aberta');
        sidebarOverlay && sidebarOverlay.classList.remove('visivel');
        document.body.style.overflow = '';
    }

    if (btnSidebarMobile) {
        btnSidebarMobile.addEventListener('click', function () {
            sidebar && sidebar.classList.contains('aberta') ? fecharSidebar() : abrirSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', fecharSidebar);
    }

    // Fecha sidebar mobile ao navegar
    if (sidebar) {
        sidebar.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth < 768) fecharSidebar();
            });
        });
    }

    /* ----------------------------------------------------------
       SIDEBAR DESKTOP — recolher / expandir
    ---------------------------------------------------------- */
    let sidebarRecolhida = false;

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function () {
            sidebarRecolhida = !sidebarRecolhida;

            if (sidebar)          sidebar.classList.toggle('recolhida', sidebarRecolhida);
            if (conteudoPrincipal) conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);

            if (sidebarToggleIcone) {
                sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
            }

            sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
        });
    }

    /* ----------------------------------------------------------
       ABAS
    ---------------------------------------------------------- */
    abaBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const alvo = btn.dataset.aba;

            // Atualiza botões
            abaBtns.forEach(function (b) {
                b.classList.remove('aba_btn_ativa');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('aba_btn_ativa');
            btn.setAttribute('aria-selected', 'true');

            // Atualiza painéis
            paineis.forEach(function (painel) {
                const idPainel = painel.id; // ex: "painel_vagas"
                const nomePainel = idPainel.replace('painel_', '');
                if (nomePainel === alvo) {
                    painel.classList.remove('aba_painel_oculto');
                } else {
                    painel.classList.add('aba_painel_oculto');
                }
            });
        });
    });

    /* ----------------------------------------------------------
       BUSCA E FILTRO DE VAGAS EM TEMPO REAL
    ---------------------------------------------------------- */
    function aplicarFiltros() {
        const termo      = buscaVagas     ? buscaVagas.value.toLowerCase().trim()    : '';
        const modalidade = filtroModalidade ? filtroModalidade.value                  : 'todos';
        let visiveis = 0;

        todasVagas.forEach(function (vaga) {
            const tituloEl  = vaga.querySelector('.vaga_titulo_link');
            const empresaEl = vaga.querySelector('.vaga_empresa span');
            const titulo    = tituloEl  ? tituloEl.textContent.toLowerCase()  : '';
            const empresa   = empresaEl ? empresaEl.textContent.toLowerCase() : '';
            const vagaMod   = vaga.dataset.modalidade || '';

            const passaBusca    = !termo      || titulo.includes(termo)   || empresa.includes(termo);
            const passaMod      = modalidade === 'todos' || vagaMod === modalidade;
            const mostrar       = passaBusca && passaMod;

            vaga.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });

        if (semResultados) {
            semResultados.classList.toggle('visivel', visiveis === 0);
        }
    }

    if (buscaVagas)       buscaVagas.addEventListener('input', aplicarFiltros);
    if (filtroModalidade) filtroModalidade.addEventListener('change', aplicarFiltros);

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    const todosCards = document.querySelectorAll(
        '.stat_card, .vaga_card, .candidatura_card'
    );

    if ('IntersectionObserver' in window && todosCards.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity   = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.06 });

        todosCards.forEach(function (card, i) {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition= 'opacity 0.4s ease ' + (i * 55) + 'ms, transform 0.4s ease ' + (i * 55) + 'ms';
            observer.observe(card);
        });
    }

    /* ----------------------------------------------------------
       FECHA SIDEBAR AO REDIMENSIONAR PARA DESKTOP
    ---------------------------------------------------------- */
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) fecharSidebar();
    });

});

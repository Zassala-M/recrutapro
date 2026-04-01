/* ============================================================
   vagas.js — RecrutaPro / Página de Vagas
   Apenas interatividade:
   - Menu mobile (abrir/fechar)
   - Sombra do cabeçalho ao rolar
   - Filtros mobile (expandir/recolher)
   - Busca em tempo real por título, empresa e descrição
   - Filtros por modalidade e tipo de contrato
   - Sincronização filtros desktop ↔ mobile
   - Contador de resultados atualizado
   - Estado vazio (sem resultados)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const cabecalho = document.getElementById('cabecalho');
    const btnMenuMobile = document.getElementById('btn_menu_mobile');
    const menuMobile = document.getElementById('menu_mobile');
    const iconeMenu = document.getElementById('icone_menu');

    const campoBusca = document.getElementById('campo_busca');
    const btnFiltrosMobile = document.getElementById('btn_filtros_mobile');
    const filtrosMobileExpandidos = document.getElementById('filtros_mobile_expandidos');

    const filtroModalidade = document.getElementById('filtro_modalidade');
    const filtroTipo = document.getElementById('filtro_tipo');
    const filtroModalidadeMobile = document.getElementById('filtro_modalidade_mobile');
    const filtroTipoMobile = document.getElementById('filtro_tipo_mobile');

    const vagasLista = document.getElementById('vagas_lista');
    const semResultados = document.getElementById('sem_resultados');
    const textoResultados = document.getElementById('texto_resultados');
    const btnLimparFiltros = document.getElementById('btn_limpar_filtros');

    const todasVagas = vagasLista
        ? Array.from(vagasLista.querySelectorAll('.vaga_card'))
        : [];

    /* ----------------------------------------------------------
       MENU MOBILE — abrir / fechar
    ---------------------------------------------------------- */
    if (btnMenuMobile && menuMobile) {
        btnMenuMobile.addEventListener('click', function () {
            const estaAberto = menuMobile.classList.toggle('aberto');

            iconeMenu.classList.toggle('fa-bars', !estaAberto);
            iconeMenu.classList.toggle('fa-xmark', estaAberto);
            btnMenuMobile.setAttribute('aria-label', estaAberto ? 'Fechar menu' : 'Abrir menu');
        });

        // Fecha ao clicar em link dentro do menu
        menuMobile.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', fecharMenuMobile);
        });

        // Fecha ao clicar fora do cabeçalho
        document.addEventListener('click', function (e) {
            if (cabecalho && !cabecalho.contains(e.target)) {
                fecharMenuMobile();
            }
        });
    }

    function fecharMenuMobile() {
        if (!menuMobile) return;
        menuMobile.classList.remove('aberto');
        if (iconeMenu) {
            iconeMenu.classList.add('fa-bars');
            iconeMenu.classList.remove('fa-xmark');
        }
        if (btnMenuMobile) btnMenuMobile.setAttribute('aria-label', 'Abrir menu');
    }

    /* ----------------------------------------------------------
       CABEÇALHO — sombra ao rolar
    ---------------------------------------------------------- */
    if (cabecalho) {
        window.addEventListener('scroll', function () {
            cabecalho.style.boxShadow = window.scrollY > 10
                ? '0 4px 6px -1px hsl(222 47% 11% / 0.12), 0 2px 4px -2px hsl(222 47% 11% / 0.08)'
                : '';
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       FILTROS MOBILE — expandir / recolher
    ---------------------------------------------------------- */
    if (btnFiltrosMobile && filtrosMobileExpandidos) {
        btnFiltrosMobile.addEventListener('click', function () {
            const aberto = filtrosMobileExpandidos.classList.toggle('aberto');
            btnFiltrosMobile.setAttribute('aria-expanded', String(aberto));

            // Sincroniza valores com desktop ao abrir
            if (aberto && filtroModalidade && filtroModalidadeMobile) {
                filtroModalidadeMobile.value = filtroModalidade.value;
                filtroTipoMobile.value = filtroTipo.value;
            }
        });
    }

    /* ----------------------------------------------------------
       FILTROS — sincronização desktop ↔ mobile
    ---------------------------------------------------------- */
    function sincronizarParaMobile() {
        if (filtroModalidadeMobile) filtroModalidadeMobile.value = filtroModalidade.value;
        if (filtroTipoMobile) filtroTipoMobile.value = filtroTipo.value;
    }

    function sincronizarParaDesktop() {
        if (filtroModalidade) filtroModalidade.value = filtroModalidadeMobile.value;
        if (filtroTipo) filtroTipo.value = filtroTipoMobile.value;
    }

    if (filtroModalidade) filtroModalidade.addEventListener('change', function () { sincronizarParaMobile(); aplicarFiltros(); });
    if (filtroTipo) filtroTipo.addEventListener('change', function () { sincronizarParaMobile(); aplicarFiltros(); });
    if (filtroModalidadeMobile) filtroModalidadeMobile.addEventListener('change', function () { sincronizarParaDesktop(); aplicarFiltros(); });
    if (filtroTipoMobile) filtroTipoMobile.addEventListener('change', function () { sincronizarParaDesktop(); aplicarFiltros(); });

    /* ----------------------------------------------------------
       BUSCA EM TEMPO REAL
    ---------------------------------------------------------- */
    if (campoBusca) {
        campoBusca.addEventListener('input', aplicarFiltros);
    }

    /* ----------------------------------------------------------
       LIMPAR FILTROS
    ---------------------------------------------------------- */
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function () {
            if (campoBusca) campoBusca.value = '';
            if (filtroModalidade) filtroModalidade.value = 'todos';
            if (filtroTipo) filtroTipo.value = 'todos';
            if (filtroModalidadeMobile) filtroModalidadeMobile.value = 'todos';
            if (filtroTipoMobile) filtroTipoMobile.value = 'todos';
            aplicarFiltros();
        });
    }

    /* ----------------------------------------------------------
       LÓGICA DE FILTRAGEM
    ---------------------------------------------------------- */
    function aplicarFiltros() {
        const termoBusca = campoBusca ? campoBusca.value.toLowerCase().trim() : '';
        const modalidadeSel = filtroModalidade ? filtroModalidade.value : 'todos';
        const tipoSel = filtroTipo ? filtroTipo.value : 'todos';

        let visiveis = 0;

        todasVagas.forEach(function (vaga) {
            const tituloEl = vaga.querySelector('.vaga_titulo_link');
            const empresaEl = vaga.querySelector('.vaga_empresa span');
            const descricaoEl = vaga.querySelector('.vaga_descricao');

            const titulo = tituloEl ? tituloEl.textContent.toLowerCase() : '';
            const empresa = empresaEl ? empresaEl.textContent.toLowerCase() : '';
            const descricao = descricaoEl ? descricaoEl.textContent.toLowerCase() : '';

            const vagaModalidade = vaga.dataset.modalidade || '';
            const vagaTipo = vaga.dataset.tipo || '';

            const passaBusca = !termoBusca ||
                titulo.includes(termoBusca) ||
                empresa.includes(termoBusca) ||
                descricao.includes(termoBusca);

            const passaModalidade = modalidadeSel === 'todos' || vagaModalidade === modalidadeSel;
            const passaTipo = tipoSel === 'todos' || vagaTipo === tipoSel;

            const mostrar = passaBusca && passaModalidade && passaTipo;

            vaga.classList.toggle('oculto', !mostrar);

            if (mostrar) visiveis++;
        });

        // Atualiza contador
        if (textoResultados) {
            textoResultados.textContent = visiveis === 1
                ? '1 vaga encontrada'
                : visiveis + ' vagas encontradas';
        }

        // Exibe / oculta estado vazio
        if (semResultados) {
            semResultados.classList.toggle('visivel', visiveis === 0);
        }
    }

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    if ('IntersectionObserver' in window && todasVagas.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        todasVagas.forEach(function (vaga, i) {
            vaga.style.opacity = '0';
            vaga.style.transform = 'translateY(20px)';
            vaga.style.transition = 'opacity 0.45s ease ' + (i * 80) + 'ms, transform 0.45s ease ' + (i * 80) + 'ms';
            observer.observe(vaga);
        });
    }

});

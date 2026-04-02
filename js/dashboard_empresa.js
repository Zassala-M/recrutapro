/* ============================================================
   dashboard_empresa.js — RecrutaPro / Dashboard Empresa
   Apenas interatividade:
   - Sidebar mobile (abrir/fechar + overlay)
   - Sidebar desktop (recolher/expandir)
   - Filtro de vagas (lateral)
   - Busca de candidatos em tempo real
   - Filtro de candidatos por status
   - Dropdown de alteração de status por candidato
   - Expansão de detalhes do candidato
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

    const vagasFiltroLista  = document.getElementById('vagas_filtro_lista');
    const buscaCandidatos   = document.getElementById('busca_candidatos');
    const filtroStatus      = document.getElementById('filtro_status');
    const candidatosLista   = document.getElementById('candidatos_lista');
    const semResultados     = document.getElementById('sem_resultados');
    const todosCandidatos   = candidatosLista
        ? Array.from(candidatosLista.querySelectorAll('.candidato_card'))
        : [];

    /* ----------------------------------------------------------
       SIDEBAR MOBILE
    ---------------------------------------------------------- */
    function abrirSidebar() {
        sidebar && sidebar.classList.add('aberta');
        sidebarOverlay && sidebarOverlay.classList.add('visivel');
        document.body.style.overflow = 'hidden';
    }

    function fecharSidebar() {
        sidebar && sidebar.classList.remove('aberta');
        sidebarOverlay && sidebarOverlay.classList.remove('visivel');
        document.body.style.overflow = '';
    }

    btnSidebarMobile  && btnSidebarMobile.addEventListener('click', function () {
        sidebar && sidebar.classList.contains('aberta') ? fecharSidebar() : abrirSidebar();
    });

    sidebarOverlay && sidebarOverlay.addEventListener('click', fecharSidebar);

    sidebar && sidebar.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth < 768) fecharSidebar();
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) fecharSidebar();
    });

    /* ----------------------------------------------------------
       SIDEBAR DESKTOP — RECOLHER / EXPANDIR
    ---------------------------------------------------------- */
    let sidebarRecolhida = false;

    sidebarToggleBtn && sidebarToggleBtn.addEventListener('click', function () {
        sidebarRecolhida = !sidebarRecolhida;
        sidebar          && sidebar.classList.toggle('recolhida', sidebarRecolhida);
        conteudoPrincipal && conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);
        if (sidebarToggleIcone) sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
        sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
    });

    /* ----------------------------------------------------------
       FILTRO DE VAGAS (lateral)
    ---------------------------------------------------------- */
    vagasFiltroLista && vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (b) {
                b.classList.remove('vaga_filtro_item_ativo');
            });
            btn.classList.add('vaga_filtro_item_ativo');
            // Aqui poderia filtrar por vaga — extensível
        });
    });

    /* ----------------------------------------------------------
       BUSCA E FILTRO DE CANDIDATOS
    ---------------------------------------------------------- */
    function aplicarFiltros() {
        const termo  = buscaCandidatos ? buscaCandidatos.value.toLowerCase().trim() : '';
        const status = filtroStatus    ? filtroStatus.value                          : 'todos';
        let visiveis = 0;

        todosCandidatos.forEach(function (card) {
            const nome       = card.dataset.nome    || '';
            const cardStatus = card.dataset.status  || '';

            const passaNome   = !termo  || nome.includes(termo);
            const passaStatus = status === 'todos' || cardStatus === status;
            const mostrar     = passaNome && passaStatus;

            card.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });

        semResultados && semResultados.classList.toggle('visivel', visiveis === 0);
    }

    buscaCandidatos && buscaCandidatos.addEventListener('input', aplicarFiltros);
    filtroStatus    && filtroStatus.addEventListener('change', aplicarFiltros);

    /* ----------------------------------------------------------
       DROPDOWN DE STATUS POR CANDIDATO
    ---------------------------------------------------------- */
    // Mapas de classes CSS por status
    const classesStatus = {
        triagem:    'status_triagem',
        teste:      'status_teste',
        entrevista: 'status_entrevista',
        aprovado:   'status_aprovado',
        rejeitado:  'status_rejeitado'
    };

    const rotulos = {
        triagem:    'Triagem',
        teste:      'Teste',
        entrevista: 'Entrevista',
        aprovado:   'Aprovado',
        rejeitado:  'Rejeitado'
    };

    // Abre/fecha dropdown ao clicar no botão de status
    document.querySelectorAll('.candidato_status_btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id       = btn.dataset.candidato;
            const dropdown = document.getElementById('dropdown_' + id);
            const seta     = document.getElementById('seta_' + id);

            // Fecha todos os outros dropdowns
            document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
                if (d !== dropdown) {
                    d.classList.remove('aberto');
                    const outroBtnId = d.id.replace('dropdown_', '');
                    const outraSeta  = document.getElementById('seta_' + outroBtnId);
                    outraSeta && outraSeta.classList.remove('aberto');
                }
            });

            dropdown && dropdown.classList.toggle('aberto');
            seta     && seta.classList.toggle('aberto');
        });
    });

    // Seleciona novo status no dropdown
    document.querySelectorAll('.status_dropdown_item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            const novoStatus = item.dataset.statusValor;
            const alvo       = item.dataset.alvo;
            const btn        = document.querySelector('[data-candidato="' + alvo + '"]');
            const emblema    = btn && btn.querySelector('.status_emblema');
            const dropdown   = document.getElementById('dropdown_' + alvo);
            const seta       = document.getElementById('seta_' + alvo);
            const card       = btn && btn.closest('.candidato_card');

            if (emblema && novoStatus) {
                // Remove classes de status antigas
                Object.values(classesStatus).forEach(function (cls) { emblema.classList.remove(cls); });
                emblema.classList.add(classesStatus[novoStatus] || '');
                emblema.textContent = rotulos[novoStatus] || novoStatus;
            }

            // Atualiza data-status do card para filtros
            if (card) card.dataset.status = novoStatus;

            // Fecha dropdown
            dropdown && dropdown.classList.remove('aberto');
            seta     && seta.classList.remove('aberto');

            // Reaplicar filtros com novo status
            aplicarFiltros();
        });
    });

    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', function () {
        document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
            d.classList.remove('aberto');
            const id   = d.id.replace('dropdown_', '');
            const seta = document.getElementById('seta_' + id);
            seta && seta.classList.remove('aberto');
        });
    });

    /* ----------------------------------------------------------
       EXPANSÃO DE DETALHES DO CANDIDATO
    ---------------------------------------------------------- */
    document.querySelectorAll('.candidato_ver_mais_btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id      = btn.dataset.candidato;
            const expArea = document.getElementById('expansao_' + id);
            const icone   = document.getElementById('icone_ver_' + id);
            const aberto  = expArea && expArea.classList.toggle('aberto');
            icone && icone.classList.toggle('aberto', aberto);

            const textoBtn = btn.querySelector('span') || btn.childNodes[0];
            if (textoBtn && textoBtn.nodeType === 3) {
                textoBtn.textContent = aberto ? 'Ocultar detalhes ' : 'Ver mais detalhes ';
            }
        });
    });

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    const todosCards = document.querySelectorAll('.stat_card, .candidato_card');

    if ('IntersectionObserver' in window && todosCards.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity   = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.05 });

        todosCards.forEach(function (card, i) {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition= 'opacity 0.4s ease ' + (i * 55) + 'ms, transform 0.4s ease ' + (i * 55) + 'ms';
            observer.observe(card);
        });
    }

    /* ----------------------------------------------------------
       BOTÃO NOVA VAGA (feedback visual)
    ---------------------------------------------------------- */
    const btnNovaVaga = document.getElementById('btn_nova_vaga');
    if (btnNovaVaga) {
        btnNovaVaga.addEventListener('click', function () {
            const original = btnNovaVaga.innerHTML;
            btnNovaVaga.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abrindo...';
            btnNovaVaga.disabled = true;
            setTimeout(function () {
                btnNovaVaga.innerHTML = original;
                btnNovaVaga.disabled = false;
            }, 1500);
        });
    }

});

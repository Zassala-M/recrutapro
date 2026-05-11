/* ============================================================
   dashboard_candidato.js — RecrutaPro / Dashboard Candidato
   Interatividade:
   - Sidebar mobile (abrir/fechar + overlay)
   - Sidebar desktop (recolher/expandir)
   - Navegação entre secções via data-secao
   - Busca e filtro de vagas em tempo real
   - Filtro de candidaturas por status (pills)
   - Botão "Candidatar-se" com feedback visual
   - Guardar perfil com toast de confirmação
   - Animação de entrada nos cards
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    var sidebar            = document.getElementById('sidebar');
    var sidebarOverlay     = document.getElementById('sidebar_overlay');
    var btnSidebarMobile   = document.getElementById('btn_sidebar_mobile');
    var sidebarToggleBtn   = document.getElementById('sidebar_toggle_btn');
    var sidebarToggleIcone = document.getElementById('sidebar_toggle_icone');
    var conteudoPrincipal  = document.getElementById('conteudo_principal');
    var toast              = document.getElementById('toast');

    /* ----------------------------------------------------------
       SIDEBAR MOBILE
    ---------------------------------------------------------- */
    function abrirSidebar() {
        sidebar        && sidebar.classList.add('aberta');
        sidebarOverlay && sidebarOverlay.classList.add('visivel');
        document.body.style.overflow = 'hidden';
    }

    function fecharSidebar() {
        sidebar        && sidebar.classList.remove('aberta');
        sidebarOverlay && sidebarOverlay.classList.remove('visivel');
        document.body.style.overflow = '';
    }

    btnSidebarMobile && btnSidebarMobile.addEventListener('click', function () {
        sidebar && sidebar.classList.contains('aberta') ? fecharSidebar() : abrirSidebar();
    });

    sidebarOverlay && sidebarOverlay.addEventListener('click', fecharSidebar);

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) fecharSidebar();
    });

    /* ----------------------------------------------------------
       SIDEBAR DESKTOP — RECOLHER / EXPANDIR
    ---------------------------------------------------------- */
    var sidebarRecolhida = false;

    sidebarToggleBtn && sidebarToggleBtn.addEventListener('click', function () {
        sidebarRecolhida = !sidebarRecolhida;
        sidebar           && sidebar.classList.toggle('recolhida', sidebarRecolhida);
        conteudoPrincipal && conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);
        if (sidebarToggleIcone) {
            sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
        }
        sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
    });

    /* ----------------------------------------------------------
       NAVEGAÇÃO ENTRE SECÇÕES
    ---------------------------------------------------------- */
    var mapaSecoes = {
        'dashboard':    'secao_dashboard',
        'buscar_vagas': 'secao_buscar_vagas',
        'candidaturas': 'secao_candidaturas',
        'meu_perfil':   'secao_meu_perfil'
    };

    function navegarParaSecao(alvo) {
        if (!mapaSecoes[alvo]) return;

        /* Actualiza links da sidebar */
        document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (l) {
            l.classList.toggle('sidebar_nav_link_ativo', l.dataset.secao === alvo);
        });

        /* Mostra secção alvo, oculta as restantes */
        Object.values(mapaSecoes).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('conteudo_secao_oculta');
        });

        var secaoAlvo = document.getElementById(mapaSecoes[alvo]);
        if (secaoAlvo) {
            secaoAlvo.classList.remove('conteudo_secao_oculta');
            /* Faz scroll ao topo do conteúdo */
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /* Fecha sidebar em mobile */
        if (window.innerWidth < 768) fecharSidebar();
    }

    /* Links da sidebar */
    document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navegarParaSecao(link.dataset.secao);
        });
    });

    /* Botões com data-secao fora da sidebar (acesso rápido, "ver todas", etc.) */
    document.querySelectorAll('[data-secao]:not(.sidebar_nav_link)').forEach(function (btn) {
        btn.addEventListener('click', function () {
            navegarParaSecao(btn.dataset.secao);
        });
    });

    /* ----------------------------------------------------------
       BUSCA E FILTRO DE VAGAS
    ---------------------------------------------------------- */
    var buscaVagas       = document.getElementById('busca_vagas');
    var filtroModalidade = document.getElementById('filtro_modalidade');
    var filtroTipo       = document.getElementById('filtro_tipo');
    var vagasLista       = document.getElementById('vagas_lista');
    var numVagas         = document.getElementById('num_vagas');
    var semResultVagas   = document.getElementById('sem_resultados_vagas');
    var todasVagas       = vagasLista
        ? Array.from(vagasLista.querySelectorAll('.vaga_card'))
        : [];

    function filtrarVagas() {
        var termo      = buscaVagas       ? buscaVagas.value.toLowerCase().trim()  : '';
        var modalidade = filtroModalidade ? filtroModalidade.value                  : 'todos';
        var tipo       = filtroTipo       ? filtroTipo.value                        : 'todos';
        var visiveis   = 0;

        todasVagas.forEach(function (card) {
            var titulo      = card.dataset.titulo      || '';
            var cardModal   = card.dataset.modalidade  || '';
            var cardTipo    = card.dataset.tipo        || '';

            var passaBusca = !termo      || titulo.includes(termo);
            var passaModal = modalidade === 'todos' || cardModal === modalidade;
            var passaTipo  = tipo === 'todos'       || cardTipo  === tipo;
            var mostrar    = passaBusca && passaModal && passaTipo;

            card.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });

        if (numVagas)       numVagas.textContent = visiveis;
        if (semResultVagas) semResultVagas.classList.toggle('visivel', visiveis === 0);
    }

    buscaVagas       && buscaVagas.addEventListener('input',  filtrarVagas);
    filtroModalidade && filtroModalidade.addEventListener('change', filtrarVagas);
    filtroTipo       && filtroTipo.addEventListener('change', filtrarVagas);

    /* ----------------------------------------------------------
       FILTRO DE CANDIDATURAS POR STATUS (pills)
    ---------------------------------------------------------- */
    var pillsFiltro        = document.querySelectorAll('.filtro_pill');
    var todasCandidaturas  = document.querySelectorAll('#candidaturas_lista .candidatura_card');
    var semResultCandid    = document.getElementById('sem_resultados_candidaturas');

    pillsFiltro.forEach(function (pill) {
        pill.addEventListener('click', function () {
            /* Actualiza pill activa */
            pillsFiltro.forEach(function (p) { p.classList.remove('filtro_pill_ativo'); });
            pill.classList.add('filtro_pill_ativo');

            var filtro   = pill.dataset.filtro || 'todos';
            var visiveis = 0;

            todasCandidaturas.forEach(function (card) {
                var status  = card.dataset.status || '';
                var mostrar = filtro === 'todos' || status === filtro;
                card.classList.toggle('oculto', !mostrar);
                if (mostrar) visiveis++;
            });

            if (semResultCandid) semResultCandid.classList.toggle('visivel', visiveis === 0);
        });
    });

    /* ----------------------------------------------------------
       BOTÃO CANDIDATAR-SE
    ---------------------------------------------------------- */
    document.querySelectorAll('.btn_candidatar').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.dataset.candidatado) return;

            var textoOriginal = btn.innerHTML;
            btn.innerHTML   = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
            btn.disabled    = true;

            setTimeout(function () {
                btn.innerHTML             = '<i class="fa-solid fa-circle-check"></i> Candidatado!';
                btn.style.background      = 'hsl(142, 71%, 45%)';
                btn.dataset.candidatado   = 'true';

                exibirToast('Candidatura enviada com sucesso!', 'sucesso');

                /* Após 4s restaura aparência mas mantém estado */
                setTimeout(function () {
                    btn.innerHTML        = '<i class="fa-solid fa-circle-check"></i> Candidatado';
                    btn.style.background = '';
                    btn.style.opacity    = '0.7';
                    btn.disabled         = true;
                }, 4000);
            }, 1200);
        });
    });

    /* ----------------------------------------------------------
       GUARDAR PERFIL
    ---------------------------------------------------------- */
    var btnSalvarPerfil = document.getElementById('btn_salvar_perfil');

    btnSalvarPerfil && btnSalvarPerfil.addEventListener('click', function () {
        var textoOriginal = btnSalvarPerfil.innerHTML;
        btnSalvarPerfil.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';
        btnSalvarPerfil.disabled  = true;

        setTimeout(function () {
            btnSalvarPerfil.innerHTML = '<i class="fa-solid fa-circle-check"></i> Guardado!';
            btnSalvarPerfil.style.background = 'hsl(142, 71%, 45%)';
            exibirToast('Perfil actualizado com sucesso!', 'sucesso');

            setTimeout(function () {
                btnSalvarPerfil.innerHTML        = textoOriginal;
                btnSalvarPerfil.style.background = '';
                btnSalvarPerfil.disabled         = false;
            }, 3000);
        }, 1200);
    });

    /* ----------------------------------------------------------
       MÁSCARA DE TELEFONE NO PERFIL
    ---------------------------------------------------------- */
    var campoTelPerfil = document.getElementById('perfil_telefone');
    campoTelPerfil && campoTelPerfil.addEventListener('input', function () {
        /* Mantém formato angolano (+244) mas permite edição livre */
        var val = campoTelPerfil.value;
        /* Sem máscara rígida — apenas aceita o valor como está */
        _ = val;
    });

    /* ----------------------------------------------------------
       ZONA DE UPLOAD DO CURRÍCULO (drag & drop visual)
    ---------------------------------------------------------- */
    var curriculoZona = document.getElementById('curriculo_zona');

    if (curriculoZona) {
        curriculoZona.addEventListener('dragover', function (e) {
            e.preventDefault();
            curriculoZona.style.borderColor     = 'var(--primario)';
            curriculoZona.style.backgroundColor = 'var(--acento)';
        });

        curriculoZona.addEventListener('dragleave', function () {
            curriculoZona.style.borderColor     = '';
            curriculoZona.style.backgroundColor = '';
        });

        curriculoZona.addEventListener('drop', function (e) {
            e.preventDefault();
            curriculoZona.style.borderColor     = '';
            curriculoZona.style.backgroundColor = '';

            var ficheiro = e.dataTransfer.files[0];
            if (!ficheiro) return;

            if (ficheiro.type !== 'application/pdf') {
                exibirToast('Apenas ficheiros PDF são aceites.', 'erro');
                return;
            }

            if (ficheiro.size > 5 * 1024 * 1024) {
                exibirToast('O ficheiro não pode ultrapassar 5MB.', 'erro');
                return;
            }

            curriculoZona.innerHTML =
                '<i class="fa-solid fa-file-pdf curriculo_zona_icone" style="color: var(--destructivo);"></i>' +
                '<p class="curriculo_zona_titulo">' + ficheiro.name + '</p>' +
                '<p class="curriculo_zona_sub">' + (ficheiro.size / 1024).toFixed(0) + ' KB · Pronto para guardar</p>' +
                '<button class="btn_contorno btn_sm"><i class="fa-solid fa-rotate"></i> Substituir</button>';

            exibirToast('Currículo carregado! Guarda o perfil para confirmar.', 'sucesso');
        });

        /* Clique abre o input de ficheiro */
        curriculoZona.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            var input = document.createElement('input');
            input.type   = 'file';
            input.accept = 'application/pdf';
            input.addEventListener('change', function () {
                var ficheiro = input.files[0];
                if (!ficheiro) return;
                if (ficheiro.type !== 'application/pdf') { exibirToast('Apenas PDF são aceites.', 'erro'); return; }
                if (ficheiro.size > 5 * 1024 * 1024)    { exibirToast('Ficheiro demasiado grande (máx. 5MB).', 'erro'); return; }

                curriculoZona.innerHTML =
                    '<i class="fa-solid fa-file-pdf curriculo_zona_icone" style="color: var(--destructivo);"></i>' +
                    '<p class="curriculo_zona_titulo">' + ficheiro.name + '</p>' +
                    '<p class="curriculo_zona_sub">' + (ficheiro.size / 1024).toFixed(0) + ' KB · Pronto para guardar</p>' +
                    '<button class="btn_contorno btn_sm"><i class="fa-solid fa-rotate"></i> Substituir</button>';

                exibirToast('Currículo carregado! Guarda o perfil para confirmar.', 'sucesso');
            });
            input.click();
        });
    }

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    var todosCards = document.querySelectorAll('.stat_card, .vaga_card, .candidatura_card, .painel_card');

    if ('IntersectionObserver' in window && todosCards.length > 0) {
        var observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity   = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.05 });

        todosCards.forEach(function (card, i) {
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(16px)';
            card.style.transition = 'opacity 0.4s ease ' + (i * 60) + 'ms, transform 0.4s ease ' + (i * 60) + 'ms';
            observer.observe(card);
        });
    }

    /* ----------------------------------------------------------
       TOAST DE FEEDBACK
    ---------------------------------------------------------- */
    var toastTimer = null;

    function exibirToast(mensagem, tipo) {
        if (!toast) return;
        clearTimeout(toastTimer);

        toast.className = 'toast toast_' + (tipo === 'sucesso' ? 'sucesso' : 'erro');
        toast.innerHTML = '<i class="fa-solid ' + (tipo === 'sucesso' ? 'fa-circle-check' : 'fa-circle-xmark') + '"></i><span>' + mensagem + '</span>';
        toast.classList.add('visivel');

        toastTimer = setTimeout(function () {
            toast.classList.remove('visivel');
        }, 4000);
    }

});

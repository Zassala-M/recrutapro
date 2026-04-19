/* ============================================================
   dashboard_empresa.js — RecrutaPro / Dashboard Empresa
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM — Sidebar e layout
    ---------------------------------------------------------- */
    const sidebar            = document.getElementById('sidebar');
    const sidebarOverlay     = document.getElementById('sidebar_overlay');
    const btnSidebarMobile   = document.getElementById('btn_sidebar_mobile');
    const sidebarToggleBtn   = document.getElementById('sidebar_toggle_btn');
    const sidebarToggleIcone = document.getElementById('sidebar_toggle_icone');
    const conteudoPrincipal  = document.getElementById('conteudo_principal');

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
        sidebar          && sidebar.classList.toggle('recolhida', sidebarRecolhida);
        conteudoPrincipal && conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);
        if (sidebarToggleIcone) sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
        sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
    });

    /* ----------------------------------------------------------
       NAVEGAÇÃO ENTRE SECÇÕES
    ---------------------------------------------------------- */
    var mapaSecoes = {
        'dashboard':     'secao_dashboard',
        'minhas_vagas':  'secao_minhas_vagas',
        'candidatos':    'secao_candidatos',
        'configuracoes': 'secao_configuracoes'
    };

    var titulosSecoes = {
        'dashboard':     'Dashboard',
        'minhas_vagas':  'Minhas Vagas',
        'candidatos':    'Candidatos',
        'configuracoes': 'Configurações'
    };

    function navegarParaSecao(alvo) {
        /* Actualiza nav */
        document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (l) {
            l.classList.toggle('sidebar_nav_link_ativo', l.dataset.secao === alvo);
        });

        /* Mostra/oculta secções */
        Object.values(mapaSecoes).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('conteudo_secao_oculta');
        });

        var secaoAlvo = document.getElementById(mapaSecoes[alvo]);
        if (secaoAlvo) secaoAlvo.classList.remove('conteudo_secao_oculta');

        /* Fecha sidebar em mobile */
        if (window.innerWidth < 768) fecharSidebar();
    }

    /* Cliques na sidebar */
    document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navegarParaSecao(link.dataset.secao);
        });
    });

    /* Botão "Ver todas" dentro do painel do dashboard */
    document.querySelectorAll('.btn_ver_todas[data-secao]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            navegarParaSecao(btn.dataset.secao);
        });
    });

    /* ----------------------------------------------------------
       FILTRO DE VAGAS — lista lateral (dashboard)
    ---------------------------------------------------------- */
    var vagasFiltroLista = document.getElementById('vagas_filtro_lista');

    vagasFiltroLista && vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (b) {
                b.classList.remove('vaga_filtro_item_ativo');
            });
            btn.classList.add('vaga_filtro_item_ativo');
        });
    });

    /* ----------------------------------------------------------
       BUSCA E FILTRO DE CANDIDATOS (dashboard)
    ---------------------------------------------------------- */
    var buscaCandidatos  = document.getElementById('busca_candidatos');
    var filtroStatus     = document.getElementById('filtro_status');
    var candidatosLista  = document.getElementById('candidatos_lista');
    var semResultados    = document.getElementById('sem_resultados');
    var todosCandidatos  = candidatosLista
        ? Array.from(candidatosLista.querySelectorAll('.candidato_card'))
        : [];

    function aplicarFiltros() {
        var termo  = buscaCandidatos ? buscaCandidatos.value.toLowerCase().trim() : '';
        var status = filtroStatus    ? filtroStatus.value                          : 'todos';
        var visiveis = 0;

        todosCandidatos.forEach(function (card) {
            var nome       = card.dataset.nome   || '';
            var cardStatus = card.dataset.status || '';
            var mostrar    = (!termo || nome.includes(termo)) &&
                             (status === 'todos' || cardStatus === status);
            card.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });

        semResultados && semResultados.classList.toggle('visivel', visiveis === 0);
    }

    buscaCandidatos && buscaCandidatos.addEventListener('input',  aplicarFiltros);
    filtroStatus    && filtroStatus.addEventListener('change', aplicarFiltros);

    /* ----------------------------------------------------------
       DROPDOWN DE STATUS POR CANDIDATO
    ---------------------------------------------------------- */
    var classesStatus = {
        triagem:    'status_triagem',
        teste:      'status_teste',
        entrevista: 'status_entrevista',
        aprovado:   'status_aprovado',
        rejeitado:  'status_rejeitado'
    };

    var rotulos = {
        triagem:    'Triagem',
        teste:      'Teste',
        entrevista: 'Entrevista',
        aprovado:   'Aprovado',
        rejeitado:  'Rejeitado'
    };

    document.querySelectorAll('.candidato_status_btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id       = btn.dataset.candidato;
            var dropdown = document.getElementById('dropdown_' + id);
            var seta     = document.getElementById('seta_' + id);

            document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
                if (d !== dropdown) {
                    d.classList.remove('aberto');
                    var otherId = d.id.replace('dropdown_', '');
                    var outraSeta = document.getElementById('seta_' + otherId);
                    outraSeta && outraSeta.classList.remove('aberto');
                }
            });

            dropdown && dropdown.classList.toggle('aberto');
            seta     && seta.classList.toggle('aberto');
        });
    });

    document.querySelectorAll('.status_dropdown_item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var novoStatus = item.dataset.statusValor;
            var alvo       = item.dataset.alvo;
            var btn        = document.querySelector('[data-candidato="' + alvo + '"]');
            var emblema    = btn && btn.querySelector('.status_emblema');
            var dropdown   = document.getElementById('dropdown_' + alvo);
            var seta       = document.getElementById('seta_' + alvo);
            var card       = btn && btn.closest('.candidato_card');

            if (emblema && novoStatus) {
                Object.values(classesStatus).forEach(function (cls) { emblema.classList.remove(cls); });
                emblema.classList.add(classesStatus[novoStatus] || '');
                emblema.textContent = rotulos[novoStatus] || novoStatus;
            }

            if (card) card.dataset.status = novoStatus;
            dropdown && dropdown.classList.remove('aberto');
            seta     && seta.classList.remove('aberto');
            aplicarFiltros();
        });
    });

    /* Fecha dropdowns ao clicar fora */
    document.addEventListener('click', function () {
        document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
            d.classList.remove('aberto');
            var id   = d.id.replace('dropdown_', '');
            var seta = document.getElementById('seta_' + id);
            seta && seta.classList.remove('aberto');
        });
    });

    /* ----------------------------------------------------------
       EXPANSÃO DE DETALHES DO CANDIDATO
    ---------------------------------------------------------- */
    document.querySelectorAll('.candidato_ver_mais_btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id      = btn.dataset.candidato;
            var expArea = document.getElementById('expansao_' + id);
            var icone   = document.getElementById('icone_ver_' + id);
            var aberto  = expArea && expArea.classList.toggle('aberto');
            icone && icone.classList.toggle('aberto', aberto);
        });
    });

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    var todosCards = document.querySelectorAll('.stat_card, .candidato_card');

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
            card.style.transition = 'opacity 0.4s ease ' + (i * 55) + 'ms, transform 0.4s ease ' + (i * 55) + 'ms';
            observer.observe(card);
        });
    }

    /* ----------------------------------------------------------
       TABELA MINHAS VAGAS — busca e filtro
    ---------------------------------------------------------- */
    var buscaMinhasVagas   = document.getElementById('busca_minhas_vagas');
    var filtroStatusVagas  = document.getElementById('filtro_status_vagas');
    var linhasVagas        = document.querySelectorAll('#tbody_vagas .tabela_tr');
    var tabelaVazia        = document.getElementById('tabela_vazia');

    function filtrarTabelaVagas() {
        var termo  = buscaMinhasVagas  ? buscaMinhasVagas.value.toLowerCase().trim() : '';
        var status = filtroStatusVagas ? filtroStatusVagas.value                     : 'todos';
        var visiveis = 0;

        linhasVagas.forEach(function (linha) {
            var titulo      = linha.dataset.titulo || '';
            var linhaStatus = linha.dataset.status || '';
            var mostrar     = (!termo || titulo.includes(termo)) &&
                              (status === 'todos' || linhaStatus === status);
            linha.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });

        tabelaVazia && tabelaVazia.classList.toggle('visivel', visiveis === 0);
    }

    buscaMinhasVagas  && buscaMinhasVagas.addEventListener('input',  filtrarTabelaVagas);
    filtroStatusVagas && filtroStatusVagas.addEventListener('change', filtrarTabelaVagas);

    /* ----------------------------------------------------------
       TABELA MINHAS VAGAS — modal de exclusão
    ---------------------------------------------------------- */
    var modalExcluirOverlay = document.getElementById('modal_excluir_overlay');
    var modalExcluir        = document.getElementById('modal_confirmacao_excluir');
    var btnCancelarExcluir  = document.getElementById('btn_cancelar_excluir');
    var btnConfirmarExcluir = document.getElementById('btn_confirmar_excluir');
    var nomeVagaExcluir     = document.getElementById('nome_vaga_excluir');
    var linhaParaExcluir    = null;

    function abrirModalExcluir(linha, titulo) {
        linhaParaExcluir = linha;
        if (nomeVagaExcluir) nomeVagaExcluir.textContent = '"' + titulo + '"';
        modalExcluir        && modalExcluir.classList.add('ativo');
        modalExcluirOverlay && modalExcluirOverlay.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }

    function fecharModalExcluir() {
        modalExcluir        && modalExcluir.classList.remove('ativo');
        modalExcluirOverlay && modalExcluirOverlay.classList.remove('ativo');
        document.body.style.overflow = '';
        linhaParaExcluir = null;
    }

    /* Delegação de eventos no tbody */
    var tbodyVagas = document.getElementById('tbody_vagas');
    tbodyVagas && tbodyVagas.addEventListener('click', function (e) {
        var btnExcluir     = e.target.closest('.tabela_btn_excluir');
        var btnEditar      = e.target.closest('.tabela_btn_editar');
        var btnCandidatos  = e.target.closest('.tabela_btn_candidatos');

        if (btnExcluir) {
            var linha  = btnExcluir.closest('.tabela_tr');
            var titulo = btnExcluir.dataset.titulo || 'esta vaga';
            abrirModalExcluir(linha, titulo);
        }

        if (btnEditar) {
            /* Abre o modal de nova vaga para edição */
            abrirModal();
        }

        if (btnCandidatos) {
            /* Navega para a secção candidatos */
            navegarParaSecao('candidatos');
        }
    });

    btnCancelarExcluir  && btnCancelarExcluir.addEventListener('click',  fecharModalExcluir);
    modalExcluirOverlay && modalExcluirOverlay.addEventListener('click', fecharModalExcluir);

    btnConfirmarExcluir && btnConfirmarExcluir.addEventListener('click', function () {
        if (!linhaParaExcluir) return;
        btnConfirmarExcluir.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo...';
        btnConfirmarExcluir.disabled  = true;

        setTimeout(function () {
            linhaParaExcluir.remove();
            fecharModalExcluir();
            filtrarTabelaVagas();
            btnConfirmarExcluir.innerHTML = '<i class="fa-solid fa-trash-can"></i> Excluir';
            btnConfirmarExcluir.disabled  = false;
        }, 900);
    });

    /* Botão "Criar primeira vaga" (estado vazio) */
    var btnNovaVagaVazio = document.getElementById('btn_nova_vaga_vazio');
    btnNovaVagaVazio && btnNovaVagaVazio.addEventListener('click', function () {
        abrirModal();
    });

    /* Esc fecha modal de exclusão */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (modalExcluir && modalExcluir.classList.contains('ativo')) fecharModalExcluir();
        }
    });

});

/* ============================================================
   MODAL NOVA VAGA (fora do DOMContentLoaded para ser
   acessível por delegação interna e pelos botões da tabela)
   ============================================================ */
var modal          = document.getElementById('modal_nova_vaga');
var overlay        = document.getElementById('modal_overlay');
var btnNovaVaga    = document.getElementById('btn_nova_vaga');
var btnNovaVagaV   = document.getElementById('btn_nova_vaga_vagas');
var btnFechar      = document.getElementById('modal_fechar');
var btnCancelar    = document.getElementById('modal_cancelar');
var formNovaVaga   = document.getElementById('form_nova_vaga');
var btnPublicar    = document.getElementById('btn_publicar');
var btnPublicarTxt = document.getElementById('btn_publicar_texto');
var iconePublicar  = document.getElementById('icone_publicar');
var erroGeral      = document.getElementById('modal_erro_geral');

function abrirModal() {
    if (!modal || !overlay) return;
    modal.classList.add('ativo');
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
        var primeiro = modal.querySelector('input, select, textarea');
        if (primeiro) primeiro.focus();
    }, 250);
}

function fecharModal() {
    if (!modal || !overlay) return;
    modal.classList.remove('ativo');
    overlay.classList.remove('ativo');
    document.body.style.overflow = '';
    if (formNovaVaga) {
        formNovaVaga.querySelectorAll('.campo_invalido').forEach(function (c) { c.classList.remove('campo_invalido'); });
        formNovaVaga.querySelectorAll('.campo_erro').forEach(function (e) { e.textContent = ''; });
    }
    erroGeral      && erroGeral.classList.remove('visivel');
    btnPublicar    && (btnPublicar.disabled = false);
    btnPublicarTxt && (btnPublicarTxt.textContent = 'Publicar Vaga');
    iconePublicar  && (iconePublicar.className = 'fa-solid fa-arrow-right');
    btnPublicar    && (btnPublicar.style.background = '');
}

btnNovaVaga  && btnNovaVaga.addEventListener('click',  abrirModal);
btnNovaVagaV && btnNovaVagaV.addEventListener('click', abrirModal);
btnFechar    && btnFechar.addEventListener('click',    fecharModal);
btnCancelar  && btnCancelar.addEventListener('click',  fecharModal);
overlay      && overlay.addEventListener('click',      fecharModal);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('ativo')) fecharModal();
});

/* ---- Listas dinâmicas ---- */
function criarItemLista(placeholder, nome) {
    var item = document.createElement('div');
    item.className = 'campo_lista_item';
    item.innerHTML =
        '<input type="text" class="campo_texto campo_lista_input" placeholder="' + placeholder + '" name="' + nome + '">' +
        '<button type="button" class="campo_lista_remover" aria-label="Remover"><i class="fa-solid fa-xmark"></i></button>';
    item.querySelector('.campo_lista_remover').addEventListener('click', function () { item.remove(); });
    return item;
}

var btnAddRequisito = document.getElementById('btn_add_requisito');
var listaRequisitos = document.getElementById('lista_requisitos');
btnAddRequisito && btnAddRequisito.addEventListener('click', function () {
    listaRequisitos.appendChild(criarItemLista('Ex: Domínio de Node.js e TypeScript', 'requisitos[]'));
    listaRequisitos.lastElementChild.querySelector('input').focus();
});

var btnAddBeneficio = document.getElementById('btn_add_beneficio');
var listaBeneficios = document.getElementById('lista_beneficios');
btnAddBeneficio && btnAddBeneficio.addEventListener('click', function () {
    listaBeneficios.appendChild(criarItemLista('Ex: Vale alimentação e refeição', 'beneficios[]'));
    listaBeneficios.lastElementChild.querySelector('input').focus();
});

/* ---- Etapas ---- */
function atualizarNumerosEtapas() {
    document.querySelectorAll('#lista_etapas .etapa_numero').forEach(function (num, i) { num.textContent = i + 1; });
}

function criarEtapa(valor) {
    var item = document.createElement('div');
    item.className = 'etapa_item';
    item.innerHTML =
        '<div class="etapa_numero"></div>' +
        '<input type="text" class="campo_texto campo_lista_input" placeholder="Ex: Entrevista técnica" name="etapas[]"' +
        (valor ? ' value="' + valor + '"' : '') + '>' +
        '<button type="button" class="campo_lista_remover" aria-label="Remover etapa"><i class="fa-solid fa-xmark"></i></button>';
    item.querySelector('.campo_lista_remover').addEventListener('click', function () {
        if (document.querySelectorAll('#lista_etapas .etapa_item').length <= 1) return;
        item.remove();
        atualizarNumerosEtapas();
    });
    return item;
}

var listaEtapas = document.getElementById('lista_etapas');
if (listaEtapas) {
    listaEtapas.querySelectorAll('.campo_lista_remover').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (listaEtapas.querySelectorAll('.etapa_item').length <= 1) return;
            btn.closest('.etapa_item').remove();
            atualizarNumerosEtapas();
        });
    });
    atualizarNumerosEtapas();
}

var btnAddEtapa = document.getElementById('btn_add_etapa');
btnAddEtapa && btnAddEtapa.addEventListener('click', function () {
    var nova = criarEtapa('');
    listaEtapas.appendChild(nova);
    atualizarNumerosEtapas();
    nova.querySelector('input').focus();
});

/* ---- Validação e submit ---- */
formNovaVaga && formNovaVaga.addEventListener('submit', function (e) {
    e.preventDefault();
    var titulo      = document.getElementById('vaga_titulo');
    var localizacao = document.getElementById('vaga_localizacao');
    var descricao   = document.getElementById('vaga_descricao');
    var temErro     = false;

    function setErro(campo, erroId, msg) {
        var erroEl = document.getElementById(erroId);
        if (!campo) return;
        if (msg) { campo.classList.add('campo_invalido'); if (erroEl) erroEl.textContent = msg; temErro = true; }
        else      { campo.classList.remove('campo_invalido'); if (erroEl) erroEl.textContent = ''; }
    }

    setErro(titulo,      'erro_vaga_titulo',      !titulo?.value.trim()      ? 'O título é obrigatório.'      : '');
    setErro(localizacao, 'erro_vaga_localizacao', !localizacao?.value.trim() ? 'A localização é obrigatória.' : '');
    setErro(descricao,   'erro_vaga_descricao',   !descricao?.value.trim()   ? 'A descrição é obrigatória.'   : '');

    /* Valida requisitos */
    var inputsReq = listaRequisitos
        ? Array.from(listaRequisitos.querySelectorAll('input')).filter(function (i) { return i.value.trim(); })
        : [];
    if (inputsReq.length === 0) {
        var erroReq = document.getElementById('erro_vaga_requisitos');
        if (erroReq) erroReq.textContent = 'Adicione pelo menos um requisito.';
        temErro = true;
    }

    /* Valida etapas */
    var inputsEtapa = listaEtapas
        ? Array.from(listaEtapas.querySelectorAll('input')).filter(function (i) { return i.value.trim(); })
        : [];
    if (inputsEtapa.length === 0) {
        var erroEtapa = document.getElementById('erro_vaga_etapas');
        if (erroEtapa) erroEtapa.textContent = 'Adicione pelo menos uma etapa.';
        temErro = true;
    }

    if (temErro) {
        erroGeral && erroGeral.classList.add('visivel');
        var primeiroErro = formNovaVaga.querySelector('.campo_invalido');
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    erroGeral && erroGeral.classList.remove('visivel');
    if (btnPublicar)    btnPublicar.disabled = true;
    if (btnPublicarTxt) btnPublicarTxt.textContent = 'Publicando...';
    if (iconePublicar)  iconePublicar.className = 'fa-solid fa-spinner fa-spin';

    setTimeout(function () {
        if (btnPublicarTxt) btnPublicarTxt.textContent = 'Publicado!';
        if (iconePublicar)  iconePublicar.className = 'fa-solid fa-circle-check';
        if (btnPublicar)    btnPublicar.style.background = 'hsl(142, 71%, 45%)';

        setTimeout(function () {
            fecharModal();
            formNovaVaga.reset();
            atualizarNumerosEtapas();
        }, 1500);
    }, 1400);
});

/* Limpeza de erros ao redigitar */
formNovaVaga && formNovaVaga.querySelectorAll('input, textarea').forEach(function (campo) {
    campo.addEventListener('input', function () {
        if (campo.classList.contains('campo_invalido')) {
            campo.classList.remove('campo_invalido');
            var erroEl = campo.closest('.campo_grupo') && campo.closest('.campo_grupo').querySelector('.campo_erro');
            if (erroEl) erroEl.textContent = '';
        }
        erroGeral && erroGeral.classList.remove('visivel');
    });
});

/* ============================================================
   dashboard_empresa.js — RecrutaPro / Dashboard Empresa
   Interatividade completa:
   - Sidebar mobile + desktop recolher/expandir
   - Navegação entre 4 secções via data-secao
   - Dropdown de status por candidato (dashboard + secção candidatos)
   - Expansão de detalhes do candidato (dashboard)
   - Filtro busca + status candidatos (dashboard)
   - Filtro tabela vagas (minhas vagas)
   - Modal nova vaga (nova + editar com pré-preenchimento)
   - Modal confirmação de exclusão de vaga
   - Filtros avançados secção candidatos
   - Botões de acção candidatos (aprovar, rejeitar, avançar)
   - Toggle switches configurações
   - Guardar configurações com toast
   - Toast global
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       SIDEBAR MOBILE
    ---------------------------------------------------------- */
    var sidebar           = document.getElementById('sidebar');
    var sidebarOverlay    = document.getElementById('sidebar_overlay');
    var btnSidebarMobile  = document.getElementById('btn_sidebar_mobile');
    var sidebarToggleBtn  = document.getElementById('sidebar_toggle_btn');
    var sidebarToggleIcone= document.getElementById('sidebar_toggle_icone');
    var conteudoPrincipal = document.getElementById('conteudo_principal');

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
    window.addEventListener('resize', function () { if (window.innerWidth >= 768) fecharSidebar(); });

    /* ----------------------------------------------------------
       SIDEBAR DESKTOP — RECOLHER / EXPANDIR
    ---------------------------------------------------------- */
    var sidebarRecolhida = false;
    sidebarToggleBtn && sidebarToggleBtn.addEventListener('click', function () {
        sidebarRecolhida = !sidebarRecolhida;
        sidebar           && sidebar.classList.toggle('recolhida', sidebarRecolhida);
        conteudoPrincipal && conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);
        if (sidebarToggleIcone) sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
        sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
    });

    /* ----------------------------------------------------------
       NAVEGAÇÃO ENTRE SECÇÕES
    ---------------------------------------------------------- */
    var mapaSecoes = {
        'dashboard':    'secao_dashboard',
        'minhas_vagas': 'secao_minhas_vagas',
        'candidatos':   'secao_candidatos',
        'configuracoes':'secao_configuracoes'
    };

    function navegarParaSecao(alvo) {
        if (!mapaSecoes[alvo]) return;
        document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (l) {
            l.classList.toggle('sidebar_nav_link_ativo', l.dataset.secao === alvo);
        });
        Object.values(mapaSecoes).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('conteudo_secao_oculta');
        });
        var secaoAlvo = document.getElementById(mapaSecoes[alvo]);
        if (secaoAlvo) { secaoAlvo.classList.remove('conteudo_secao_oculta'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        if (window.innerWidth < 768) fecharSidebar();
    }

    document.querySelectorAll('.sidebar_nav_link[data-secao]').forEach(function (link) {
        link.addEventListener('click', function (e) { e.preventDefault(); navegarParaSecao(link.dataset.secao); });
    });

    /* Botões com data-secao fora da sidebar */
    document.querySelectorAll('[data-secao]:not(.sidebar_nav_link)').forEach(function (btn) {
        btn.addEventListener('click', function () { navegarParaSecao(btn.dataset.secao); });
    });

    /* ----------------------------------------------------------
       FILTRO LISTA LATERAL DE VAGAS (dashboard)
    ---------------------------------------------------------- */
    var vagasFiltroLista = document.getElementById('vagas_filtro_lista');
    vagasFiltroLista && vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            vagasFiltroLista.querySelectorAll('.vaga_filtro_item').forEach(function (b) { b.classList.remove('vaga_filtro_item_ativo'); });
            btn.classList.add('vaga_filtro_item_ativo');
        });
    });

    /* ----------------------------------------------------------
       BUSCA + FILTRO CANDIDATOS (dashboard)
    ---------------------------------------------------------- */
    var buscaCandidatos = document.getElementById('busca_candidatos');
    var filtroStatus    = document.getElementById('filtro_status');
    var candidatosLista = document.getElementById('candidatos_lista');
    var semResultados   = document.getElementById('sem_resultados');
    var todosCandidatos = candidatosLista ? Array.from(candidatosLista.querySelectorAll('.candidato_card')) : [];

    function aplicarFiltrosCandidatos() {
        var termo  = buscaCandidatos ? buscaCandidatos.value.toLowerCase().trim() : '';
        var status = filtroStatus    ? filtroStatus.value : 'todos';
        var visiveis = 0;
        todosCandidatos.forEach(function (card) {
            var nome       = card.dataset.nome   || '';
            var cardStatus = card.dataset.status || '';
            var mostrar    = (!termo || nome.includes(termo)) && (status === 'todos' || cardStatus === status);
            card.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });
        semResultados && semResultados.classList.toggle('visivel', visiveis === 0);
    }

    buscaCandidatos && buscaCandidatos.addEventListener('input',  aplicarFiltrosCandidatos);
    filtroStatus    && filtroStatus.addEventListener('change', aplicarFiltrosCandidatos);

    /* ----------------------------------------------------------
       DROPDOWNS DE STATUS (dashboard + secção candidatos)
    ---------------------------------------------------------- */
    var classesStatus = {
        triagem:    'status_triagem',
        teste:      'status_teste',
        entrevista: 'status_entrevista',
        aprovado:   'status_aprovado',
        rejeitado:  'status_rejeitado'
    };
    var rotulos = { triagem:'Triagem', teste:'Teste', entrevista:'Entrevista', aprovado:'Aprovado', rejeitado:'Rejeitado' };

    function inicializarDropdowns(escopo) {
        var contexto = escopo || document;

        contexto.querySelectorAll('.candidato_status_btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var id       = btn.dataset.candidato;
                var dropdown = document.getElementById('dropdown_' + id);
                var seta     = document.getElementById('seta_' + id);
                document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
                    if (d !== dropdown) {
                        d.classList.remove('aberto');
                        var outroId = d.id.replace('dropdown_', '');
                        var outraSeta = document.getElementById('seta_' + outroId);
                        outraSeta && outraSeta.classList.remove('aberto');
                    }
                });
                dropdown && dropdown.classList.toggle('aberto');
                seta     && seta.classList.toggle('aberto');
            });
        });

        contexto.querySelectorAll('.status_dropdown_item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                var novoStatus = item.dataset.statusValor;
                var alvo       = item.dataset.alvo;
                var btn        = document.querySelector('[data-candidato="' + alvo + '"]');
                var emblema    = btn && btn.querySelector('.status_emblema');
                var dropdown   = document.getElementById('dropdown_' + alvo);
                var seta       = document.getElementById('seta_' + alvo);
                var card       = btn && btn.closest('.candidato_card, .candidato_secao_card');

                if (emblema && novoStatus) {
                    Object.values(classesStatus).forEach(function (cls) { emblema.classList.remove(cls); });
                    emblema.classList.add(classesStatus[novoStatus] || '');
                    emblema.textContent = rotulos[novoStatus] || novoStatus;
                }
                if (card) {
                    card.dataset.status      = novoStatus;
                    card.dataset.statusCand  = novoStatus;
                }
                dropdown && dropdown.classList.remove('aberto');
                seta     && seta.classList.remove('aberto');
                aplicarFiltrosCandidatos();
                aplicarFiltrosCandidatosSecao();
            });
        });
    }

    inicializarDropdowns();

    document.addEventListener('click', function () {
        document.querySelectorAll('.status_dropdown.aberto').forEach(function (d) {
            d.classList.remove('aberto');
            var seta = document.getElementById('seta_' + d.id.replace('dropdown_', ''));
            seta && seta.classList.remove('aberto');
        });
    });

    /* ----------------------------------------------------------
       EXPANSÃO DETALHES CANDIDATO (dashboard)
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
       TABELA MINHAS VAGAS — busca e filtro
    ---------------------------------------------------------- */
    var buscaMinhasVagas   = document.getElementById('busca_minhas_vagas');
    var filtroStatusVagas  = document.getElementById('filtro_status_vagas');
    var linhasVagas        = document.querySelectorAll('#tbody_vagas .tabela_tr');
    var tabelaVazia        = document.getElementById('tabela_vazia');

    function filtrarTabelaVagas() {
        var termo  = buscaMinhasVagas  ? buscaMinhasVagas.value.toLowerCase().trim() : '';
        var status = filtroStatusVagas ? filtroStatusVagas.value : 'todos';
        var visiveis = 0;
        linhasVagas.forEach(function (linha) {
            var mostrar = (!termo || (linha.dataset.titulo || '').includes(termo)) &&
                          (status === 'todos' || linha.dataset.status === status);
            linha.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });
        tabelaVazia && tabelaVazia.classList.toggle('visivel', visiveis === 0);
    }

    buscaMinhasVagas  && buscaMinhasVagas.addEventListener('input',  filtrarTabelaVagas);
    filtroStatusVagas && filtroStatusVagas.addEventListener('change', filtrarTabelaVagas);

    /* ----------------------------------------------------------
       MODAL NOVA / EDITAR VAGA
    ---------------------------------------------------------- */
    var modal          = document.getElementById('modal_nova_vaga');
    var modalOverlay   = document.getElementById('modal_overlay');
    var btnFechar      = document.getElementById('modal_fechar');
    var btnCancelar    = document.getElementById('modal_cancelar');
    var formNovaVaga   = document.getElementById('form_nova_vaga');
    var btnPublicar    = document.getElementById('btn_publicar');
    var btnPublicarTxt = document.getElementById('btn_publicar_texto');
    var iconePublicar  = document.getElementById('icone_publicar');
    var erroGeral      = document.getElementById('modal_erro_geral');
    var modalTituloEl  = document.getElementById('modal_titulo_texto');
    var modalSubEl     = document.getElementById('modal_subtitulo_texto');
    var modoEdicao     = false;
    var linhaEditando  = null;

    function preencherModal(linha) {
        /* Preenche o formulário com os dados da vaga da linha da tabela */
        var d = linha ? linha.dataset : {};
        var campo = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
        campo('vaga_titulo',        d.vagaTitulo);
        campo('vaga_localizacao',   d.vagaLocalizacao);
        campo('vaga_modalidade',    d.vagaModalidade);
        campo('vaga_tipo',          d.vagaTipo);
        campo('vaga_salario',       d.vagaSalario);
        campo('vaga_descricao',     d.vagaDescricao);
        campo('vaga_area',          d.vagaArea);
        campo('vaga_status_modal',  d.vagaStatus);
    }

    function limparModal() {
        formNovaVaga && formNovaVaga.reset();
        /* Restaura etapas padrão */
        var lista = document.getElementById('lista_etapas');
        if (lista) {
            lista.innerHTML =
                '<div class="etapa_item"><div class="etapa_numero">1</div><input type="text" class="campo_texto campo_lista_input" name="etapas[]" value="Triagem"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button></div>' +
                '<div class="etapa_item"><div class="etapa_numero">2</div><input type="text" class="campo_texto campo_lista_input" name="etapas[]" value="Teste Técnico"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button></div>' +
                '<div class="etapa_item"><div class="etapa_numero">3</div><input type="text" class="campo_texto campo_lista_input" name="etapas[]" value="Entrevista"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button></div>';
            inicializarRemoveresEtapas();
            atualizarNumerosEtapas();
        }
        /* Limpa lista de requisitos */
        var listaReq = document.getElementById('lista_requisitos');
        if (listaReq) {
            listaReq.innerHTML = '<div class="campo_lista_item"><input type="text" class="campo_texto campo_lista_input" placeholder="Ex: Experiência mínima de 3 anos com React" name="requisitos[]"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button></div>';
            inicializarRemoveres(listaReq);
        }
        /* Limpa benefícios */
        var listaBen = document.getElementById('lista_beneficios');
        if (listaBen) {
            listaBen.innerHTML = '<div class="campo_lista_item"><input type="text" class="campo_texto campo_lista_input" placeholder="Ex: Plano de saúde" name="beneficios[]"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button></div>';
            inicializarRemoveres(listaBen);
        }
        /* Limpa erros */
        formNovaVaga && formNovaVaga.querySelectorAll('.campo_invalido').forEach(function (c) { c.classList.remove('campo_invalido'); });
        formNovaVaga && formNovaVaga.querySelectorAll('.campo_erro').forEach(function (e) { e.textContent = ''; });
        erroGeral && erroGeral.classList.remove('visivel');
    }

    function abrirModal(editar, linha) {
        if (!modal || !modalOverlay) return;
        modoEdicao    = !!editar;
        linhaEditando = editar ? linha : null;

        if (editar) {
            if (modalTituloEl) modalTituloEl.textContent = 'Editar Vaga';
            if (modalSubEl)    modalSubEl.textContent    = 'Actualize os dados da vaga seleccionada';
            if (btnPublicarTxt) btnPublicarTxt.textContent = 'Guardar Alterações';
            limparModal();
            linha && preencherModal(linha);
        } else {
            if (modalTituloEl) modalTituloEl.textContent = 'Nova Vaga';
            if (modalSubEl)    modalSubEl.textContent    = 'Preencha os dados para publicar uma nova oportunidade';
            if (btnPublicarTxt) btnPublicarTxt.textContent = 'Publicar Vaga';
            limparModal();
        }

        if (iconePublicar)  iconePublicar.className = 'fa-solid fa-arrow-right';
        if (btnPublicar)  { btnPublicar.disabled = false; btnPublicar.style.background = ''; }

        modal.classList.add('ativo');
        modalOverlay.classList.add('ativo');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { var p = modal.querySelector('input'); p && p.focus(); }, 250);
    }

    function fecharModal() {
        if (!modal || !modalOverlay) return;
        modal.classList.remove('ativo');
        modalOverlay.classList.remove('ativo');
        document.body.style.overflow = '';
        modoEdicao = false; linhaEditando = null;
    }

    /* Botões abrir modal (nova vaga — dashboard e secção vagas) */
    document.getElementById('btn_nova_vaga')       && document.getElementById('btn_nova_vaga').addEventListener('click',       function () { abrirModal(false); });
    document.getElementById('btn_nova_vaga_vagas') && document.getElementById('btn_nova_vaga_vagas').addEventListener('click', function () { abrirModal(false); });
    document.getElementById('btn_nova_vaga_vazio') && document.getElementById('btn_nova_vaga_vazio').addEventListener('click', function () { abrirModal(false); });

    btnFechar    && btnFechar.addEventListener('click',    fecharModal);
    btnCancelar  && btnCancelar.addEventListener('click',  fecharModal);
    modalOverlay && modalOverlay.addEventListener('click', fecharModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('ativo')) fecharModal();
    });

    /* Delegação de cliques na tabela de vagas */
    var tbodyVagas = document.getElementById('tbody_vagas');
    tbodyVagas && tbodyVagas.addEventListener('click', function (e) {
        var btnEditar = e.target.closest('.tabela_btn_editar');
        var btnExcluir = e.target.closest('.tabela_btn_excluir');
        if (btnEditar) {
            var linha = btnEditar.closest('.tabela_tr');
            abrirModal(true, linha);
        }
        if (btnExcluir) {
            var linhaEx = btnExcluir.closest('.tabela_tr');
            var titulo  = btnExcluir.dataset.titulo || 'esta vaga';
            abrirModalExcluir(linhaEx, titulo);
        }
    });

    /* Validação + submit */
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

        setErro(titulo,      'erro_vaga_titulo',      (!titulo || !titulo.value.trim())      ? 'O título é obrigatório.'      : '');
        setErro(localizacao, 'erro_vaga_localizacao', (!localizacao || !localizacao.value.trim()) ? 'A localização é obrigatória.' : '');
        setErro(descricao,   'erro_vaga_descricao',   (!descricao || !descricao.value.trim())   ? 'A descrição é obrigatória.'   : '');

        var listaReq = document.getElementById('lista_requisitos');
        var inputsReq = listaReq ? Array.from(listaReq.querySelectorAll('input')).filter(function (i) { return i.value.trim(); }) : [];
        if (inputsReq.length === 0) {
            var erroReq = document.getElementById('erro_vaga_requisitos');
            if (erroReq) erroReq.textContent = 'Adicione pelo menos um requisito.';
            temErro = true;
        }

        var listaEt = document.getElementById('lista_etapas');
        var inputsEt = listaEt ? Array.from(listaEt.querySelectorAll('input')).filter(function (i) { return i.value.trim(); }) : [];
        if (inputsEt.length === 0) {
            var erroEt = document.getElementById('erro_vaga_etapas');
            if (erroEt) erroEt.textContent = 'Adicione pelo menos uma etapa.';
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
        if (btnPublicarTxt) btnPublicarTxt.textContent = modoEdicao ? 'A guardar...' : 'A publicar...';
        if (iconePublicar)  iconePublicar.className = 'fa-solid fa-spinner fa-spin';

        setTimeout(function () {
            if (btnPublicarTxt) btnPublicarTxt.textContent = modoEdicao ? 'Guardado!' : 'Publicado!';
            if (iconePublicar)  iconePublicar.className = 'fa-solid fa-circle-check';
            if (btnPublicar)    btnPublicar.style.background = 'hsl(142, 71%, 45%)';

            /* Actualiza o título da linha na tabela se for edição */
            if (modoEdicao && linhaEditando && titulo) {
                var titleEl = linhaEditando.querySelector('.vaga_tabela_titulo');
                if (titleEl) titleEl.textContent = titulo.value.trim();
                linhaEditando.dataset.titulo = titulo.value.trim().toLowerCase();
                linhaEditando.dataset.vagaTitulo = titulo.value.trim();
            }

            exibirToast(modoEdicao ? 'Vaga actualizada com sucesso!' : 'Vaga publicada com sucesso!', 'sucesso');

            setTimeout(function () {
                fecharModal();
                formNovaVaga.reset();
            }, 1200);
        }, 1300);
    });

    /* Limpeza de erros ao redigitar */
    formNovaVaga && formNovaVaga.querySelectorAll('input, textarea').forEach(function (campo) {
        campo.addEventListener('input', function () {
            campo.classList.remove('campo_invalido');
            var erroEl = campo.closest('.campo_grupo') && campo.closest('.campo_grupo').querySelector('.campo_erro');
            if (erroEl) erroEl.textContent = '';
            erroGeral && erroGeral.classList.remove('visivel');
        });
    });

    /* ----------------------------------------------------------
       LISTAS DINÂMICAS — REQUISITOS, BENEFÍCIOS, ETAPAS
    ---------------------------------------------------------- */
    function inicializarRemoveres(wrapper) {
        wrapper && wrapper.querySelectorAll('.campo_lista_remover').forEach(function (btn) {
            btn.addEventListener('click', function () { btn.closest('.campo_lista_item') && btn.closest('.campo_lista_item').remove(); });
        });
    }

    function criarItemLista(placeholder, nome) {
        var item = document.createElement('div');
        item.className = 'campo_lista_item';
        item.innerHTML = '<input type="text" class="campo_texto campo_lista_input" placeholder="' + placeholder + '" name="' + nome + '">' +
            '<button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button>';
        item.querySelector('.campo_lista_remover').addEventListener('click', function () { item.remove(); });
        return item;
    }

    var listaRequisitos = document.getElementById('lista_requisitos');
    var btnAddRequisito = document.getElementById('btn_add_requisito');
    inicializarRemoveres(listaRequisitos);
    btnAddRequisito && btnAddRequisito.addEventListener('click', function () {
        var novo = criarItemLista('Ex: Domínio de Node.js e TypeScript', 'requisitos[]');
        listaRequisitos && listaRequisitos.appendChild(novo);
        novo.querySelector('input').focus();
    });

    var listaBeneficios = document.getElementById('lista_beneficios');
    var btnAddBeneficio = document.getElementById('btn_add_beneficio');
    inicializarRemoveres(listaBeneficios);
    btnAddBeneficio && btnAddBeneficio.addEventListener('click', function () {
        var novo = criarItemLista('Ex: Vale alimentação e refeição', 'beneficios[]');
        listaBeneficios && listaBeneficios.appendChild(novo);
        novo.querySelector('input').focus();
    });

    /* Etapas */
    function atualizarNumerosEtapas() {
        document.querySelectorAll('#lista_etapas .etapa_numero').forEach(function (num, i) { num.textContent = i + 1; });
    }

    function inicializarRemoveresEtapas() {
        var lista = document.getElementById('lista_etapas');
        lista && lista.querySelectorAll('.campo_lista_remover').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (document.querySelectorAll('#lista_etapas .etapa_item').length <= 1) return;
                btn.closest('.etapa_item') && btn.closest('.etapa_item').remove();
                atualizarNumerosEtapas();
            });
        });
    }
    inicializarRemoveresEtapas();
    atualizarNumerosEtapas();

    var btnAddEtapa = document.getElementById('btn_add_etapa');
    var listaEtapas = document.getElementById('lista_etapas');
    btnAddEtapa && btnAddEtapa.addEventListener('click', function () {
        var item = document.createElement('div');
        item.className = 'etapa_item';
        item.innerHTML = '<div class="etapa_numero"></div><input type="text" class="campo_texto campo_lista_input" placeholder="Ex: Entrevista final" name="etapas[]"><button type="button" class="campo_lista_remover"><i class="fa-solid fa-xmark"></i></button>';
        item.querySelector('.campo_lista_remover').addEventListener('click', function () {
            if (document.querySelectorAll('#lista_etapas .etapa_item').length <= 1) return;
            item.remove(); atualizarNumerosEtapas();
        });
        listaEtapas && listaEtapas.appendChild(item);
        atualizarNumerosEtapas();
        item.querySelector('input').focus();
    });

    /* ----------------------------------------------------------
       MODAL CONFIRMAÇÃO DE EXCLUSÃO
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

    btnCancelarExcluir  && btnCancelarExcluir.addEventListener('click',  fecharModalExcluir);
    modalExcluirOverlay && modalExcluirOverlay.addEventListener('click', fecharModalExcluir);

    btnConfirmarExcluir && btnConfirmarExcluir.addEventListener('click', function () {
        if (!linhaParaExcluir) return;
        btnConfirmarExcluir.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A excluir...';
        btnConfirmarExcluir.disabled  = true;
        setTimeout(function () {
            linhaParaExcluir.remove();
            fecharModalExcluir();
            filtrarTabelaVagas();
            btnConfirmarExcluir.innerHTML = '<i class="fa-solid fa-trash-can"></i> Excluir';
            btnConfirmarExcluir.disabled  = false;
            exibirToast('Vaga removida com sucesso.', 'sucesso');
        }, 900);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalExcluir && modalExcluir.classList.contains('ativo')) fecharModalExcluir();
    });

    /* ----------------------------------------------------------
       SECÇÃO CANDIDATOS — FILTROS AVANÇADOS
    ---------------------------------------------------------- */
    var buscaCandidatosSecao  = document.getElementById('busca_candidatos_secao');
    var filtroStatusCand      = document.getElementById('filtro_status_candidatos');
    var filtroVagaCand        = document.getElementById('filtro_vaga_candidatos');
    var btnLimparFiltrosCand  = document.getElementById('btn_limpar_filtros_cand');
    var candidatosSecaoLista  = document.getElementById('candidatos_secao_lista');
    var semResultCand         = document.getElementById('sem_resultados_candidatos');
    var todosCandidatosSecao  = candidatosSecaoLista ? Array.from(candidatosSecaoLista.querySelectorAll('.candidato_secao_card')) : [];

    function aplicarFiltrosCandidatosSecao() {
        var termo  = buscaCandidatosSecao ? buscaCandidatosSecao.value.toLowerCase().trim() : '';
        var status = filtroStatusCand     ? filtroStatusCand.value : 'todos';
        var vaga   = filtroVagaCand       ? filtroVagaCand.value   : 'todos';
        var visiveis = 0;
        todosCandidatosSecao.forEach(function (card) {
            var nome        = card.dataset.nome         || '';
            var cardStatus  = card.dataset.statusCand   || '';
            var cardVaga    = card.dataset.vagaCand      || '';
            var mostrar     = (!termo || nome.includes(termo)) &&
                              (status === 'todos' || cardStatus === status) &&
                              (vaga   === 'todos' || cardVaga   === vaga);
            card.classList.toggle('oculto', !mostrar);
            if (mostrar) visiveis++;
        });
        semResultCand && semResultCand.classList.toggle('visivel', visiveis === 0);
    }

    buscaCandidatosSecao && buscaCandidatosSecao.addEventListener('input',  aplicarFiltrosCandidatosSecao);
    filtroStatusCand     && filtroStatusCand.addEventListener('change', aplicarFiltrosCandidatosSecao);
    filtroVagaCand       && filtroVagaCand.addEventListener('change',   aplicarFiltrosCandidatosSecao);
    btnLimparFiltrosCand && btnLimparFiltrosCand.addEventListener('click', function () {
        if (buscaCandidatosSecao) buscaCandidatosSecao.value = '';
        if (filtroStatusCand)     filtroStatusCand.value     = 'todos';
        if (filtroVagaCand)       filtroVagaCand.value       = 'todos';
        aplicarFiltrosCandidatosSecao();
    });

    /* ----------------------------------------------------------
       BOTÕES DE ACÇÃO DOS CANDIDATOS (aprovar, rejeitar, avançar)
    ---------------------------------------------------------- */
    candidatosSecaoLista && candidatosSecaoLista.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var card = btn.closest('.candidato_secao_card');

        /* Rejeitar */
        if (btn.textContent.includes('Rejeitar') || btn.innerHTML.includes('xmark')) {
            if (!card) return;
            var btnStatus = card.querySelector('.candidato_status_btn');
            var emblema   = btnStatus && btnStatus.querySelector('.status_emblema');
            if (emblema) {
                Object.values(classesStatus).forEach(function (cls) { emblema.classList.remove(cls); });
                emblema.classList.add('status_rejeitado');
                emblema.textContent = 'Rejeitado';
            }
            card.dataset.statusCand = 'rejeitado';
            card.classList.add('candidato_card_rejeitado');
            card.classList.remove('candidato_card_aprovado');
            exibirToast('Candidatura rejeitada.', 'erro');
            aplicarFiltrosCandidatosSecao();
        }

        /* Aprovar */
        if (btn.textContent.includes('Aprovar') || btn.innerHTML.includes('circle-check')) {
            if (!card) return;
            var btnStatus2 = card.querySelector('.candidato_status_btn');
            var emblema2   = btnStatus2 && btnStatus2.querySelector('.status_emblema');
            if (emblema2) {
                Object.values(classesStatus).forEach(function (cls) { emblema2.classList.remove(cls); });
                emblema2.classList.add('status_aprovado');
                emblema2.textContent = 'Aprovado';
            }
            card.dataset.statusCand = 'aprovado';
            card.classList.add('candidato_card_aprovado');
            card.classList.remove('candidato_card_rejeitado');
            exibirToast('Candidato aprovado! Envie uma proposta.', 'sucesso');
            aplicarFiltrosCandidatosSecao();
        }

        /* Avançar etapa */
        if (btn.textContent.includes('Avançar')) {
            exibirToast('Candidato avançado para a próxima etapa.', 'sucesso');
        }
    });

    /* ----------------------------------------------------------
       EXPORTAR CANDIDATOS (feedback visual)
    ---------------------------------------------------------- */
    var btnExportar = document.getElementById('btn_exportar_candidatos');
    btnExportar && btnExportar.addEventListener('click', function () {
        var original = btnExportar.innerHTML;
        btnExportar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A exportar...';
        btnExportar.disabled  = true;
        setTimeout(function () {
            btnExportar.innerHTML = original;
            btnExportar.disabled  = false;
            exibirToast('Lista de candidatos exportada com sucesso.', 'sucesso');
        }, 1500);
    });

    /* ----------------------------------------------------------
       GUARDAR CONFIGURAÇÕES
    ---------------------------------------------------------- */
    var btnSalvarConfig = document.getElementById('btn_salvar_config');
    btnSalvarConfig && btnSalvarConfig.addEventListener('click', function () {
        var original = btnSalvarConfig.innerHTML;
        btnSalvarConfig.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';
        btnSalvarConfig.disabled  = true;
        setTimeout(function () {
            btnSalvarConfig.innerHTML = '<i class="fa-solid fa-circle-check"></i> Guardado!';
            btnSalvarConfig.style.background = 'hsl(142, 71%, 45%)';
            exibirToast('Configurações guardadas com sucesso!', 'sucesso');
            setTimeout(function () {
                btnSalvarConfig.innerHTML        = original;
                btnSalvarConfig.style.background = '';
                btnSalvarConfig.disabled         = false;
            }, 3000);
        }, 1300);
    });

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    var todosCards = document.querySelectorAll('.stat_card, .candidato_card, .candidato_secao_card');
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
       TOAST GLOBAL
    ---------------------------------------------------------- */
    var toastEl    = document.getElementById('toast_empresa');
    var toastTimer = null;

    function exibirToast(mensagem, tipo) {
        if (!toastEl) return;
        clearTimeout(toastTimer);
        toastEl.className = 'toast_empresa toast_empresa_' + (tipo === 'sucesso' ? 'sucesso' : 'erro');
        toastEl.innerHTML = '<i class="fa-solid ' + (tipo === 'sucesso' ? 'fa-circle-check' : 'fa-circle-xmark') + '"></i><span>' + mensagem + '</span>';
        toastEl.classList.add('visivel');
        toastTimer = setTimeout(function () { toastEl.classList.remove('visivel'); }, 4000);
    }

});

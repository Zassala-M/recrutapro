/* ============================================================
   criar_perfil.js — RecrutaPro / Criar Perfil
   Apenas interatividade:
   - Menu mobile (abrir/fechar)
   - Toggle visibilidade das senhas
   - Indicador de força da senha
   - Máscara de telefone
   - Upload de arquivo (drag & drop + clique)
   - Validação dos campos em tempo real e no submit
   - Toast de feedback ao enviar
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const cabecalho = document.getElementById('cabecalho');
    const btnMenuMobile = document.getElementById('btn_menu_mobile');
    const menuMobile = document.getElementById('menu_mobile');
    const iconeMenu = document.getElementById('icone_menu');

    const formulario = document.getElementById('formulario_cadastro');
    const btnSubmit = document.getElementById('btn_submit');
    const btnSubmitTexto = document.getElementById('btn_submit_texto');
    const iconeSubmit = document.getElementById('icone_submit');

    const campoNome = document.getElementById('campo_nome');
    const campoEmail = document.getElementById('campo_email');
    const campoTelefone = document.getElementById('campo_telefone');
    const campoSenha = document.getElementById('campo_senha');
    const campoConfirmarSenha = document.getElementById('campo_confirmar_senha');
    const campoFormacao = document.getElementById('campo_formacao');
    const campoExperiencia = document.getElementById('campo_experiencia');
    const campoTermos = document.getElementById('campo_termos');

    const toggleSenha = document.getElementById('toggle_senha');
    const iconeToggleSenha = document.getElementById('icone_toggle_senha');
    const toggleConfirmar = document.getElementById('toggle_confirmar_senha');
    const iconeToggleConfirmar = document.getElementById('icone_toggle_confirmar');

    const forcaBarra = document.getElementById('forca_senha_barra');
    const forcaProgresso = document.getElementById('forca_senha_progresso');
    const forcaTexto = document.getElementById('forca_senha_texto');

    const uploadZona = document.getElementById('upload_zona');
    const campoArquivo = document.getElementById('campo_arquivo');
    const uploadNomeArquivo = document.getElementById('upload_nome_arquivo');
    const uploadIcone = document.getElementById('upload_icone_principal');

    /* ----------------------------------------------------------
       MENU MOBILE
    ---------------------------------------------------------- */
    if (btnMenuMobile && menuMobile) {
        btnMenuMobile.addEventListener('click', function () {
            const estaAberto = menuMobile.classList.toggle('aberto');
            iconeMenu.classList.toggle('fa-bars', !estaAberto);
            iconeMenu.classList.toggle('fa-xmark', estaAberto);
            btnMenuMobile.setAttribute('aria-label', estaAberto ? 'Fechar menu' : 'Abrir menu');
        });

        menuMobile.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', fecharMenuMobile);
        });

        document.addEventListener('click', function (e) {
            if (cabecalho && !cabecalho.contains(e.target)) fecharMenuMobile();
        });
    }

    function fecharMenuMobile() {
        if (!menuMobile) return;
        menuMobile.classList.remove('aberto');
        if (iconeMenu) { iconeMenu.classList.add('fa-bars'); iconeMenu.classList.remove('fa-xmark'); }
        if (btnMenuMobile) btnMenuMobile.setAttribute('aria-label', 'Abrir menu');
    }

    /* ----------------------------------------------------------
       TOGGLE VISIBILIDADE DA SENHA
    ---------------------------------------------------------- */
    function criarToggleSenha(btn, campo, icone) {
        if (!btn || !campo || !icone) return;
        btn.addEventListener('click', function () {
            const visivel = campo.type === 'text';
            campo.type = visivel ? 'password' : 'text';
            icone.classList.toggle('fa-eye', visivel);
            icone.classList.toggle('fa-eye-slash', !visivel);
            btn.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
        });
    }

    criarToggleSenha(toggleSenha, campoSenha, iconeToggleSenha);
    criarToggleSenha(toggleConfirmar, campoConfirmarSenha, iconeToggleConfirmar);

    /* ----------------------------------------------------------
       INDICADOR DE FORÇA DA SENHA
    ---------------------------------------------------------- */
    function calcularForcaSenha(senha) {
        let pontos = 0;
        if (senha.length >= 8) pontos++;
        if (senha.length >= 12) pontos++;
        if (/[A-Z]/.test(senha)) pontos++;
        if (/[0-9]/.test(senha)) pontos++;
        if (/[^A-Za-z0-9]/.test(senha)) pontos++;
        return Math.min(4, Math.ceil(pontos / 1.25));
    }

    const nivelTextos = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

    if (campoSenha && forcaBarra && forcaProgresso && forcaTexto) {
        campoSenha.addEventListener('input', function () {
            const senha = campoSenha.value;

            if (!senha) {
                forcaBarra.classList.remove('visivel');
                forcaTexto.classList.remove('visivel');
                forcaProgresso.className = 'forca_senha_progresso';
                forcaTexto.className = 'forca_senha_texto';
                return;
            }

            const nivel = calcularForcaSenha(senha);
            forcaBarra.classList.add('visivel');
            forcaTexto.classList.add('visivel');

            forcaProgresso.className = 'forca_senha_progresso nivel_' + nivel;
            forcaTexto.className = 'forca_senha_texto visivel nivel_' + nivel;
            forcaTexto.textContent = 'Senha ' + nivelTextos[nivel];
        });
    }

    /* ----------------------------------------------------------
       MÁSCARA DE TELEFONE — (244) 999 999
    ---------------------------------------------------------- */
    if (campoTelefone) {
        campoTelefone.addEventListener('input', function () {
            let v = campoTelefone.value.replace(/\D/g, '');

            // Remove o 244 se o usuário digitar
            if (v.startsWith('244')) {
                v = v.slice(3);
            }

            // Limita a 9 dígitos (número angolano)
            v = v.slice(0, 9);

            // Formata
            if (v.length > 6) {
                v = '+244 ' + v.slice(0, 3) + ' ' + v.slice(3, 6) + ' ' + v.slice(6);
            } else if (v.length > 3) {
                v = '+244 ' + v.slice(0, 3) + ' ' + v.slice(3);
            } else if (v.length > 0) {
                v = '+244 ' + v;
            }

            campoTelefone.value = v;
        });
    }

    /* ----------------------------------------------------------
       UPLOAD DE ARQUIVO — drag & drop + clique
    ---------------------------------------------------------- */
    if (uploadZona && campoArquivo) {

        // Abre o seletor ao clicar na zona (exceto no input que já faz isso)
        uploadZona.addEventListener('click', function (e) {
            if (e.target !== campoArquivo) {
                campoArquivo.click();
            }
        });

        // Teclado: Enter/Espaço
        uploadZona.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                campoArquivo.click();
            }
        });

        // Drag over
        uploadZona.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadZona.classList.add('arrastando');
        });

        uploadZona.addEventListener('dragleave', function () {
            uploadZona.classList.remove('arrastando');
        });

        // Drop
        uploadZona.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadZona.classList.remove('arrastando');
            const arquivo = e.dataTransfer.files[0];
            if (arquivo) processarArquivo(arquivo);
        });

        // Seleção via input
        campoArquivo.addEventListener('change', function () {
            if (campoArquivo.files[0]) processarArquivo(campoArquivo.files[0]);
        });
    }

    function processarArquivo(arquivo) {
        const tiposPermitidos = ['application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxTamanho = 5 * 1024 * 1024; // 5 MB

        if (!tiposPermitidos.includes(arquivo.type)) {
            exibirToast('Formato inválido. Use PDF, DOC ou DOCX.', 'erro');
            return;
        }

        if (arquivo.size > maxTamanho) {
            exibirToast('Arquivo muito grande. Máximo 5MB.', 'erro');
            return;
        }

        if (uploadNomeArquivo) {
            uploadNomeArquivo.textContent = '✓ ' + arquivo.name;
        }

        if (uploadIcone) {
            uploadIcone.className = 'fa-solid fa-circle-check upload_icone';
        }

        if (uploadZona) {
            uploadZona.classList.add('arquivo_selecionado');
            uploadZona.classList.remove('arrastando');
        }
    }

    /* ----------------------------------------------------------
       VALIDAÇÃO DOS CAMPOS
    ---------------------------------------------------------- */
    function definirErro(campoId, mensagem) {
        const erroEl = document.getElementById('erro_' + campoId);
        const campo = document.getElementById('campo_' + campoId);
        if (erroEl) erroEl.textContent = mensagem;
        if (campo) {
            campo.classList.toggle('campo_invalido', !!mensagem);
            campo.classList.toggle('campo_valido', !mensagem && campo.value.trim() !== '');
        }
        return !!mensagem;
    }

    function limparErro(campoId) {
        definirErro(campoId, '');
    }

    function validarCampo(campo) {
        const id = campo.id.replace('campo_', '');
        const valor = campo.value.trim();

        switch (id) {
            case 'nome':
                if (!valor) return definirErro('nome', 'O nome é obrigatório.');
                if (valor.length < 3) return definirErro('nome', 'Digite seu nome completo.');
                return definirErro('nome', '');

            case 'email':
                if (!valor) return definirErro('email', 'O e-mail é obrigatório.');
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor))
                    return definirErro('email', 'Digite um e-mail válido.');
                return definirErro('email', '');

            case 'telefone':
                if (!valor) return definirErro('telefone', 'O telefone é obrigatório.');
                if (valor.replace(/\D/g, '').length < 12)
                    return definirErro('telefone', 'Digite um telefone válido.');
                return definirErro('telefone', '');

            case 'senha':
                if (!valor) return definirErro('senha', 'A senha é obrigatória.');
                if (valor.length < 8) return definirErro('senha', 'A senha deve ter no mínimo 8 caracteres.');
                return definirErro('senha', '');

            case 'confirmar_senha':
                if (!valor) return definirErro('confirmar_senha', 'Confirme sua senha.');
                if (campoSenha && valor !== campoSenha.value)
                    return definirErro('confirmar_senha', 'As senhas não coincidem.');
                return definirErro('confirmar_senha', '');

            case 'formacao':
                if (!valor) return definirErro('formacao', 'A formação acadêmica é obrigatória.');
                return definirErro('formacao', '');

            case 'experiencia':
                if (!valor) return definirErro('experiencia', 'Descreva sua experiência profissional.');
                if (valor.length < 20) return definirErro('experiencia', 'Seja um pouco mais descritivo.');
                return definirErro('experiencia', '');

            default:
                return false;
        }
    }

    // Validação em tempo real (blur)
    [campoNome, campoEmail, campoTelefone, campoSenha,
        campoConfirmarSenha, campoFormacao, campoExperiencia].forEach(function (campo) {
            if (!campo) return;
            campo.addEventListener('blur', function () { validarCampo(campo); });
            campo.addEventListener('input', function () {
                // Limpa erro enquanto digita se já havia erro
                if (campo.classList.contains('campo_invalido')) validarCampo(campo);
                // Re-valida confirmação se alterar a senha
                if (campo === campoSenha && campoConfirmarSenha && campoConfirmarSenha.value) {
                    validarCampo(campoConfirmarSenha);
                }
            });
        });

    /* ----------------------------------------------------------
       SUBMIT DO FORMULÁRIO
    ---------------------------------------------------------- */
    if (formulario) {
        formulario.addEventListener('submit', function (e) {
            e.preventDefault();

            // Valida todos os campos obrigatórios
            const campos = [campoNome, campoEmail, campoTelefone, campoSenha,
                campoConfirmarSenha, campoFormacao, campoExperiencia];
            let temErro = false;

            campos.forEach(function (campo) {
                if (campo && validarCampo(campo)) temErro = true;
            });

            // Valida termos
            if (campoTermos && !campoTermos.checked) {
                const erroTermos = document.getElementById('erro_termos');
                if (erroTermos) erroTermos.textContent = 'Você precisa aceitar os termos para continuar.';
                temErro = true;
            } else {
                const erroTermos = document.getElementById('erro_termos');
                if (erroTermos) erroTermos.textContent = '';
            }

            if (temErro) {
                // Rola até o primeiro campo com erro
                const primeiroErro = formulario.querySelector('.campo_invalido');
                if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Simula envio
            if (btnSubmit) btnSubmit.disabled = true;
            if (btnSubmitTexto) btnSubmitTexto.textContent = 'Criando perfil...';
            if (iconeSubmit) {
                iconeSubmit.className = 'fa-solid fa-spinner fa-spin';
            }

            setTimeout(function () {
                if (btnSubmit) btnSubmit.disabled = false;
                if (btnSubmitTexto) btnSubmitTexto.textContent = 'Perfil criado!';
                if (iconeSubmit) iconeSubmit.className = 'fa-solid fa-circle-check';
                if (btnSubmit) btnSubmit.style.background = 'hsl(142, 71%, 45%)';

                exibirToast('Perfil criado com sucesso! Bem-vindo(a) ao RecrutaPro.', 'sucesso');

                // Restaura botão após alguns segundos
                setTimeout(function () {
                    if (btnSubmit) {
                        btnSubmit.style.background = '';
                        btnSubmit.disabled = false;
                    }
                    if (btnSubmitTexto) btnSubmitTexto.textContent = 'Criar Perfil';
                    if (iconeSubmit) iconeSubmit.className = 'fa-solid fa-arrow-right';
                }, 4000);

            }, 1800);
        });
    }

    /* ----------------------------------------------------------
       TOAST DE NOTIFICAÇÃO
    ---------------------------------------------------------- */
    function exibirToast(mensagem, tipo) {
        // Remove toast anterior se existir
        const existente = document.querySelector('.toast');
        if (existente) existente.remove();

        const toast = document.createElement('div');
        toast.className = 'toast toast_' + (tipo === 'sucesso' ? 'sucesso' : 'erro');

        const icone = tipo === 'sucesso' ? 'fa-circle-check' : 'fa-circle-xmark';
        toast.innerHTML =
            '<i class="fa-solid ' + icone + '"></i>' +
            '<span>' + mensagem + '</span>';

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('saindo');
            setTimeout(function () { toast.remove(); }, 350);
        }, 4000);
    }

});



/* ============================================================
   criar_empresa.js — RecrutaPro / Cadastro de Empresa
   Apenas interatividade:
   - Menu mobile (abrir/fechar)
   - Toggle visibilidade das senhas
   - Indicador de força da senha
   - Máscara de telefone
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

    const formulario = document.getElementById('formulario_empresa');
    const btnSubmit = document.getElementById('btn_submit');
    const btnSubmitTexto = document.getElementById('btn_submit_texto');
    const iconeSubmit = document.getElementById('icone_submit');

    const campoNome = document.getElementById('campo_nome');
    const campoEmail = document.getElementById('campo_email');
    const campoTelefone = document.getElementById('campo_telefone');
    const campoSenha = document.getElementById('campo_senha');
    const campoConfirmarSenha = document.getElementById('campo_confirmar_senha');
    const campoArea = document.getElementById('campo_area');
    const campoTermos = document.getElementById('campo_termos');

    const toggleSenha = document.getElementById('toggle_senha');
    const iconeToggleSenha = document.getElementById('icone_toggle_senha');
    const toggleConfirmar = document.getElementById('toggle_confirmar');
    const iconeToggleConfirmar = document.getElementById('icone_toggle_confirmar');

    const forcaBarra = document.getElementById('forca_senha_barra');
    const forcaProgresso = document.getElementById('forca_senha_progresso');
    const forcaTexto = document.getElementById('forca_senha_texto');

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
       TOGGLE VISIBILIDADE DAS SENHAS
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
    function calcularForca(senha) {
        let pts = 0;
        if (senha.length >= 8) pts++;
        if (senha.length >= 12) pts++;
        if (/[A-Z]/.test(senha)) pts++;
        if (/[0-9]/.test(senha)) pts++;
        if (/[^A-Za-z0-9]/.test(senha)) pts++;
        return Math.min(4, Math.ceil(pts / 1.25));
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

            const nivel = calcularForca(senha);
            forcaBarra.classList.add('visivel');
            forcaTexto.classList.add('visivel');
            forcaProgresso.className = 'forca_senha_progresso nivel_' + nivel;
            forcaTexto.className = 'forca_senha_texto visivel nivel_' + nivel;
            forcaTexto.textContent = 'Senha ' + nivelTextos[nivel];
        });
    }

    /* ----------------------------------------------------------
       MÁSCARA DE TELEFONE — (99) 99999-9999
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
       VALIDAÇÃO DOS CAMPOS
    ---------------------------------------------------------- */
    function definirErro(id, mensagem) {
        const erroEl = document.getElementById('erro_' + id);
        const campo = document.getElementById('campo_' + id);
        if (erroEl) erroEl.textContent = mensagem;
        if (campo) {
            campo.classList.toggle('campo_invalido', !!mensagem);
            campo.classList.toggle('campo_valido', !mensagem && campo.value.trim() !== '');
        }
        return !!mensagem;
    }

    function validarCampo(campo) {
        const id = campo.id.replace('campo_', '');
        const valor = campo.value.trim();

        switch (id) {
            case 'nome':
                if (!valor) return definirErro('nome', 'O nome da empresa é obrigatório.');
                if (valor.length < 2) return definirErro('nome', 'Digite um nome válido.');
                return definirErro('nome', '');

            case 'email':
                if (!valor) return definirErro('email', 'O e-mail corporativo é obrigatório.');
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
                if (valor.length < 8)
                    return definirErro('senha', 'A senha deve ter no mínimo 8 caracteres.');
                return definirErro('senha', '');

            case 'confirmar_senha':
                if (!valor) return definirErro('confirmar_senha', 'Confirme sua senha.');
                if (campoSenha && valor !== campoSenha.value)
                    return definirErro('confirmar_senha', 'As senhas não coincidem.');
                return definirErro('confirmar_senha', '');

            case 'area':
                if (!valor) return definirErro('area', 'Selecione a área de atuação.');
                return definirErro('area', '');

            default:
                return false;
        }
    }

    /* Validação em tempo real ao sair do campo (blur) */
    [campoNome, campoEmail, campoTelefone, campoSenha, campoConfirmarSenha, campoArea]
        .forEach(function (campo) {
            if (!campo) return;
            campo.addEventListener('blur', function () { validarCampo(campo); });
            campo.addEventListener('input', function () {
                if (campo.classList.contains('campo_invalido')) validarCampo(campo);
                /* Re-valida confirmação se a senha principal mudar */
                if (campo === campoSenha && campoConfirmarSenha && campoConfirmarSenha.value) {
                    validarCampo(campoConfirmarSenha);
                }
            });
            /* Select usa change em vez de input */
            if (campo.tagName === 'SELECT') {
                campo.addEventListener('change', function () { validarCampo(campo); });
            }
        });

    /* ----------------------------------------------------------
       SUBMIT DO FORMULÁRIO
    ---------------------------------------------------------- */
    if (formulario) {
        formulario.addEventListener('submit', function (e) {
            e.preventDefault();

            const campos = [campoNome, campoEmail, campoTelefone, campoSenha, campoConfirmarSenha, campoArea];
            let temErro = false;

            campos.forEach(function (campo) {
                if (campo && validarCampo(campo)) temErro = true;
            });

            /* Valida termos */
            if (campoTermos && !campoTermos.checked) {
                const erroTermos = document.getElementById('erro_termos');
                if (erroTermos) erroTermos.textContent = 'Você precisa aceitar os termos para continuar.';
                temErro = true;
            } else {
                const erroTermos = document.getElementById('erro_termos');
                if (erroTermos) erroTermos.textContent = '';
            }

            if (temErro) {
                const primeiroErro = formulario.querySelector('.campo_invalido');
                if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            /* Simula envio */
            if (btnSubmit) btnSubmit.disabled = true;
            if (btnSubmitTexto) btnSubmitTexto.textContent = 'Criando conta...';
            if (iconeSubmit) iconeSubmit.className = 'fa-solid fa-spinner fa-spin';

            setTimeout(function () {
                if (btnSubmit) btnSubmit.disabled = false;
                if (btnSubmitTexto) btnSubmitTexto.textContent = 'Conta criada!';
                if (iconeSubmit) iconeSubmit.className = 'fa-solid fa-circle-check';
                if (btnSubmit) btnSubmit.style.background = 'hsl(142, 71%, 45%)';

                exibirToast('Empresa cadastrada com sucesso! Bem-vinda ao RecrutaPro.', 'sucesso');

                setTimeout(function () {
                    if (btnSubmit) btnSubmit.style.background = '';
                    if (btnSubmit) btnSubmit.disabled = false;
                    if (btnSubmitTexto) btnSubmitTexto.textContent = 'Criar Conta';
                    if (iconeSubmit) iconeSubmit.className = 'fa-solid fa-arrow-right';
                }, 4000);

            }, 1800);
        });
    }

    /* ----------------------------------------------------------
       TOAST DE NOTIFICAÇÃO
    ---------------------------------------------------------- */
    function exibirToast(mensagem, tipo) {
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

/* ============================================================
   login.js — RecrutaPro / Página de Login
   Apenas interatividade:
   - Toggle de visibilidade da senha
   - Validação dos campos (blur + submit)
   - Simulação de login com feedback visual (carregando → erro / sucesso)
   - Modal de recuperação de senha (abrir / fechar / enviar link)
   - Fechar modal ao clicar fora ou com Esc
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const formulario         = document.getElementById('login_formulario');
    const btnEntrar          = document.getElementById('btn_entrar');
    const btnEntrarTexto     = document.getElementById('btn_entrar_texto');
    const iconeEntrar        = document.getElementById('icone_entrar');

    const campoEmail         = document.getElementById('campo_email');
    const campoSenha         = document.getElementById('campo_senha');

    const toggleSenha        = document.getElementById('toggle_senha');
    const iconeToggleSenha   = document.getElementById('icone_toggle_senha');

    const loginErroGeral     = document.getElementById('login_erro_geral');
    const loginErroMsg       = document.getElementById('login_erro_msg');

    /* Modal */
    const btnEsqueciSenha    = document.getElementById('btn_esqueci_senha');
    const modalOverlay       = document.getElementById('modal_overlay');
    const modalFecharBtn     = document.getElementById('modal_fechar_btn');
    const campoRecuperarEmail= document.getElementById('campo_recuperar_email');
    const btnEnviarLink      = document.getElementById('btn_enviar_link');
    const btnEnviarTexto     = document.getElementById('btn_enviar_texto');
    const iconeEnviar        = document.getElementById('icone_enviar');
    const modalConfirmacao   = document.getElementById('modal_confirmacao');

    /* ----------------------------------------------------------
       TOGGLE VISIBILIDADE DA SENHA
    ---------------------------------------------------------- */
    if (toggleSenha && campoSenha && iconeToggleSenha) {
        toggleSenha.addEventListener('click', function () {
            const visivel = campoSenha.type === 'text';
            campoSenha.type = visivel ? 'password' : 'text';
            iconeToggleSenha.classList.toggle('fa-eye',       visivel);
            iconeToggleSenha.classList.toggle('fa-eye-slash', !visivel);
            toggleSenha.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
        });
    }

    /* ----------------------------------------------------------
       VALIDAÇÃO DOS CAMPOS
    ---------------------------------------------------------- */
    function definirErro(campoId, erroId, mensagem) {
        const campo = document.getElementById(campoId);
        const erro  = document.getElementById(erroId);
        if (erro)  erro.textContent = mensagem;
        if (campo) campo.classList.toggle('campo_invalido', !!mensagem);
        return !!mensagem;
    }

    function validarEmail() {
        const valor = campoEmail ? campoEmail.value.trim() : '';
        if (!valor)
            return definirErro('campo_email', 'erro_email', 'O e-mail é obrigatório.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor))
            return definirErro('campo_email', 'erro_email', 'Digite um e-mail válido.');
        return definirErro('campo_email', 'erro_email', '');
    }

    function validarSenha() {
        const valor = campoSenha ? campoSenha.value : '';
        if (!valor)
            return definirErro('campo_senha', 'erro_senha', 'A senha é obrigatória.');
        if (valor.length < 6)
            return definirErro('campo_senha', 'erro_senha', 'A senha deve ter pelo menos 6 caracteres.');
        return definirErro('campo_senha', 'erro_senha', '');
    }

    /* Validação em blur */
    campoEmail && campoEmail.addEventListener('blur', validarEmail);
    campoSenha && campoSenha.addEventListener('blur', validarSenha);

    /* Limpa erro ao digitar novamente */
    campoEmail && campoEmail.addEventListener('input', function () {
        if (campoEmail.classList.contains('campo_invalido')) validarEmail();
        ocultarErroGeral();
    });

    campoSenha && campoSenha.addEventListener('input', function () {
        if (campoSenha.classList.contains('campo_invalido')) validarSenha();
        ocultarErroGeral();
    });

    /* ----------------------------------------------------------
       ERRO GERAL
    ---------------------------------------------------------- */
    function mostrarErroGeral(mensagem) {
        if (loginErroGeral) loginErroGeral.classList.add('visivel');
        if (loginErroMsg)   loginErroMsg.textContent = mensagem || 'Credenciais inválidas. Tente novamente.';
    }

    function ocultarErroGeral() {
        loginErroGeral && loginErroGeral.classList.remove('visivel');
    }

    /* ----------------------------------------------------------
       SUBMIT DO FORMULÁRIO — simulação de autenticação
    ---------------------------------------------------------- */
    formulario && formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        const erroE = validarEmail();
        const erroS = validarSenha();
        if (erroE || erroS) return;

        ocultarErroGeral();

        /* Estado de carregamento */
        if (btnEntrar)       btnEntrar.disabled = true;
        if (btnEntrarTexto)  btnEntrarTexto.textContent = 'Entrando...';
        if (iconeEntrar)     iconeEntrar.className = 'fa-solid fa-spinner fa-spin';

        const email = campoEmail ? campoEmail.value.trim().toLowerCase() : '';
        const senha = campoSenha ? campoSenha.value : '';

        /* Simula chamada de autenticação (1.2s) */
        setTimeout(function () {

            /* Credenciais aceitas: admin/admin123 ou qualquer e-mail válido com senha ≥ 6 */
            const credenciaisValidas =
                (email === 'admin' || email.includes('@')) && senha.length >= 6;

            if (credenciaisValidas) {
                /* Sucesso */
                if (btnEntrar)      btnEntrar.style.background = 'hsl(152, 69%, 46%)';
                if (btnEntrarTexto) btnEntrarTexto.textContent = 'Acesso liberado!';
                if (iconeEntrar)    iconeEntrar.className = 'fa-solid fa-circle-check';

                /* Redireciona após breve pausa (simulado) */
                setTimeout(function () {
                    if (btnEntrar)      btnEntrar.disabled = false;
                    if (btnEntrar)      btnEntrar.style.background = '';
                    if (btnEntrarTexto) btnEntrarTexto.textContent = 'Entrar';
                    if (iconeEntrar)    iconeEntrar.className = 'fa-solid fa-arrow-right';
                    window.location.href = 'admin.html';
                }, 3000);

            } else {
                /* Falha */
                if (btnEntrar)      btnEntrar.disabled = false;
                if (btnEntrarTexto) btnEntrarTexto.textContent = 'Entrar';
                if (iconeEntrar)    iconeEntrar.className = 'fa-solid fa-arrow-right';
                mostrarErroGeral('E-mail ou senha incorretos. Verifique suas credenciais.');

                /* Anima os campos inválidos */
                if (campoEmail) campoEmail.classList.add('campo_invalido');
                if (campoSenha) campoSenha.classList.add('campo_invalido');
            }

        }, 1200);
    });

    /* ---- Tecla Enter nos campos ---- */
    [campoEmail, campoSenha].forEach(function (campo) {
        campo && campo.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                formulario && formulario.requestSubmit
                    ? formulario.requestSubmit()
                    : formulario && formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
        });
    });

    /* ----------------------------------------------------------
       MODAL — RECUPERAR SENHA
    ---------------------------------------------------------- */
    function abrirModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.add('visivel');
        document.body.style.overflow = 'hidden';
        /* Reseta estado */
        if (campoRecuperarEmail) campoRecuperarEmail.value = '';
        definirErro('campo_recuperar_email', 'erro_recuperar_email', '');
        modalConfirmacao && modalConfirmacao.classList.remove('visivel');
        if (btnEnviarLink)  btnEnviarLink.disabled = false;
        if (btnEnviarTexto) btnEnviarTexto.textContent = 'Enviar Link';
        if (iconeEnviar)    iconeEnviar.className = 'fa-solid fa-paper-plane';
        /* Foca o campo de e-mail */
        setTimeout(function () {
            campoRecuperarEmail && campoRecuperarEmail.focus();
        }, 100);
    }

    function fecharModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('visivel');
        document.body.style.overflow = '';
    }

    btnEsqueciSenha && btnEsqueciSenha.addEventListener('click', abrirModal);
    modalFecharBtn  && modalFecharBtn.addEventListener('click', fecharModal);

    /* Fecha ao clicar no overlay (fora do card) */
    modalOverlay && modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) fecharModal();
    });

    /* Fecha com Esc */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('visivel')) {
            fecharModal();
        }
    });

    /* Enviar link de recuperação */
    btnEnviarLink && btnEnviarLink.addEventListener('click', function () {
        const emailRecuperar = campoRecuperarEmail ? campoRecuperarEmail.value.trim() : '';

        if (!emailRecuperar) {
            definirErro('campo_recuperar_email', 'erro_recuperar_email', 'Informe seu e-mail.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRecuperar)) {
            definirErro('campo_recuperar_email', 'erro_recuperar_email', 'Digite um e-mail válido.');
            return;
        }

        definirErro('campo_recuperar_email', 'erro_recuperar_email', '');

        /* Estado de carregamento */
        if (btnEnviarLink)  btnEnviarLink.disabled = true;
        if (btnEnviarTexto) btnEnviarTexto.textContent = 'Enviando...';
        if (iconeEnviar)    iconeEnviar.className = 'fa-solid fa-spinner fa-spin';

        setTimeout(function () {
            /* Mostra confirmação */
            if (btnEnviarLink)  btnEnviarLink.disabled = false;
            if (btnEnviarTexto) btnEnviarTexto.textContent = 'Reenviar Link';
            if (iconeEnviar)    iconeEnviar.className = 'fa-solid fa-paper-plane';
            modalConfirmacao && modalConfirmacao.classList.add('visivel');
        }, 1500);
    });

});

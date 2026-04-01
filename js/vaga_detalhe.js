/* ============================================================
   vaga_detalhe.js — RecrutaPro / Detalhe da Vaga
   Apenas interatividade:
   - Menu mobile (abrir/fechar)
   - Barra de candidatura mobile (aparece ao rolar)
   - Botões "Candidatar-se" com feedback visual
   - Botão "Copiar Link" com feedback de confirmação
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const cabecalho            = document.getElementById('cabecalho');
    const btnMenuMobile        = document.getElementById('btn_menu_mobile');
    const menuMobile           = document.getElementById('menu_mobile');
    const iconeMenu            = document.getElementById('icone_menu');

    const btnCandidatar        = document.getElementById('btn_candidatar');
    const btnCandidatarMobile  = document.getElementById('btn_candidatar_mobile');
    const barraCandidatura     = document.getElementById('barra_candidatura_mobile');

    const btnCopiarLink        = document.getElementById('btn_copiar_link');

    /* ----------------------------------------------------------
       MENU MOBILE — abrir / fechar
    ---------------------------------------------------------- */
    if (btnMenuMobile && menuMobile) {
        btnMenuMobile.addEventListener('click', function () {
            const estaAberto = menuMobile.classList.toggle('aberto');

            iconeMenu.classList.toggle('fa-bars',  !estaAberto);
            iconeMenu.classList.toggle('fa-xmark',  estaAberto);
            btnMenuMobile.setAttribute('aria-label', estaAberto ? 'Fechar menu' : 'Abrir menu');
        });

        // Fecha ao clicar em links internos
        menuMobile.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', fecharMenuMobile);
        });

        // Fecha ao clicar fora
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
       BARRA CANDIDATURA MOBILE — exibe ao rolar
       Aparece quando o topo do cabeçalho da vaga sai da viewport
    ---------------------------------------------------------- */
    if (barraCandidatura) {
        // Só mostra em telas menores que 1024px (lg)
        function verificarBarraMobile() {
            if (window.innerWidth >= 1024) {
                barraCandidatura.classList.remove('visivel');
                return;
            }

            // Exibe a barra depois de rolar 300px
            if (window.scrollY > 300) {
                barraCandidatura.classList.add('visivel');
            } else {
                barraCandidatura.classList.remove('visivel');
            }
        }

        window.addEventListener('scroll', verificarBarraMobile, { passive: true });
        window.addEventListener('resize', verificarBarraMobile);
        verificarBarraMobile(); // verifica estado inicial
    }

    /* ----------------------------------------------------------
       BOTÕES CANDIDATAR-SE — feedback visual
    ---------------------------------------------------------- */
    function acaoCandidatar(btn) {
        if (!btn) return;

        // Estado de carregamento
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        setTimeout(function () {
            // Estado de sucesso
            btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Candidatura enviada!';
            btn.style.background = 'hsl(142, 71%, 45%)';

            setTimeout(function () {
                // Restaura estado original
                btn.innerHTML = textoOriginal;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }, 1200);
    }

    if (btnCandidatar) {
        btnCandidatar.addEventListener('click', function () {
            acaoCandidatar(btnCandidatar);
        });
    }

    if (btnCandidatarMobile) {
        btnCandidatarMobile.addEventListener('click', function () {
            acaoCandidatar(btnCandidatarMobile);
            // Também aciona o botão desktop se visível
            if (btnCandidatar && !btnCandidatar.disabled) {
                // Só atualiza visualmente o desktop sem duplicar o timeout
            }
        });
    }

    /* ----------------------------------------------------------
       BOTÃO COPIAR LINK — copia a URL atual
    ---------------------------------------------------------- */
    if (btnCopiarLink) {
        btnCopiarLink.addEventListener('click', function () {
            const url = window.location.href;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () {
                    mostrarFeedbackCopia();
                }).catch(function () {
                    copiaFallback(url);
                });
            } else {
                copiaFallback(url);
            }
        });
    }

    function copiaFallback(texto) {
        const area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.opacity  = '0';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
            mostrarFeedbackCopia();
        } catch (e) {
            console.warn('Não foi possível copiar o link.');
        }
        document.body.removeChild(area);
    }

    function mostrarFeedbackCopia() {
        if (!btnCopiarLink) return;
        const textoOriginal = btnCopiarLink.innerHTML;
        btnCopiarLink.innerHTML = '<i class="fa-solid fa-circle-check"></i> Link copiado!';
        btnCopiarLink.disabled = true;

        setTimeout(function () {
            btnCopiarLink.innerHTML = textoOriginal;
            btnCopiarLink.disabled = false;
        }, 2500);
    }

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS CARDS
    ---------------------------------------------------------- */
    const cards = document.querySelectorAll('.vaga_card, .sidebar_card');

    if ('IntersectionObserver' in window && cards.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity   = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

        cards.forEach(function (card, i) {
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(18px)';
            card.style.transition = 'opacity 0.4s ease ' + (i * 60) + 'ms, transform 0.4s ease ' + (i * 60) + 'ms';
            observer.observe(card);
        });
    }

});

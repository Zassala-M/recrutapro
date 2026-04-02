document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       REFERÊNCIAS DOM
    ---------------------------------------------------------- */
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar_overlay');
    const btnSidebarMobile = document.getElementById('btn_sidebar_mobile');
    const sidebarToggleBtn = document.getElementById('sidebar_toggle_btn');
    const sidebarToggleIcone = document.getElementById('sidebar_toggle_icone');
    const conteudoPrincipal = document.getElementById('conteudo_principal');

    const canvasBarras = document.getElementById('canvas_barras');
    const canvasDonut = document.getElementById('canvas_donut');

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

    btnSidebarMobile && btnSidebarMobile.addEventListener('click', function () {
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
        sidebar && sidebar.classList.toggle('recolhida', sidebarRecolhida);
        conteudoPrincipal && conteudoPrincipal.classList.toggle('sidebar_recolhida_margem', sidebarRecolhida);
        if (sidebarToggleIcone) sidebarToggleIcone.style.transform = sidebarRecolhida ? 'rotate(180deg)' : '';
        sidebarToggleBtn.setAttribute('aria-label', sidebarRecolhida ? 'Expandir menu' : 'Recolher menu');
    });

    /* ----------------------------------------------------------
       GRÁFICO DE BARRAS — Candidaturas por Mês (Canvas API)
    ---------------------------------------------------------- */
    function desenharBarras() {
        if (!canvasBarras) return;

        const wrapper = canvasBarras.parentElement;
        const largura = wrapper.clientWidth || 500;
        const altura = 280;

        canvasBarras.width = largura;
        canvasBarras.height = altura;

        const ctx = canvasBarras.getContext('2d');

        /* Dados */
        const dados = [
            { mes: 'Jan', valor: 320 },
            { mes: 'Fev', valor: 480 },
            { mes: 'Mar', valor: 390 },
            { mes: 'Abr', valor: 560 },
            { mes: 'Mai', valor: 510 },
            { mes: 'Jun', valor: 620 }
        ];

        const margem = { topo: 20, dir: 20, baixo: 40, esq: 56 };
        const areaLargura = largura - margem.esq - margem.dir;
        const areaAltura = altura - margem.topo - margem.baixo;
        const maxValor = 700;
        const passos = [0, 200, 400, 600];

        /* Limpa */
        ctx.clearRect(0, 0, largura, altura);

        /* Linhas de grade e eixo Y */
        const corGrade = 'hsl(220, 14%, 22%)';
        const corTexto = 'hsl(215, 15%, 55%)';
        const corPrimario = 'hsl(168, 76%, 42%)';
        const corPrimarioFundo = 'hsl(168, 76%, 42%, 0.15)';

        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillStyle = corTexto;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';

        passos.forEach(function (passo) {
            const y = margem.topo + areaAltura - (passo / maxValor) * areaAltura;
            ctx.strokeStyle = corGrade;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margem.esq, y);
            ctx.lineTo(largura - margem.dir, y);
            ctx.stroke();
            ctx.fillStyle = corTexto;
            ctx.fillText(String(passo), margem.esq - 8, y);
        });

        /* Barras */
        const larguraBarra = (areaLargura / dados.length) * 0.5;
        const espacamento = areaLargura / dados.length;

        dados.forEach(function (item, i) {
            const x = margem.esq + i * espacamento + (espacamento - larguraBarra) / 2;
            const altBarra = (item.valor / maxValor) * areaAltura;
            const y = margem.topo + areaAltura - altBarra;

            /* Gradiente da barra */
            const grad = ctx.createLinearGradient(x, y, x, margem.topo + areaAltura);
            grad.addColorStop(0, corPrimario);
            grad.addColorStop(1, corPrimarioFundo);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect
                ? ctx.roundRect(x, y, larguraBarra, altBarra, [4, 4, 0, 0])
                : ctx.rect(x, y, larguraBarra, altBarra);
            ctx.fill();

            /* Rótulo eixo X */
            ctx.fillStyle = corTexto;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(item.mes, x + larguraBarra / 2, margem.topo + areaAltura + 10);
        });
    }

    /* ----------------------------------------------------------
       GRÁFICO DONUT — Vagas por Setor (Canvas API)
    ---------------------------------------------------------- */
    function desenharDonut() {
        if (!canvasDonut) return;

        const tamanho = 180;
        canvasDonut.width = tamanho;
        canvasDonut.height = tamanho;

        const ctx = canvasDonut.getContext('2d');
        const cx = tamanho / 2;
        const cy = tamanho / 2;
        const raioExt = 80;
        const raioInt = 50;

        const fatias = [
            { valor: 0.40, cor: 'hsl(168, 76%, 42%)' },
            { valor: 0.25, cor: 'hsl(195, 80%, 50%)' },
            { valor: 0.20, cor: 'hsl(38, 92%, 50%)' },
            { valor: 0.15, cor: 'hsl(220, 14%, 40%)' }
        ];

        ctx.clearRect(0, 0, tamanho, tamanho);

        let anguloInicio = -Math.PI / 2; /* começa no topo */

        fatias.forEach(function (fatia) {
            const anguloFim = anguloInicio + fatia.valor * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, raioExt, anguloInicio, anguloFim);
            ctx.closePath();

            /* Perfura o centro */
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = fatia.cor;
            ctx.fill();

            anguloInicio = anguloFim;
        });

        /* Buraco central */
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx, cy, raioInt, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        /* Texto central */
        ctx.fillStyle = 'hsl(0, 0%, 63%)';
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('387', cx, cy - 8);

        ctx.fillStyle = 'hsl(215, 15%, 55%)';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText('Vagas', cx, cy + 10);
    }

    /* ----------------------------------------------------------
       ANIMAÇÃO DE ENTRADA NOS STAT CARDS
    ---------------------------------------------------------- */
    const statCards = document.querySelectorAll('.stat_card');

    if ('IntersectionObserver' in window && statCards.length > 0) {
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.05 });

        statCards.forEach(function (card, i) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition = 'opacity 0.4s ease ' + (i * 80) + 'ms, transform 0.4s ease ' + (i * 80) + 'ms';
            observer.observe(card);
        });
    }

    /* ----------------------------------------------------------
       INICIALIZAÇÃO DOS GRÁFICOS
    ---------------------------------------------------------- */
    desenharBarras();
    desenharDonut();

    /* Redesenha barras ao redimensionar */
    let timeoutResize;
    window.addEventListener('resize', function () {
        clearTimeout(timeoutResize);
        timeoutResize = setTimeout(desenharBarras, 120);
    });

});
const modalTermos = document.getElementById("modal_termos");
const modalPrivacidade = document.getElementById("modal_privacidade");

document.getElementById("abrir_termos").onclick = () => {
    modalTermos.classList.add("ativo");
};

document.getElementById("abrir_privacidade").onclick = () => {
    modalPrivacidade.classList.add("ativo");
};

document.querySelectorAll("[data-fechar]").forEach(btn => {
    btn.onclick = () => {
        modalTermos.classList.remove("ativo");
        modalPrivacidade.classList.remove("ativo");
    };
});

document.querySelectorAll(".modal_overlay").forEach(overlay => {
    overlay.onclick = () => {
        modalTermos.classList.remove("ativo");
        modalPrivacidade.classList.remove("ativo");
    };
});
const WA = "5519998807799";

const sales = [
  ["Pão francês", "PDV · balcão", "R$ 18,40"],
  ["NFC-e emitida", "Fiscal", "nº 48211"],
  ["Farinha especial", "Estoque", "−12 un"],
  ["Conta recebida", "Financeiro", "R$ 640,00"],
  ["Pedido delivery", "Força de vendas", "R$ 86,90"],
  ["Ajuste de caixa", "Relatório", "fechado"]
];

function waLink(text) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
}

function initMenu() {
  const btn = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  nodes.forEach((n) => io.observe(n));
}

function initCounters() {
  const nodes = document.querySelectorAll("[data-count]");
  const run = (el) => {
    const end = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const money = el.dataset.money === "1";
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1100);
      const value = Math.round(end * (1 - Math.pow(1 - p, 3)));
      const plain = el.dataset.group === "0" ? String(value) : value.toLocaleString("pt-BR");
      el.textContent = money
        ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : prefix + plain + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(run);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  nodes.forEach((n) => io.observe(n));
}

function initConsole() {
  const box = document.querySelector("[data-console]");
  if (!box) return;
  let i = 0;
  const paint = () => {
    const slice = [0, 1, 2].map((offset) => sales[(i + offset) % sales.length]);
    box.innerHTML = slice.map(([name, meta, value]) => `
      <div class="sale">
        <b>${name}</b><em>${value}</em>
        <small>${meta}</small>
      </div>
    `).join("");
    i = (i + 1) % sales.length;
  };
  paint();
  setInterval(paint, 2600);
}

function initPains() {
  const buttons = [...document.querySelectorAll("[data-pain]")];
  const stage = document.querySelector("[data-pain-stage]");
  if (!buttons.length || !stage) return;
  const stories = {
    estoque: ["O estoque do caderno não fecha com o caixa.", "Entrada, venda e nota no mesmo lugar."],
    suporte: ["O caixa travou e o chamado ficou na fila.", "Grupo exclusivo. Resposta em até 5 minutos."],
    troca: ["Trocar de sistema parece que vai parar a loja.", "A D2C migra os dados e treina a equipe antes da virada."]
  };
  let timer;
  const show = (key) => {
    buttons.forEach((b) => b.classList.toggle("is-on", b.dataset.pain === key));
    const [title, note] = stories[key];
    stage.innerHTML = `<p>${title}</p><small>${note}</small>`;
  };
  const loop = () => {
    const keys = buttons.map((b) => b.dataset.pain);
    let index = keys.findIndex((k) => document.querySelector(`[data-pain="${k}"]`).classList.contains("is-on"));
    index = (index + 1) % keys.length;
    show(keys[index]);
  };
  buttons.forEach((b) => b.addEventListener("click", () => {
    show(b.dataset.pain);
    clearInterval(timer);
    timer = setInterval(loop, 4200);
  }));
  show("estoque");
  timer = setInterval(loop, 4200);
}

function initStatus() {
  const el = document.querySelector("[data-status]");
  if (!el) return;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = day >= 1 && day <= 5 && minutes >= 8 * 60 && minutes < 18 * 60;
  el.classList.toggle("is-closed", !open);
  el.querySelector("span").textContent = open
    ? "Expediente aberto · até 18h"
    : "Fora do expediente · WhatsApp (19) 99880-7799";
}

function maskPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

function initQualifier(root) {
  const state = { segment: "", pain: "", size: "", name: "", phone: "" };
  const panels = [...root.querySelectorAll("[data-step]")];
  const bar = root.querySelector("[data-bar]");
  const error = root.querySelector("[data-error]");
  let step = 0;

  const render = () => {
    panels.forEach((p, i) => { p.hidden = i !== step; });
    if (bar) bar.style.width = `${((step + 1) / panels.length) * 100}%`;
    if (error) error.textContent = "";
  };

  root.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.pick;
      state[group] = btn.dataset.value;
      root.querySelectorAll(`[data-pick="${group}"]`).forEach((b) => b.classList.toggle("is-on", b === btn));
    });
  });

  const phone = root.querySelector("[data-phone]");
  if (phone) {
    phone.addEventListener("input", () => { phone.value = maskPhone(phone.value); });
  }

  root.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (step === 0 && !state.segment) return error.textContent = "Escolha o tipo de loja.";
      if (step === 1 && !state.pain) return error.textContent = "Escolha o que mais trava hoje.";
      if (step === 2 && !state.size) return error.textContent = "Diga o tamanho da operação.";
      step += 1;
      render();
    });
  });
  root.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => { step = Math.max(0, step - 1); render(); });
  });

  const form = root.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = root.querySelector("[data-name]").value.trim();
    const digits = (phone?.value || "").replace(/\D/g, "");
    if (name.length < 2) return error.textContent = "Digite seu nome.";
    if (digits.length < 10) return error.textContent = "Digite um WhatsApp com DDD.";
    state.name = name;
    state.phone = phone.value;
    const text = [
      "Olá, sou " + state.name + ".",
      "Quero o sistema certo para: " + state.segment + ".",
      "Hoje o que mais trava é: " + state.pain + ".",
      "Operação: " + state.size + ".",
      "Meu WhatsApp: " + state.phone + "."
    ].join(" ");
    const done = root.querySelector("[data-done]");
    if (done) {
      done.hidden = false;
      panels.forEach((p) => { p.hidden = true; });
      if (bar) bar.style.width = "100%";
    }
    window.open(waLink(text), "_blank", "noopener");
  });
  render();
}

document.querySelectorAll("[data-qualifier]").forEach(initQualifier);
document.querySelectorAll("[data-wa]").forEach((a) => {
  const text = a.dataset.wa || "Olá, quero conversar sobre o sistema certo para a minha loja.";
  a.href = waLink(text);
  a.target = "_blank";
  a.rel = "noopener";
});

function initTop() {
  const btn = document.querySelector("[data-top]");
  if (!btn) return;
  const onScroll = () => { btn.hidden = window.scrollY < 520; };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initGallery() {
  const box = document.querySelector("[data-lightbox]");
  const bar = document.querySelector("[data-filters]");
  if (bar) {
    const items = [...document.querySelectorAll("[data-kind]")];
    bar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      bar.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-on", item === button));
      const kind = button.dataset.filter;
      items.forEach((item) => { item.hidden = kind !== "todos" && item.dataset.kind !== kind; });
    });
  }
  if (!box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector("p");
  document.querySelectorAll("[data-shot]").forEach((button) => {
    button.addEventListener("click", () => {
      img.src = button.dataset.shot;
      img.alt = button.dataset.alt || "";
      cap.textContent = button.dataset.alt || "";
      box.showModal();
    });
  });
  box.querySelector("[data-close]").addEventListener("click", () => box.close());
  box.addEventListener("click", (event) => { if (event.target === box) box.close(); });
}

initMenu();
initHeader();
initReveal();
initCounters();
initConsole();
initPains();
initStatus();
initTop();
initGallery();

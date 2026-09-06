import { L, I, Ac, vc, wc, xc, bc, Sc } from "./assets/animation-vendor.js";
import { createFramePlayer as Pl } from "./assets/frame-player.js";
function Dc(s) {
  const t = new Ac({ duration: 1.8, easing: (i) => Math.min(1, 1.001 - Math.pow(2, -10 * i)), smoothWheel: true, wheelMultiplier: 0.82, touchMultiplier: 1.5, syncTouch: true });
  return t.on("scroll", I.update), L.ticker.add((i) => {
    t.raf(i * 1e3);
  }), L.ticker.lagSmoothing(0), t;
}
function Lc(s) {
  const t = document.getElementById("cursor-dot"), i = document.getElementById("cursor-ring");
  if (!t || !i) return;
  document.body.classList.add("has-custom-cursor");
  const e = L.quickSetter(t, "x", "px"), r = L.quickSetter(t, "y", "px"), n = L.quickTo(i, "x", { duration: 0.5, ease: "expo.out" }), o = L.quickTo(i, "y", { duration: 0.5, ease: "expo.out" });
  window.addEventListener("pointermove", (u) => {
    e(u.clientX), r(u.clientY), n(u.clientX), o(u.clientY);
  }, { passive: true }), document.querySelectorAll("a, button, [data-magnetic], [data-magnetic-soft], .house-card, .review-card, .finale-cta").forEach((u) => {
    u.addEventListener("pointerenter", () => i.classList.add("is-active")), u.addEventListener("pointerleave", () => i.classList.remove("is-active"));
  }), document.querySelectorAll("[data-magnetic], [data-magnetic-soft]").forEach((u) => {
    const c = u.hasAttribute("data-magnetic") ? 0.4 : 0.18, d = L.quickTo(u, "x", { duration: 0.6, ease: "expo.out" }), h = L.quickTo(u, "y", { duration: 0.6, ease: "expo.out" });
    u.addEventListener("pointermove", (f) => {
      const _ = u.getBoundingClientRect(), p = f.clientX - (_.left + _.width / 2), m = f.clientY - (_.top + _.height / 2);
      d(p * c), h(m * c);
    }), u.addEventListener("pointerleave", () => {
      d(0), h(0);
    });
  });
}
function zc(s) {
  const i = (s.textContent ?? "").trim().split(/\s+/);
  s.textContent = "";
  const e = [];
  return i.forEach((r, n) => {
    const o = document.createElement("span");
    o.className = "split-word";
    const a = document.createElement("span");
    a.textContent = r, o.appendChild(a), s.appendChild(o), e.push(a), n < i.length - 1 && s.appendChild(document.createTextNode(" "));
  }), e;
}
function Nc(s) {
  const t = (s.textContent ?? "").trim();
  s.textContent = "";
  const i = [];
  for (const e of t) {
    const r = document.createElement("span");
    r.textContent = e === " " ? "\xA0" : e, s.appendChild(r), i.push(r);
  }
  return i;
}
function Fc() {
  const s = document.querySelector("[data-split-letters]");
  return s ? Nc(s) : [];
}
const ar = "expo.out";
function Cl(s) {
  const t = L.utils.toArray("[data-reveal]");
  if (s) {
    t.forEach((e) => L.set(e, { opacity: 1, y: 0 })), L.utils.toArray("[data-hairline]").forEach((e) => L.set(e, { scaleX: 1 }));
    return;
  }
  t.forEach((e) => {
    const r = e.dataset.reveal;
    if (r === "words") {
      const n = zc(e);
      L.set(n, { yPercent: 115 }), I.create({ trigger: e, start: "top 85%", once: true, onEnter: () => L.to(n, { yPercent: 0, duration: 1.1, ease: ar, stagger: 0.08 }) });
    } else if (r === "lines") {
      const n = e.querySelectorAll(".reveal-line > span");
      L.set(n, { yPercent: 115 }), I.create({ trigger: e, start: "top 85%", once: true, onEnter: () => L.to(n, { yPercent: 0, duration: 1, ease: ar, stagger: 0.1 }) });
    } else r === "brand" ? (L.set(e, { yPercent: 30, opacity: 0 }), I.create({ trigger: e, start: "top 92%", once: true, onEnter: () => L.to(e, { yPercent: 0, opacity: 1, duration: 1.4, ease: ar }) })) : r !== "rise" && (L.set(e, { opacity: 0, y: 28 }), I.create({ trigger: e, start: "top 88%", once: true, onEnter: () => L.to(e, { opacity: 1, y: 0, duration: 1, ease: ar }) }));
  });
  const i = L.utils.toArray('[data-reveal="rise"]');
  L.set(i, { opacity: 0, y: 46 }), I.batch(i, { start: "top 86%", onEnter: (e) => L.to(e, { opacity: 1, y: 0, duration: 1.1, ease: ar, stagger: 0.12, overwrite: true }) }), L.utils.toArray("[data-hairline]").forEach((e) => {
    L.set(e, { scaleX: 0, transformOrigin: "left center" }), I.create({ trigger: e, start: "top 92%", once: true, onEnter: () => L.to(e, { scaleX: 1, duration: 1.3, ease: ar }) });
  }), L.utils.toArray(".glow").forEach((e) => {
    L.to(e, { yPercent: -18, ease: "none", scrollTrigger: { trigger: e.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });
}
function El(s) {
  L.utils.toArray("[data-count]").forEach((i) => {
    const e = Number(i.dataset.count ?? "0"), r = i.dataset.suffix ?? "", n = i.dataset.prefix ?? "", o = (l) => {
      i.textContent = `${n}${Math.round(l)}${r}`;
    };
    if (s) {
      o(e);
      return;
    }
    const a = { v: 0 };
    o(0), I.create({ trigger: i, start: "top 90%", once: true, onEnter: () => L.to(a, { v: e, duration: 2.4, ease: "power3.out", onUpdate: () => o(a.v) }) });
  });
}
const me = (s) => document.querySelector(s), Bc = [{ sel: "#chapter-residences", in: 0.25, out: 0.35 }, { sel: "#chapter-horology", in: 0.38, out: 0.51 }, { sel: "#chapter-yachts", in: 0.55, out: 0.63 }, { sel: "#chapter-aviation", in: 0.8, out: 0.93 }], Yc = 0.95, ds = [{ until: 0.13, label: "I \xB7 Tw\xF3j cel" }, { until: 0.37, label: "II \xB7 Fundamenty" }, { until: 0.52, label: "III \xB7 Tw\xF3j czas" }, { until: 0.74, label: "IV \xB7 Kierunek" }, { until: 1 / 0, label: "V \xB7 Przysz\u0142o\u015B\u0107" }], Xc = (s) => (ds.find((t) => s < t.until) ?? ds[ds.length - 1]).label;
function Wc(s, t) {
  const i = me(t.sel);
  if (!i) return;
  const e = i.querySelector(".chapter-index"), r = i.querySelector(".chapter-word"), n = i.querySelector(".chapter-rule"), o = i.querySelector(".chapter-caption");
  L.set(i, { opacity: 0 }), L.set(e, { opacity: 0, x: -12 }), L.set(r, { yPercent: 110 }), L.set(n, { scaleX: 0, transformOrigin: "left center" }), L.set(o, { opacity: 0, y: 14 }), s.to(i, { opacity: 1, duration: 0.015 }, t.in).to(e, { opacity: 1, x: 0, duration: 0.03, ease: "power2.out" }, t.in + 4e-3).to(r, { yPercent: 0, duration: 0.05, ease: "power3.out" }, t.in + 0.01).to(n, { scaleX: 1, duration: 0.06, ease: "power3.out" }, t.in + 0.02).to(o, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, t.in + 0.03).to(i, { opacity: 0, duration: 0.03, ease: "power2.in" }, t.out - 0.018);
}
function Hc(s, t) {
  const { pinPxPerFrame: i, eyebrowLetters: e } = t, r = s.frameCount - 1, n = me("#hero");
  if (!n) return;
  const o = me("#zone-eyebrow"), a = me("#zone-name"), l = me("#zone-closing"), u = me("#brand-reveal"), c = me(".brand-sub"), d = me("#hero-rail"), h = me("#rail-fill"), f = me("#rail-node"), _ = me("#rail-label"), p = me("#scroll-hint"), m = me(".mobile-scroll-cue");
  L.set(e, { yPercent: 120, opacity: 0 }), L.set(c, { opacity: 0, y: 16 }), L.set(l, { opacity: 0, y: 30 }), d && L.to(d, { opacity: 1, duration: 0.8, delay: 0.2 });
  const x = { f: 0 };
  let y = false;
  const T = L.timeline({ scrollTrigger: { trigger: n, start: "top top", end: `+=${s.frameCount * i}`, pin: true, scrub: 1.15, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (v) => {
    const S = v.progress;
    h && (h.style.height = `${S * 100}%`), f && (f.style.top = `${S * 100}%`), _ && (_.textContent = Xc(S)), !y && S > 0.01 && (y = true, p && L.to(p, { opacity: 0, duration: 0.5 }), m && L.to(m, { opacity: 0, duration: 0.5 }));
  }, onLeave: () => {
    d && L.to(d, { opacity: 0, duration: 0.5 });
  }, onEnterBack: () => {
    d && L.to(d, { opacity: 1, duration: 0.5 });
  } } });
  T.to(x, { f: r, ease: "none", duration: 1, onUpdate: () => s.drawAt(x.f) }, 0), T.to(o, { opacity: 1, duration: 0.02 }, 0.012).to(e, { yPercent: 0, opacity: 1, stagger: 25e-4, duration: 0.035, ease: "power2.out" }, 0.02).to(e, { yPercent: -120, opacity: 0, stagger: 2e-3, duration: 0.025, ease: "power2.in" }, 0.085).to(o, { opacity: 0, duration: 0.02 }, 0.105), T.to(a, { opacity: 1, duration: 0.02 }, 0.115).fromTo(u, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.07, ease: "power3.inOut" }, 0.12).to(c, { opacity: 1, y: 0, duration: 0.035, ease: "power2.out" }, 0.175).to(a, { opacity: 0, duration: 0.035 }, 0.235), Bc.forEach((v) => Wc(T, v)), T.to(l, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, Yc);
}
const En = [{ "name": "Najpierw zrozum", "quote": "Pracuj z lekcj\u0105, zanim przejdziesz do zada\u0144. Wracaj do poj\u0119\u0107, kt\xF3re nie s\u0105 jeszcze jasne.", "role": "Lekcje" }, { "name": "\u0106wicz aktywnie", "quote": "Quiz to okazja do sprawdzenia wiedzy, a nie tylko odhaczenia kolejnego tematu.", "role": "Quizy" }, { "name": "Odpowiadaj samodzielnie", "quote": "Pytania otwarte pozwalaj\u0105 prze\u0107wiczy\u0107 w\u0142asne rozumowanie i spos\xF3b formu\u0142owania odpowiedzi.", "role": "Zadania" }, { "name": "Sprawdzaj przygotowanie", "quote": "Korzystaj z egzamin\xF3w udost\u0119pnionych w kursie i analizuj otrzymane wyniki.", "role": "Egzaminy" }, { "name": "Wracaj do trudno\u015Bci", "quote": "Zauwa\u017Cony b\u0142\u0105d to konkretna wskaz\xF3wka: wiesz, czemu po\u015Bwi\u0119ci\u0107 nast\u0119pn\u0105 powt\xF3rk\u0119.", "role": "Powt\xF3rki" }, { "name": "Obserwuj post\u0119py", "quote": "Sprawdzaj w panelu, kt\xF3re cz\u0119\u015Bci kursu masz ju\u017C za sob\u0105 i co zosta\u0142o do zrobienia.", "role": "Tw\xF3j panel" }, { "name": "Korzystaj ze wskaz\xF3wek", "quote": "W zadaniach, kt\xF3re udost\u0119pniaj\u0105 pomoc AI, traktuj podpowied\u017A jako wsparcie, nie zast\u0119pstwo my\u015Blenia.", "role": "\u015Awiadoma nauka" }, { "name": "Dbaj o regularno\u015B\u0107", "quote": "Nawet kr\xF3tka sesja z jasno okre\u015Blonym zadaniem mo\u017Ce sta\u0107 si\u0119 dobrym nawykiem.", "role": "Tw\xF3j rytm" }, { "name": "Wybieraj \u015Bwiadomie", "quote": "Por\xF3wnaj aktualne pakiety i warunki dost\u0119pu bezpo\u015Brednio na platformie NextMed.", "role": "Dobry pocz\u0105tek" }, { "name": "Szanuj sw\xF3j czas", "quote": "Czas to pieni\u0105dz. Zainwestuj w dobry kurs ju\u017C dzi\u015B i daj sobie przestrze\u0144 na spokojn\u0105 prac\u0119.", "role": "Twoja przysz\u0142o\u015B\u0107" }];
function qc(s) {
  return s.split(" ").slice(0, 2).map((t) => t[0]).join("").toUpperCase();
}
function Vc(s) {
  return `
  <article class="review-card">
    <p class="review-quote">${s.quote}</p>
    <div class="review-meta">
      <div class="review-avatar" aria-hidden="true">${qc(s.name)}</div>
      <div>
        <div class="review-name">${s.name}</div>
        <div class="review-role">${s.role}</div>
      </div>
    </div>
  </article>`;
}
function Pn(s, t, i) {
  const e = t.map(Vc).join("");
  s.innerHTML = i ? e + e : e;
}
function jo(s, t, i, e) {
  const r = i < 0 ? L.to(s, { xPercent: -50, duration: e, ease: "none", repeat: -1 }) : L.fromTo(s, { xPercent: -50 }, { xPercent: 0, duration: e, ease: "none", repeat: -1 });
  return t.addEventListener("pointerenter", () => L.to(r, { timeScale: 0.18, duration: 0.6 })), t.addEventListener("pointerleave", () => L.to(r, { timeScale: 1, duration: 0.6 })), r;
}
function Jo(s) {
  s && (s.setAttribute("tabindex", "0"), s.setAttribute("role", "group"), s.setAttribute("aria-label", "Sposoby na \u015Bwiadom\u0105 nauk\u0119 \u2014 przewi\u0144, aby przeczyta\u0107 wi\u0119cej"));
}
function kl(s) {
  const t = document.getElementById("marquee-a"), i = document.getElementById("marquee-b");
  if (!t || !i) return [];
  const e = t.closest(".marquee-row"), r = i.closest(".marquee-row");
  if (s) return Pn(t, En.slice(0, 5), false), Pn(i, En.slice(5, 10), false), Jo(e), Jo(r), [];
  if (Pn(t, En.slice(0, 5), true), Pn(i, En.slice(5, 10), true), !e || !r) return [];
  const n = jo(t, e, -1, 72), o = jo(i, r, 1, 82);
  return [n, o];
}
function Uc(s) {
  const t = (s.textContent ?? "").trim();
  s.textContent = "";
  const i = [];
  for (const e of t) {
    const r = document.createElement("span");
    r.className = "fw-letter", r.textContent = e === " " ? "\xA0" : e, s.appendChild(r), i.push(r);
  }
  return i;
}
function Ol({ reduced: s, marqueeLoops: t }) {
  const i = document.getElementById("finale");
  if (!i) return;
  const e = i.querySelector(".finale-eyebrow"), r = i.querySelector(".finale-wordmark"), n = r ? Uc(r) : [], o = i.querySelectorAll(".finale-tagline .reveal-line > span"), a = i.querySelector(".finale-cta");
  if (s) {
    L.set([e, a], { opacity: 1, y: 0 }), L.set(n, { opacity: 1 }), L.set(r, { letterSpacing: "0.2em" }), L.set(o, { yPercent: 0 });
    return;
  }
  L.set(e, { opacity: 0, y: 16 }), L.set(n, { opacity: 0, filter: "blur(8px)" }), L.set(r, { letterSpacing: "0.02em" }), L.set(o, { yPercent: 125 }), L.set(a, { opacity: 0, y: 22 }), I.create({ trigger: i, start: "top 85%", onEnter: () => t.forEach((u) => L.to(u, { timeScale: 0.03, duration: 2.6, ease: "power2.out" })), onLeaveBack: () => t.forEach((u) => L.to(u, { timeScale: 1, duration: 1.6, ease: "power2.out" })) }), L.timeline({ scrollTrigger: { trigger: i, start: "top 58%", once: true }, defaults: { ease: "expo.out" } }).to(e, { opacity: 1, y: 0, duration: 1.8 }, 0).to(n, { opacity: 1, filter: "blur(0px)", duration: 2, stagger: 0.055 }, 0.35).to(r, { letterSpacing: "0.2em", duration: 3, ease: "power2.out" }, 0.35).to(o, { yPercent: 0, duration: 1.6, stagger: 0.16 }, 1.5).to(a, { opacity: 1, y: 0, duration: 1.6 }, 2.2);
}
L.registerPlugin(I);
const $c = 6, Gc = 90, Kc = { frameCount: vc, basePath: "frames", stream: true, windowAhead: 110, windowBehind: 24, windowEvict: 140 }, Qc = { ...Kc, dprCap: 1.5 }, ps = document.getElementById("loader"), ta = document.getElementById("loader-fill"), ea = document.getElementById("loader-pct");
function Ml(s) {
  ta && (ta.style.right = `${100 - s * 100}%`), ea && (ea.textContent = `${Math.round(s * 100)}%`);
}
function Rl() {
  return new Promise((s) => {
    if (!ps) return s();
    L.to(ps, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => {
      ps.style.display = "none", s();
    } });
  });
}
async function Al() {
  try {
    await Promise.race([document.fonts?.ready, new Promise((resolve) => setTimeout(resolve, 1500))]);
  } catch {
  }
  I.refresh();
}
function Dl(s) {
  let t;
  window.addEventListener("resize", () => {
    s.resize(), t && clearTimeout(t), t = window.setTimeout(() => I.refresh(), 200);
  });
}
async function Zc(s) {
  document.documentElement.classList.add("is-static");
  const t = Pl(s.frameCount, s), i = s.frameCount - 1;
  Dl(t), await t.preloadOne(i), t.resize(), t.draw(i), L.set("#zone-name", { opacity: 1 }), L.set("#brand-reveal", { clipPath: "inset(0 0% 0 0)" }), L.set(".brand-sub", { opacity: 1, y: 0 });
  const e = kl(true);
  Cl(true), El(true), Ol({ reduced: true, marqueeLoops: e }), await Al(), await Rl(), I.refresh();
}
async function jc(s, t) {
  const i = Pl(s.frameCount, s), e = t.smooth ? Dc() : null;
  window.__lenis = e, document.documentElement.classList.add("is-loading"), e?.stop(), window.scrollTo(0, 0), Dl(i), await i.preloadAll((o, a) => Ml(o / a), Gc), i.resize(), i.draw(0);
  const r = kl(false);
  t.cursor && Lc();
  const n = Fc();
  Hc(i, { pinPxPerFrame: $c, eyebrowLetters: n }), Cl(false), El(false), Ol({ reduced: false, marqueeLoops: r }), await Al(), await Rl(), document.documentElement.classList.remove("is-loading"), e?.start(), I.refresh();
}
async function Jc() {
  I.config({ ignoreMobileResize: true });
  const s = !xc(), t = s ? Qc : Kc;
  wc() ? (Ml(1), await Zc(t)) : await jc(t, { cursor: !s && bc(), smooth: !s }), window.addEventListener("load", () => I.refresh());
}
Jc().catch((error) => {
  console.warn("Nie uda\u0142o si\u0119 uruchomi\u0107 animacji NextMed.", error);
  window.__lenis?.destroy();
  document.documentElement.classList.remove("is-loading");
  document.documentElement.classList.add("is-static", "animation-failed");
  if (ps) ps.style.display = "none";
});

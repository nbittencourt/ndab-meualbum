// app.jsx — mounts the design canvas with the three Meu Album variations
// and wires the Tweaks panel for paleta / tipografia / densidade.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#E5142A", "#0A9145", "#0B2A66"],
  "fontPair": "archivo-geist",
  "density": "regular"
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  "archivo-geist": {
    label: "Archivo Black + Geist",
    display: '"Archivo Black", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body:    '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  "bebas-dm": {
    label: "Bebas Neue + DM Sans",
    display: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body:    '"DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  "oswald-plex": {
    label: "Oswald + IBM Plex",
    display: '"Oswald", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body:    '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
};

const PALETTES = [
  // [red, green, blue/dark]
  ["#E5142A", "#0A9145", "#0B2A66"], // default tricolor anfitriões
  ["#D81F2A", "#1F7A4D", "#1B1B1B"], // muted classic
  ["#F03A47", "#129A57", "#0E5FA8"], // brighter sport
  ["#A8101F", "#0B6B36", "#04122F"], // deep premium
];

const DENSITY_SCALE = { compact: 0.86, regular: 1, comfy: 1.14 };

function applyTokens(t) {
  const r = document.documentElement.style;
  r.setProperty("--c-red", t.palette[0]);
  r.setProperty("--c-green", t.palette[1]);
  r.setProperty("--c-blue", t.palette[2]);
  // Recompute --c-dark to harmonize with chosen blue
  r.setProperty("--c-dark", shade(t.palette[2], -0.6));
  const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS["archivo-geist"];
  r.setProperty("--font-display", pair.display);
  r.setProperty("--font-body", pair.body);
  r.setProperty("--d", String(DENSITY_SCALE[t.density] || 1));
}

// quick shade helper (negative darkens, positive lightens) with hex
function shade(hex, amt) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  const f = (v) => {
    const out = amt < 0 ? v * (1 + amt) : v + (255 - v) * amt;
    return Math.max(0, Math.min(255, Math.round(out)));
  };
  return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTokens(t); }, [t.palette, t.fontPair, t.density]);

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection
          id="meu-album"
          title="Meu Album · Landing + Login"
          subtitle="Direção visual padrão — paleta tricolor anfitriã, tipografia esportiva, identidade original."
        >
          <DCArtboard id="pack" label="Meu Album · padrão" width={1440} height={2700}>
            <VariationPack />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Paleta tricolor" />
        <TweakColor
          label="Cores anfitriãs"
          value={t.palette}
          options={PALETTES}
          onChange={(v) => setTweak("palette", v)}
        />

        <TweakSection label="Tipografia" />
        <TweakSelect
          label="Par tipográfico"
          value={t.fontPair}
          options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak("fontPair", v)}
        />

        <TweakSection label="Densidade" />
        <TweakRadio
          label="Espaçamento"
          value={t.density}
          options={[
            { value: "compact", label: "Compacto" },
            { value: "regular", label: "Regular" },
            { value: "comfy",   label: "Espaçoso" },
          ]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

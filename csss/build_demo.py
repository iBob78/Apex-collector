import base64

with open("/home/user/effets_tourbillon/assets/spectral-fx2.jpg", "rb") as f:
    b64_spectral2 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")

with open("/home/user/effets_tourbillon/assets/spectral-fx1.jpg", "rb") as f:
    b64_spectral1 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")

with open("/home/user/effets_tourbillon/assets/blackhole1.jpg", "rb") as f:
    b64_blackhole = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")

html_template = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Effet Tourbillon Multicolore - Extraction & Démo</title>
    <style>
        :root {
            --bg-dark: #0c0814;
            --bg-card: #181126;
            --bg-panel: #201736;
            --border-panel: rgba(162, 0, 255, 0.25);
            --neon-purple: #a200ff;
            --neon-pink: #ff0b6f;
            --neon-cyan: #00f6ff;
            --text-main: #f0eef6;
            --text-muted: #a69bb8;
            --code-bg: #110c1c;
            --speed: 10s;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: var(--bg-dark);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            padding: 2.5rem 1rem;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 2.5rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-panel);
        }

        .badge {
            display: inline-block;
            background: linear-gradient(135deg, rgba(162, 0, 255, 0.25), rgba(255, 11, 111, 0.25));
            border: 1px solid rgba(162, 0, 255, 0.6);
            color: #dcb8ff;
            padding: 0.35rem 1.2rem;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 1rem;
            box-shadow: 0 0 15px rgba(162, 0, 255, 0.2);
        }

        h1 {
            font-size: 2.4rem;
            background: linear-gradient(135deg, #ffffff 0%, #dcb8ff 50%, #00f6ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.8rem;
        }

        .intro {
            max-width: 850px;
            margin: 0 auto;
            color: var(--text-muted);
            font-size: 1.05rem;
        }

        /* Contrôles interactifs */
        .controls-panel {
            background: var(--bg-panel);
            border-radius: 14px;
            padding: 1rem 1.5rem;
            margin-bottom: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1.5rem;
            border: 1px solid var(--border-panel);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .control-group label {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-muted);
        }

        input[type="range"] {
            accent-color: var(--neon-purple);
            cursor: pointer;
            width: 130px;
        }

        /* Grid des Démos */
        .demos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 2rem;
            margin-bottom: 3.5rem;
        }

        .demo-card {
            background: var(--bg-card);
            border: 1px solid var(--border-panel);
            border-radius: 18px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .demo-card:hover {
            transform: translateY(-5px);
            border-color: rgba(162, 0, 255, 0.7);
        }

        .demo-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 0.3rem;
            color: #fff;
            text-align: center;
        }

        .demo-sub {
            font-size: 0.82rem;
            color: var(--text-muted);
            margin-bottom: 1.25rem;
            text-align: center;
            min-height: 2.2rem;
        }

        /* Le conteneur de la carte */
        .card-frame {
            position: relative;
            width: 220px;
            height: 310px;
            border-radius: 16px;
            overflow: hidden;
            background: #140826;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(162, 0, 255, 0.25);
            border: 2px solid rgba(255, 255, 255, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* ----------------------------------------------------
           1. EFFET SPECTRAL ORIGINAL DU SITE
        ---------------------------------------------------- */
        .spectral-container {
            position: absolute;
            inset: 0;
            overflow: hidden;
            border-radius: 14px;
        }

        .spectral-inner {
            position: absolute;
            width: 400%;
            aspect-ratio: 1 / 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .spectral-inner::after {
            content: '';
            position: absolute;
            inset: 0;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100%;
            background-image: url('__SPECTRAL2__');
            animation: spectral-anim var(--speed) linear infinite;
        }

        @keyframes spectral-anim {
            0%   { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8); }
            25%  {{ transform: translate3d(0, 0, 0) rotate(90deg) scale(2); }}
            50%  { transform: translate3d(0, 0, 0) rotate(180deg) scale(0.8); }
            75%  { transform: translate3d(0, 0, 0) rotate(270deg) scale(2); }
            100% { transform: translate3d(0, 0, 0) rotate(360deg) scale(0.8); }
        }

        /* ----------------------------------------------------
           2. EFFET DOUBLE VORTEX CONTRE-ROTATIF (SCREEN BLEND)
        ---------------------------------------------------- */
        .dual-spectral-inner {
            position: absolute;
            width: 400%;
            aspect-ratio: 1 / 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .dual-spectral-inner::before,
        .dual-spectral-inner::after {
            content: '';
            position: absolute;
            inset: 0;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100%;
            background-image: url('__SPECTRAL2__');
        }

        .dual-spectral-inner::before {
            animation: spectral-anim var(--speed) linear infinite;
            opacity: 0.85;
        }

        .dual-spectral-inner::after {
            animation: spectral-reverse-anim 14s linear infinite;
            mix-blend-mode: screen;
            opacity: 0.75;
        }

        @keyframes spectral-reverse-anim {
            0%   { transform: translate3d(0, 0, 0) rotate(360deg) scale(1.6); }
            50%  { transform: translate3d(0, 0, 0) rotate(180deg) scale(0.9); }
            100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1.6); }
        }

        /* ----------------------------------------------------
           3. EFFET PURE CSS (AUCUNE IMAGE REQUISE)
        ---------------------------------------------------- */
        .pure-css-vortex {
            position: absolute;
            width: 320%;
            aspect-ratio: 1 / 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: conic-gradient(
                from 0deg,
                #ff0080,
                #7928ca,
                #0070f3,
                #00dfd8,
                #43e97b,
                #fa709a,
                #fee140,
                #ff0080
            );
            filter: blur(28px) saturate(190%);
            animation: pure-spin var(--speed) linear infinite, hue-cycle 12s ease-in-out infinite;
        }

        .pure-css-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 35%, rgba(12, 8, 20, 0.75) 75%, #0c0814 100%);
            mix-blend-mode: multiply;
        }

        @keyframes pure-spin {
            0%   { transform: translate(-50%, -50%) rotate(0deg) scale(0.9); }
            50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1.3); }
            100% { transform: translate(-50%, -50%) rotate(360deg) scale(0.9); }
        }

        @keyframes hue-cycle {
            0%, 100% { filter: blur(28px) saturate(190%) hue-rotate(0deg); }
            50%      { filter: blur(22px) saturate(230%) hue-rotate(90deg); }
        }

        /* ----------------------------------------------------
           4. EFFET TROU NOIR / BLACKHOLE VORTEX
        ---------------------------------------------------- */
        .blackhole-vortex {
            position: absolute;
            width: 290px;
            aspect-ratio: 1 / 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            background-image: url('__BLACKHOLE__');
            mix-blend-mode: lighten;
            opacity: 0.95;
            transform-origin: center center;
            animation: blackhole-spin 10s linear infinite;
            -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%);
            mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%);
        }

        @keyframes blackhole-spin {
            0%   { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        /* Contenu au premier plan de la carte */
        .card-content {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.25rem 1rem;
            text-align: center;
            pointer-events: none;
            background: rgba(14, 9, 26, 0.5);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            width: 82%;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
        }

        .card-content h3 {
            font-size: 1.15rem;
            margin-bottom: 0.25rem;
            color: #fff;
            text-shadow: 0 0 10px rgba(162, 0, 255, 0.9);
            letter-spacing: 1px;
        }

        .card-content span {
            font-size: 0.72rem;
            color: #dcb8ff;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
        }

        /* Section Explications & Code */
        .code-section {
            background: var(--bg-card);
            border: 1px solid var(--border-panel);
            border-radius: 18px;
            padding: 2.2rem;
            margin-bottom: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .code-section h2 {
            font-size: 1.55rem;
            color: #fff;
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .code-section h2 span {
            color: var(--neon-cyan);
            font-size: 1.15rem;
            font-family: monospace;
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-panel);
            padding-bottom: 0.75rem;
            flex-wrap: wrap;
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.6rem 1.1rem;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .tab-btn:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
            color: #fff;
            background: var(--neon-purple);
            box-shadow: 0 0 15px rgba(162, 0, 255, 0.4);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .code-wrapper {
            position: relative;
            background: var(--code-bg);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            margin-top: 1.2rem;
        }

        pre {
            padding: 1.4rem;
            overflow-x: auto;
            color: #d1d5db;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.88rem;
            line-height: 1.55;
        }

        .copy-btn {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.4rem 0.85rem;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .copy-btn:hover {
            background: var(--neon-purple);
            border-color: var(--neon-purple);
        }

        .expl-box {
            background: rgba(162, 0, 255, 0.08);
            border-left: 4px solid var(--neon-purple);
            padding: 1.1rem 1.4rem;
            border-radius: 0 10px 10px 0;
            margin-top: 1rem;
            color: #ded5ee;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .expl-box strong {
            color: #fff;
        }

        .asset-box {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: var(--code-bg);
            border: 1px solid var(--border-panel);
            border-radius: 14px;
            padding: 1.2rem;
            margin-top: 1rem;
        }

        .asset-preview {
            width: 85px;
            height: 85px;
            border-radius: 10px;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .asset-info {
            flex: 1;
        }

        .asset-title {
            font-weight: 700;
            color: #fff;
            font-size: 1.05rem;
            margin-bottom: 0.25rem;
        }

        .asset-desc {
            font-size: 0.88rem;
            color: var(--text-muted);
            margin-bottom: 0.4rem;
        }

        .asset-link {
            display: inline-block;
            font-size: 0.82rem;
            color: var(--neon-cyan);
            text-decoration: none;
            word-break: break-all;
            font-family: monospace;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="badge">Analyse & Extraction CSS</div>
        <h1>Effet de Tourbillon Multicolore</h1>
        <p class="intro">
            Cet effet provient directement de la feuille de style <code>child-roulette/style.css</code> (liée dans votre page HTML).
            Dans le code source original, il porte le nom de <strong>« Spectral »</strong> (classe <code>.wrapper-card.spectral</code>).
            Découvrez ci-dessous comment il fonctionne, l'image source utilisée, son animation et les différentes manières de le réutiliser dans vos projets.
        </p>
    </header>

    <!-- Contrôleur de vitesse en direct -->
    <div class="controls-panel">
        <div class="control-group">
            <label for="speedRange">⚡ Vitesse de rotation :</label>
            <input type="range" id="speedRange" min="2" max="25" value="10" step="1">
            <span id="speedVal" style="color: var(--neon-cyan); font-weight: bold;">10s</span>
        </div>
        <div class="control-group">
            <label>🌀 Pulsation (Scale 0.8 à 2.0) :</label>
            <button id="scaleToggle" class="tab-btn active" style="padding: 0.35rem 0.85rem;">Activée (Original)</button>
        </div>
    </div>

    <!-- Galerie des Démos -->
    <div class="demos-grid">
        <!-- Démo 1 : L'original spectral -->
        <div class="demo-card">
            <div class="demo-title">1. Original "Spectral"</div>
            <div class="demo-sub">L'effet exact du site : <code>spectral-fx2.jpg</code> + <code>@keyframes spectral</code></div>
            
            <div class="card-frame">
                <div class="spectral-container">
                    <div class="spectral-inner" id="spectralInner"></div>
                </div>
                <div class="card-content">
                    <h3>SPECTRAL</h3>
                    <span>Effet Original</span>
                </div>
            </div>
        </div>

        <!-- Démo 2 : Double vortex contre-rotatif -->
        <div class="demo-card">
            <div class="demo-title">2. Double Tourbillon</div>
            <div class="demo-sub">Deux couches superposées tournant en sens inverse (<code>screen blend</code>)</div>
            
            <div class="card-frame">
                <div class="spectral-container">
                    <div class="dual-spectral-inner"></div>
                </div>
                <div class="card-content">
                    <h3>HYPNOTIQUE</h3>
                    <span>Double Swirl</span>
                </div>
            </div>
        </div>

        <!-- Démo 3 : 100% CSS Pur -->
        <div class="demo-card">
            <div class="demo-title">3. Version 100% CSS Pur</div>
            <div class="demo-sub">Sans image externe : <code>conic-gradient</code> + <code>blur</code> + <code>hue-rotate</code></div>
            
            <div class="card-frame">
                <div class="pure-css-vortex"></div>
                <div class="pure-css-overlay"></div>
                <div class="card-content">
                    <h3>PUR CSS</h3>
                    <span>Zéro Image</span>
                </div>
            </div>
        </div>

        <!-- Démo 4 : Trou Noir / Black Hole -->
        <div class="demo-card">
            <div class="demo-title">4. Vortex "Blackhole"</div>
            <div class="demo-sub">Autre effet vortex du site (<code>blackhole1@2x.jpg</code> + masque radial)</div>
            
            <div class="card-frame">
                <div class="blackhole-vortex"></div>
                <div class="card-content">
                    <h3>VORTEX</h3>
                    <span>Trou Noir</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Section Ressources & Assets Originaux -->
    <div class="code-section">
        <h2><span>01.</span> L'Image Source du Tourbillon Multicolore</h2>
        <p style="color: var(--text-muted); margin-bottom: 1rem;">
            Contrairement à une illusion d'optique purement vectorielle, le site utilise une <strong>image texture 800×800px</strong> représentant un fluide liquide aux reflets irisés néon (rose bonbon, cyan, magenta, violet). Elle est redimensionnée à <strong>400%</strong> dans le CSS pour que son centre fluide s'enroule de façon organique lors des rotations :
        </p>

        <div class="asset-box">
            <img class="asset-preview" src="__SPECTRAL2__" alt="spectral-fx2">
            <div class="asset-info">
                <div class="asset-title">spectral-fx2.jpg (800 × 800 px) — Image Principale</div>
                <div class="asset-desc">Texture originale du tourbillon utilisée dans <code>.wrapper-card.spectral .inner-anim:after</code>.</div>
                <span class="asset-link">https://playboobylegends.b-cdn.net/wp-content/themes/child-roulette/img/spectral-fx2.jpg</span>
            </div>
        </div>

        <div class="asset-box">
            <img class="asset-preview" src="__SPECTRAL1__" alt="spectral-fx1">
            <div class="asset-info">
                <div class="asset-title">spectral-fx1.jpg (800 × 800 px) — Variante Sphère</div>
                <div class="asset-desc">Variante sphérique kaléidoscopique présente dans les commentaires du code (mode reverse).</div>
                <span class="asset-link">https://playboobylegends.b-cdn.net/wp-content/themes/child-roulette/img/spectral-fx1.jpg</span>
            </div>
        </div>
    </div>

    <!-- Section Code Prêt à l'emploi -->
    <div class="code-section">
        <h2><span>02.</span> Codes Prêts à l'Emploi (HTML & CSS)</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.2rem;">
            Choisissez la solution qui convient à votre projet :
        </p>

        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('tab-orig', this)">Option A : Code Original (Image + CSS)</button>
            <button class="tab-btn" onclick="showTab('tab-pure', this)">Option B : 100% CSS Pur (Sans Image)</button>
            <button class="tab-btn" onclick="showTab('tab-dual', this)">Option C : Double Tourbillon Contre-Rotatif</button>
        </div>

        <!-- Onglet 1 : Original -->
        <div id="tab-orig" class="tab-content active">
            <div class="expl-box">
                <strong>💡 Comment fonctionne l'effet original ?</strong><br>
                1. <strong>Le masque de découpe :</strong> Le conteneur parent possède <code>overflow: hidden</code> et un <code>border-radius</code>.<br>
                2. <strong>L'agrandissement x4 :</strong> La couche interne mesure <code>width: 400%</code> et <code>aspect-ratio: 1</code>, centrée au milieu via <code>transform: translate(-50%, -50%)</code>. Ce zoom très fort permet d'éviter que les bords de l'image n'apparaissent lors de la rotation.<br>
                3. <strong>L'animation combinée :</strong> L'animation <code>spectral</code> ne fait pas qu'une simple rotation : elle effectue un tour complet (0° à 360°) tout en faisant osciller l'échelle entre <strong>0.8</strong> et <strong>2.0</strong> (à 25% et 75%). Cette pulsation donne l'illusion de vagues liquides qui s'enroulent et gonflent.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-orig')">Copier le code</button>
                <pre><code id="code-orig">&lt;!-- Structure HTML --&gt;
&lt;div class="tourbillon-card"&gt;
  &lt;div class="tourbillon-anim"&gt;&lt;/div&gt;
  &lt;div class="card-content"&gt;
    &lt;h3&gt;Mon Titre&lt;/h3&gt;
    &lt;p&gt;Contenu par-dessus le tourbillon&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;style&gt;
/* 1. Cadre parent */
.tourbillon-card {
  position: relative;
  width: 250px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden; /* Découpe l'image agrandie */
  background: #140826;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
}

/* 2. Couche interne agrandie à 400% */
.tourbillon-anim {
  position: absolute;
  width: 400%;
  aspect-ratio: 1 / 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.tourbillon-anim::after {
  content: '';
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  /* Image texture du tourbillon multicolore */
  background-image: url('spectral-fx2.jpg');
  /* Animation CSS originale */
  animation: spectral 10s linear infinite;
}

/* 3. L'animation CSS originale avec rotation + scale */
@keyframes spectral {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8); }
  25%  { transform: translate3d(0, 0, 0) rotate(90deg) scale(2); }
  50%  { transform: translate3d(0, 0, 0) rotate(180deg) scale(0.8); }
  75%  { transform: translate3d(0, 0, 0) rotate(270deg) scale(2); }
  100% { transform: translate3d(0, 0, 0) rotate(360deg) scale(0.8); }
}

/* 4. Contenu par-dessus */
.card-content {
  position: relative;
  z-index: 10;
  color: #fff;
  padding: 1.5rem;
}
&lt;/style&gt;</code></pre>
            </div>
        </div>

        <!-- Onglet 2 : Pure CSS -->
        <div id="tab-pure" class="tab-content">
            <div class="expl-box">
                <strong>💡 Pourquoi la version 100% CSS Pur ?</strong><br>
                Elle ne nécessite <strong>aucun fichier image</strong> à stocker. Elle utilise un dégradé conique (<code>conic-gradient</code>) passant par les couleurs de l'arc-en-ciel néon, associé à un filtre de flou intense (<code>blur(28px)</code>) et un cycle dynamique de saturation et de teinte (<code>hue-rotate</code>).
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-pure')">Copier le code</button>
                <pre><code id="code-pure">&lt;!-- Structure HTML (Zéro image externe) --&gt;
&lt;div class="vortex-pure-card"&gt;
  &lt;div class="vortex-swirl"&gt;&lt;/div&gt;
  &lt;div class="vortex-vignette"&gt;&lt;/div&gt;
  &lt;div class="card-content"&gt;
    &lt;h3&gt;100% CSS Pur&lt;/h3&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;style&gt;
.vortex-pure-card {
  position: relative;
  width: 250px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  background: #0c0814;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vortex-swirl {
  position: absolute;
  width: 320%;
  aspect-ratio: 1 / 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  /* Dégradé conique multicolore */
  background: conic-gradient(
    from 0deg,
    #ff0080,
    #7928ca,
    #0070f3,
    #00dfd8,
    #43e97b,
    #fa709a,
    #fee140,
    #ff0080
  );
  filter: blur(28px) saturate(190%);
  animation: pure-spin 8s linear infinite, hue-shift 12s ease-in-out infinite;
}

.vortex-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 35%, rgba(12, 8, 20, 0.75) 75%, #0c0814 100%);
  mix-blend-mode: multiply;
  pointer-events: none;
}

@keyframes pure-spin {
  0%   { transform: translate(-50%, -50%) rotate(0deg) scale(0.9); }
  50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1.3); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(0.9); }
}

@keyframes hue-shift {
  0%, 100% { filter: blur(28px) saturate(190%) hue-rotate(0deg); }
  50%      { filter: blur(22px) saturate(230%) hue-rotate(90deg); }
}
&lt;/style&gt;</code></pre>
            </div>
        </div>

        <!-- Onglet 3 : Dual Vortex -->
        <div id="tab-dual" class="tab-content">
            <div class="expl-box">
                <strong>💡 La variante Double Tourbillon Contre-Rotatif :</strong><br>
                Présente en esquisse dans le code source d'origine sous le nom de <code>spectral-reverse</code>, cette technique utilise <strong>deux pseudo-éléments</strong> (<code>::before</code> et <code>::after</code>). L'un tourne dans le sens des aiguilles d'une montre et l'autre en sens inverse avec <code>mix-blend-mode: screen</code>. Le mélange lumineux crée une texture encore plus dense et chatoyante.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-dual')">Copier le code</button>
                <pre><code id="code-dual">&lt;!-- Structure HTML Double Tourbillon --&gt;
&lt;div class="dual-card"&gt;
  &lt;div class="dual-swirl"&gt;&lt;/div&gt;
  &lt;div class="card-content"&gt;
    &lt;h3&gt;Double Swirl&lt;/h3&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;style&gt;
.dual-card {
  position: relative;
  width: 250px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  background: #0f0a1c;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dual-swirl {
  position: absolute;
  width: 400%;
  aspect-ratio: 1 / 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.dual-swirl::before,
.dual-swirl::after {
  content: '';
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  background-image: url('spectral-fx2.jpg');
}

/* Couche 1 : sens horaire */
.dual-swirl::before {
  animation: spectral-cw 10s linear infinite;
  opacity: 0.85;
}

/* Couche 2 : sens anti-horaire avec mode de fusion screen */
.dual-swirl::after {
  animation: spectral-ccw 14s linear infinite;
  mix-blend-mode: screen;
  opacity: 0.75;
}

@keyframes spectral-cw {
  0%   { transform: rotate(0deg) scale(0.8); }
  25%  { transform: rotate(90deg) scale(2); }
  50%  { transform: rotate(180deg) scale(0.8); }
  75%  { transform: rotate(270deg) scale(2); }
  100% { transform: rotate(360deg) scale(0.8); }
}

@keyframes spectral-ccw {
  0%   { transform: rotate(360deg) scale(1.6); }
  50%  { transform: rotate(180deg) scale(0.9); }
  100% { transform: rotate(0deg) scale(1.6); }
}
&lt;/style&gt;</code></pre>
            </div>
        </div>
    </div>
</div>

<script>
    function showTab(tabId, btn) {
        document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
        document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        btn.classList.add("active");
    }

    function copyCode(elementId) {
        const text = document.getElementById(elementId).innerText;
        navigator.clipboard.writeText(text).then(() => {
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = "Copié !";
            btn.style.background = "#00f6ff";
            btn.style.color = "#000";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.color = "";
            }, 2000);
        }).catch(() => {
            alert("Code copié !");
        });
    }

    // Contrôle interactif de vitesse
    const speedRange = document.getElementById("speedRange");
    const speedVal = document.getElementById("speedVal");
    speedRange.addEventListener("input", (e) => {
        const val = e.target.value + "s";
        speedVal.innerText = val;
        document.documentElement.style.setProperty("--speed", val);
    });

    // Toggle scale
    let scaleEnabled = true;
    const scaleToggle = document.getElementById("scaleToggle");
    scaleToggle.addEventListener("click", () => {
        scaleEnabled = !scaleEnabled;
        scaleToggle.innerText = scaleEnabled ? "Activée (Original)" : "Désactivée (Rotation seule)";
        scaleToggle.classList.toggle("active", scaleEnabled);
        
        let style = document.getElementById("override-scale");
        if (!scaleEnabled) {
            if (!style) {
                style = document.createElement("style");
                style.id = "override-scale";
                document.head.appendChild(style);
            }
            style.innerHTML = `
                @keyframes spectral-anim {
                    0%   { transform: translate3d(0, 0, 0) rotate(0deg) scale(1.2); }
                    100% { transform: translate3d(0, 0, 0) rotate(360deg) scale(1.2); }
                }
            `;
        } else {
            if (style) style.remove();
        }
    });
</script>

</body>
</html>
"""

final_html = html_template.replace("__SPECTRAL2__", b64_spectral2)
final_html = final_html.replace("__SPECTRAL1__", b64_spectral1)
final_html = final_html.replace("__BLACKHOLE__", b64_blackhole)

with open("/home/user/tourbillon_effets.html", "w", encoding="utf-8") as f:
    f.write(final_html)

print("File created at /home/user/tourbillon_effets.html, length:", len(final_html))

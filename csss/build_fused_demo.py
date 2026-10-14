import base64

with open("/home/user/effets_tourbillon/assets/sparklez.gif", "rb") as f:
    b64_sparkles = "data:image/gif;base64," + base64.b64encode(f.read()).decode("ascii")

with open("/home/user/effets_tourbillon/assets/dania-vega.webp", "rb") as f:
    b64_dania = "data:image/webp;base64," + base64.b64encode(f.read()).decode("ascii")

html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animations Carte Fused & Spin 1080° - BoobyLegends</title>
    <style>
        :root {{
            --bg-dark: #0b0714;
            --bg-card: #160f25;
            --bg-panel: #1e1533;
            --border-panel: rgba(120, 226, 43, 0.25);
            --color-common: #78e22b;
            --color-rare: #29c4f7;
            --color-epic: #fb50ff;
            --color-legendary: #fedd30;
            --neon-active: #78e22b;
            --radius-card: 16px;
            --border-card: 3px;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            background: var(--bg-dark);
            color: #f0eef6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            padding: 2.5rem 1rem;
            min-height: 100vh;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            margin-bottom: 2.5rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .badge {{
            display: inline-block;
            background: linear-gradient(135deg, rgba(120, 226, 43, 0.2), rgba(0, 231, 255, 0.2));
            border: 1px solid var(--neon-active);
            color: #d4ffa7;
            padding: 0.35rem 1.2rem;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 1rem;
            box-shadow: 0 0 15px rgba(120, 226, 43, 0.25);
        }}

        h1 {{
            font-size: 2.3rem;
            background: linear-gradient(135deg, #ffffff 0%, #d4ffa7 50%, #00f6ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.8rem;
        }}

        .intro {{
            max-width: 850px;
            margin: 0 auto;
            color: #a69bb8;
            font-size: 1.05rem;
        }}

        /* Panneau de contrôle interactif */
        .controls-bar {{
            background: var(--bg-panel);
            border-radius: 16px;
            padding: 1.25rem 1.75rem;
            margin-bottom: 3rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }}

        .rarity-selector {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }}

        .rarity-btn {{
            border: none;
            padding: 0.45rem 0.9rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(255, 255, 255, 0.08);
            color: #ccc;
        }}

        .rarity-btn.active.btn-common {{
            background: #78e22b;
            color: #0b0714;
            box-shadow: 0 0 15px rgba(120, 226, 43, 0.5);
        }}

        .rarity-btn.active.btn-rare {{
            background: #29c4f7;
            color: #0b0714;
            box-shadow: 0 0 15px rgba(41, 196, 247, 0.5);
        }}

        .rarity-btn.active.btn-epic {{
            background: #fb50ff;
            color: #0b0714;
            box-shadow: 0 0 15px rgba(251, 80, 255, 0.5);
        }}

        .rarity-btn.active.btn-legendary {{
            background: #fedd30;
            color: #0b0714;
            box-shadow: 0 0 15px rgba(254, 221, 48, 0.5);
        }}

        .action-spin-btn {{
            background: linear-gradient(135deg, #a200ff, #ff0b6f);
            color: #fff;
            border: none;
            padding: 0.65rem 1.4rem;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(162, 0, 255, 0.5);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}

        .action-spin-btn:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 11, 111, 0.7);
        }}

        /* Section principale Démo */
        .showcase-area {{
            display: flex;
            gap: 3rem;
            align-items: center;
            justify-content: center;
            margin-bottom: 4rem;
            flex-wrap: wrap;
        }}

        .card-stage {{
            perspective: 1000px;
            width: 280px;
            height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        /* ====================================================================
           LA CARTE EXACTE DU CODE SOURCE (.wrapper-card.common.shimmy.fused.fused-active)
        ==================================================================== */
        .wrapper-card {{
            position: relative;
            width: 270px;
            height: 405px;
            border-radius: var(--radius-card);
            background: #1e0322;
            user-select: none;
            transform-style: preserve-3d;
            box-sizing: border-box;
            transition: transform 0.25s ease;
        }}

        /* Effet SHIMMY : Balancement 3D naturel */
        .wrapper-card.shimmy {{
            animation: shimmy 6s ease-in-out infinite;
        }}

        @keyframes shimmy {{
            0%, 100% {{
                transform: rotateY(1deg) skewX(1deg);
            }}
            50% {{
                transform: rotateY(18deg) skewX(2.5deg);
            }}
        }}

        /* Face avant */
        .wrapper-card .front {{
            position: absolute;
            inset: 0;
            border-radius: var(--radius-card);
            border-color: transparent;
            background-color: transparent;
            overflow: visible;
        }}

        /* FUSED : Contour & Aura Néon Électrifiée (STEAM ANIMATION) */
        .wrapper-card.fused .front:before,
        .wrapper-card.fused .front:after {{
            content: '';
            position: absolute;
            left: calc(0px - var(--border-card));
            top: calc(0px - var(--border-card));
            width: calc(100% + (var(--border-card) * 2));
            height: calc(100% + (var(--border-card) * 2));
            background-size: 400%;
            z-index: -1;
            animation: steam 20s linear infinite;
        }}

        /* Palettes selon la rareté */
        .wrapper-card.common.fused .front:before,
        .wrapper-card.common.fused .front:after {{
            background-image: linear-gradient(45deg, #D4FFA7, #77E203, #1E0322, #6EFF78, #15C421);
        }}

        .wrapper-card.rare.fused .front:before,
        .wrapper-card.rare.fused .front:after {{
            background-image: linear-gradient(45deg, #18C3FA, #2451BB, #1E0322, #A9FBFF, #242EBB);
        }}

        .wrapper-card.epic.fused .front:before,
        .wrapper-card.epic.fused .front:after {{
            background-image: linear-gradient(45deg, #FB50FF, #B600BB, #1E0322, #E1A4FF, #6100C2);
        }}

        .wrapper-card.legendary.fused .front:before,
        .wrapper-card.legendary.fused .front:after {{
            background-image: linear-gradient(45deg, #FEDD30, #F78F0C, #1E0322, #FFF941, #F7440C);
        }}

        .wrapper-card.fused .front:before {{
            border-radius: var(--radius-card);
        }}

        /* Aura luminescente floutée */
        .wrapper-card.fused .front:after {{
            filter: blur(1.2em);
            opacity: 0.9;
        }}

        /* @keyframes steam original */
        @keyframes steam {{
            0%, 100% {{
                background-position: 0 0;
            }}
            50% {{
                background-position: 400% 0;
            }}
        }}

        /* FUSED-ACTIVE : 1. Paillettes étoilées scintillantes (sparklez.gif) */
        .wrapper-card.fused.fused-active:after {{
            content: '';
            position: absolute;
            inset: 0;
            background-image: url('{b64_sparkles}');
            background-position: center;
            background-size: cover;
            mix-blend-mode: color-dodge;
            z-index: 5;
            border-radius: var(--radius-card);
            animation: holosparkle 20s ease infinite;
            pointer-events: none;
        }}

        @keyframes holosparkle {{
            0%   {{ opacity: 0.5; }}
            15%  {{ opacity: 0.85; }}
            75%  {{ opacity: 0.7; }}
            100% {{ opacity: 0.5; }}
        }}

        /* FUSED-ACTIVE : 2. Balayage holographique irisé (hologradient) */
        .wrapper-card.fused.fused-active:before {{
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                115deg,
                transparent 0%,
                rgb(0, 231, 255) 30%,
                rgb(255, 0, 231) 70%,
                transparent 100%
            );
            background-position: 0% 0%;
            background-repeat: no-repeat;
            background-size: 300% 300%;
            mix-blend-mode: color-dodge;
            opacity: 0;
            z-index: 6;
            border-radius: var(--radius-card);
            animation: hologradient 6s ease infinite;
            pointer-events: none;
        }}

        @keyframes hologradient {{
            3%   {{ opacity: 0; }}
            10%  {{ background-position: 0% 0%; }}
            30%  {{ opacity: 0.6; }}
            35%  {{ background-position: 100% 100%; }}
            40%  {{ opacity: 0; }}
            60%  {{ opacity: 0; background-position: 100% 100%; }}
            70%  {{ opacity: 0.4; }}
            90%  {{ opacity: 0; background-position: 0% 0%; }}
        }}

        /* Effet SHINE : Rayon lumineux oblique */
        .shine-wrapper {{
            position: absolute;
            inset: 0;
            overflow: hidden;
            border-radius: var(--radius-card);
            pointer-events: none;
            z-index: 7;
        }}

        .wrapper-card.shimmy .shine {{
            display: block;
            width: 35em;
            height: 4em;
            margin-left: -4em;
            transform: rotate(30deg);
            background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.25), transparent);
            position: absolute;
            animation: shine 6s ease-in-out infinite;
        }}

        @keyframes shine {{
            0%, 100% {{ margin-top: -6em; }}
            50%      {{ margin-top: 35em; }}
        }}

        /* Image de la carte */
        .img-card {{
            position: absolute;
            inset: 0;
            border-radius: var(--radius-card);
            background-image: url('{b64_dania}');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
            z-index: 1;
        }}

        /* Overlay d'ombre intérieure */
        .card-cache {{
            position: absolute;
            inset: 0;
            border-radius: var(--radius-card);
            background: linear-gradient(180deg, rgba(30, 3, 34, 0) 50%, rgba(30, 3, 34, 0.85) 100%);
            z-index: 2;
        }}

        /* Infos de la carte (nom, badge) */
        .card-infos {{
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            z-index: 10;
        }}

        .card-name {{
            font-size: 1.25rem;
            font-weight: 800;
            color: #fff;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
        }}

        .card-badge {{
            display: inline-block;
            font-size: 0.72rem;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 1.5px;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            background: var(--neon-active);
            color: #0b0714;
            margin-top: 0.25rem;
        }}

        /* ====================================================================
           ANIMATION SPIN 1080° (METAMORPHOSE 3D DU CODE SOURCE)
        ==================================================================== */
        .wrapper-card.spinincard1080deg {{
            transition-duration: 0.25s;
            animation: spinincard1080deg 2s ease-in-out !important;
        }}

        @keyframes spinincard1080deg {{
            0% {{
                transform: rotateY(0deg) skewX(2deg);
            }}
            100% {{
                transform: rotateY(1080deg) skewX(1deg);
            }}
        }}

        /* Panneau d'explication des couches */
        .layers-breakdown {{
            flex: 1;
            min-width: 320px;
            max-width: 580px;
            background: var(--bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 18px;
            padding: 1.8rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }}

        .layers-title {{
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }}

        .layer-item {{
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.1rem;
            padding-bottom: 1.1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }}

        .layer-item:last-child {{
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }}

        .layer-num {{
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.85rem;
            color: var(--neon-active);
            flex-shrink: 0;
        }}

        .layer-details h4 {{
            font-size: 0.95rem;
            color: #fff;
            margin-bottom: 0.2rem;
        }}

        .layer-details p {{
            font-size: 0.85rem;
            color: #a69bb8;
            line-height: 1.45;
        }}

        .layer-details code {{
            color: #00f6ff;
            background: rgba(0, 246, 255, 0.1);
            padding: 0.15rem 0.35rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }}

        /* Section Code */
        .code-section {{
            background: var(--bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 18px;
            padding: 2.2rem;
            margin-bottom: 2.5rem;
        }}

        .code-section h2 {{
            font-size: 1.55rem;
            color: #fff;
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}

        .tabs {{
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 0.75rem;
            flex-wrap: wrap;
        }}

        .tab-btn {{
            background: transparent;
            border: none;
            color: #a69bb8;
            padding: 0.6rem 1.1rem;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }}

        .tab-btn:hover {{
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
        }}

        .tab-btn.active {{
            color: #0b0714;
            background: var(--neon-active);
            box-shadow: 0 0 15px rgba(120, 226, 43, 0.4);
        }}

        .tab-content {{
            display: none;
        }}

        .tab-content.active {{
            display: block;
        }}

        .code-wrapper {{
            position: relative;
            background: #0e0918;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            margin-top: 1.2rem;
        }}

        pre {{
            padding: 1.4rem;
            overflow-x: auto;
            color: #d1d5db;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.88rem;
            line-height: 1.55;
        }}

        .copy-btn {{
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
        }}

        .copy-btn:hover {{
            background: var(--neon-active);
            color: #0b0714;
        }}

        .expl-box {{
            background: rgba(120, 226, 43, 0.08);
            border-left: 4px solid var(--neon-active);
            padding: 1.1rem 1.4rem;
            border-radius: 0 10px 10px 0;
            margin-top: 1rem;
            color: #d8eed0;
            font-size: 0.95rem;
            line-height: 1.6;
        }}
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="badge">Extraction & Analyse CSS</div>
        <h1>Animations Carte "Fused" & Spin 1080°</h1>
        <p class="intro">
            Dans ce second code source (carte <strong>Dania Vega</strong>), la carte utilise le système 
            <code>.wrapper-card.common.shimmy.fused.fused-active</code>. 
            Il combine une <strong>aura néon électrique en défilement</strong>, un <strong>voile holographique irisé</strong>, 
            des <strong>scintillements animés</strong>, une <strong>oscillation 3D</strong> et une animation de <strong>rotation 1080°</strong>.
        </p>
    </header>

    <!-- Barre de Contrôles & Test du Spin 1080 -->
    <div class="controls-bar">
        <div class="rarity-selector">
            <span style="font-weight: 600; font-size: 0.9rem; color: #a69bb8; margin-right: 0.5rem;">Palette Rareté :</span>
            <button class="rarity-btn active btn-common" onclick="setRarity('common', '#78e22b', this)">Common (Vert)</button>
            <button class="rarity-btn btn-rare" onclick="setRarity('rare', '#29c4f7', this)">Rare (Cyan)</button>
            <button class="rarity-btn btn-epic" onclick="setRarity('epic', '#fb50ff', this)">Epic (Magenta)</button>
            <button class="rarity-btn btn-legendary" onclick="setRarity('legendary', '#fedd30', this)">Legendary (Or)</button>
        </div>

        <button class="action-spin-btn" id="btnSpin" onclick="trigger1080Spin()">
            <span>⚡</span> Lancer le Spin 1080° (Fusion / Transformation)
        </button>
    </div>

    <!-- Zone Démo & Explication Visuelle -->
    <div class="showcase-area">
        <!-- La Carte Interactive -->
        <div class="card-stage">
            <div id="demoCard" class="wrapper-card common shimmy fused fused-active">
                <div class="front">
                    <!-- Image de fond du personnage -->
                    <div class="img-card"></div>
                    <!-- Ombre dégradée inférieure -->
                    <div class="card-cache"></div>
                    <!-- Reflet de lumière oblique -->
                    <div class="shine-wrapper">
                        <div class="shine"></div>
                    </div>
                    <!-- Informations carte -->
                    <div class="card-infos">
                        <div class="card-name">Dania Vega</div>
                        <div class="card-badge" id="badgeRarity">Common Fused</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Décomposition des 5 couches d'animations -->
        <div class="layers-breakdown">
            <div class="layers-title">
                <span>✨</span> Les 5 Couches d'Animations Actives
            </div>

            <div class="layer-item">
                <div class="layer-num">1</div>
                <div class="layer-details">
                    <h4>Aura & Contour Néon Électrifié (<code>.fused</code> + <code>@keyframes steam</code>)</h4>
                    <p>
                        Généré par <code>.front:before</code> et <code>.front:after</code>. Le dégradé <code>background-size: 400%</code> 
                        défile en continu sur 20s. La couche <code>:after</code> a <code>filter: blur(1.2em)</code>, produisant un halo énergétique rayonnant.
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">2</div>
                <div class="layer-details">
                    <h4>Balayage Holographique Irisé (<code>.fused-active:before</code> + <code>@keyframes hologradient</code>)</h4>
                    <p>
                        Un flash diagonal cyan et magenta passe en boucle avec <code>mix-blend-mode: color-dodge</code>, 
                        donnant à la carte l'aspect d'une carte brillante de collection (foil/holographique).
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">3</div>
                <div class="layer-details">
                    <h4>Paillettes Scintillantes (<code>.fused-active:after</code> + <code>@keyframes holosparkle</code>)</h4>
                    <p>
                        Une nappe d'étoiles scintillantes (<code>sparklez.gif</code>) avec <code>mix-blend-mode: color-dodge</code> 
                        qui respire avec des variations d'opacité entre 50% et 85%.
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">4</div>
                <div class="layer-details">
                    <h4>Balancement 3D & Rayon de Lumière (<code>.shimmy</code> + <code>.shine</code>)</h4>
                    <p>
                        La carte oscille doucement dans l'espace 3D (<code>rotateY(18deg) skewX(2.5deg)</code>), 
                        pendant qu'un rayon lumineux blanc (<code>.shine</code>) traverse la carte toutes les 6 secondes.
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">5</div>
                <div class="layer-details">
                    <h4>Transformation 3D Spin 1080° (<code>.spinincard1080deg</code>)</h4>
                    <p>
                        Déclenchée au clic (bouton ci-dessus) : la carte réalise <strong>3 tours complets à 360°</strong> (1080°) 
                        en perspective 3D sur 2 secondes pour révéler son déverrouillage ou son skin Fullart.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Section Code Source Prêt à l'Emploi -->
    <div class="code-section">
        <h2><span>02.</span> Codes Prêts à Copier-Coller</h2>

        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('tab-full', this)">Pack Complet (Fused + Shimmer + 3D)</button>
            <button class="tab-btn" onclick="showTab('tab-aura', this)">Aura Néon Défilante Seule (Steam)</button>
            <button class="tab-btn" onclick="showTab('tab-spin', this)">Animation Spin 1080° Seule</button>
        </div>

        <!-- Onglet 1 : Pack Complet -->
        <div id="tab-full" class="tab-content active">
            <div class="expl-box">
                <strong>Comment intégrer l'effet complet :</strong><br>
                Ce bloc réunit le contour néon défilant, l'aura luminescente floue, le balayage holographique et l'oscillation 3D dans une structure CSS propre et autonome.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-full')">Copier le code</button>
                <pre><code id="code-full">&lt;!-- Structure HTML Carte Fused --&gt;
&lt;div class="card-fused shimmy"&gt;
  &lt;div class="card-inner"&gt;
    &lt;img src="votre-image.webp" class="card-photo" alt="Carte"&gt;
    &lt;div class="shine"&gt;&lt;/div&gt;
    &lt;div class="card-content"&gt;
      &lt;h3&gt;Titre de la Carte&lt;/h3&gt;
      &lt;span&gt;Fused Edition&lt;/span&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;style&gt;
:root {{
  --radius-card: 16px;
  --border-card: 3px;
}}

/* 1. Cadre principal & oscillation 3D */
.card-fused {{
  position: relative;
  width: 260px;
  height: 390px;
  border-radius: var(--radius-card);
  user-select: none;
  transform-style: preserve-3d;
}}

.card-fused.shimmy {{
  animation: shimmy 6s ease-in-out infinite;
}}

@keyframes shimmy {{
  0%, 100% {{ transform: rotateY(1deg) skewX(1deg); }}
  50%      {{ transform: rotateY(18deg) skewX(2.5deg); }}
}}

/* 2. Contour & Halo Néon Défilant (Steam) */
.card-fused::before,
.card-fused::after {{
  content: '';
  position: absolute;
  left: calc(0px - var(--border-card));
  top: calc(0px - var(--border-card));
  width: calc(100% + (var(--border-card) * 2));
  height: calc(100% + (var(--border-card) * 2));
  /* Dégradé néon (ici vert fluo - adaptable selon rareté) */
  background-image: linear-gradient(45deg, #D4FFA7, #77E203, #1E0322, #6EFF78, #15C421);
  background-size: 400%;
  border-radius: var(--radius-card);
  z-index: -1;
  animation: steam 20s linear infinite;
}}

/* La couche ::after crée le halo lumineux en étant floutée */
.card-fused::after {{
  filter: blur(1.2em);
  opacity: 0.85;
}}

@keyframes steam {{
  0%, 100% {{ background-position: 0 0; }}
  50%      {{ background-position: 400% 0; }}
}}

/* 3. Intérieur de la carte */
.card-inner {{
  position: absolute;
  inset: 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: #140826;
}}

.card-photo {{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}}

/* 4. Voile holographique irisé (Color Dodge) */
.card-inner::before {{
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    115deg,
    transparent 0%,
    rgb(0, 231, 255) 30%,
    rgb(255, 0, 231) 70%,
    transparent 100%
  );
  background-size: 300% 300%;
  mix-blend-mode: color-dodge;
  opacity: 0;
  z-index: 5;
  animation: hologradient 6s ease infinite;
  pointer-events: none;
}}

@keyframes hologradient {{
  3%   {{ opacity: 0; }}
  10%  {{ background-position: 0% 0%; }}
  30%  {{ opacity: 0.6; }}
  35%  {{ background-position: 100% 100%; }}
  40%  {{ opacity: 0; }}
  60%  {{ opacity: 0; background-position: 100% 100%; }}
  70%  {{ opacity: 0.4; }}
  90%  {{ opacity: 0; background-position: 0% 0%; }}
}}

/* 5. Rayon de lumière oblique */
.shine {{
  position: absolute;
  width: 35em;
  height: 4em;
  transform: rotate(30deg);
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: shine 6s ease-in-out infinite;
  pointer-events: none;
  z-index: 6;
}}

@keyframes shine {{
  0%, 100% {{ margin-top: -6em; }}
  50%      {{ margin-top: 35em; }}
}}

.card-content {{
  position: absolute;
  bottom: 1.2rem;
  left: 1.2rem;
  z-index: 10;
  color: #fff;
}}
&lt;/style&gt;</code></pre>
            </div>
        </div>

        <!-- Onglet 2 : Aura Néon Seule -->
        <div id="tab-aura" class="tab-content">
            <div class="expl-box">
                <strong>💡 L'astuce du contour néon animé "Steam" :</strong><br>
                Le secret réside dans le <code>background-size: 400%</code> sur le pseudo-élément <code>::before</code>, 
                couplé à un second pseudo-élément <code>::after</code> identique mais muni d'un <code>filter: blur(...)</code>. 
                Le déplacement continu du dégradé (de 0 à 400%) donne cette impression de courant électrique liquide qui tourne autour du cadre.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-aura')">Copier le code</button>
                <pre><code id="code-aura">/* Effet Aura Néon Steam Minimal */
.neon-box {{
  position: relative;
  width: 250px;
  height: 350px;
  background: #120c22;
  border-radius: 16px;
}}

.neon-box::before,
.neon-box::after {{
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: linear-gradient(45deg, #d4ffa7, #77e203, #1e0322, #6eff78, #15c421);
  background-size: 400%;
  z-index: -1;
  animation: steam 20s linear infinite;
}}

/* Le flou qui crée la lueur rayonnante */
.neon-box::after {{
  filter: blur(16px);
  opacity: 0.8;
}}

@keyframes steam {{
  0%, 100% {{ background-position: 0 0; }}
  50%      {{ background-position: 400% 0; }}
}}</code></pre>
            </div>
        </div>

        <!-- Onglet 3 : Spin 1080° -->
        <div id="tab-spin" class="tab-content">
            <div class="expl-box">
                <strong>💡 Comment fonctionne le Spin 1080° :</strong><br>
                La classe <code>.spinincard1080deg</code> applique 3 tours complets à 360° (soit 1080°) sur l'axe Y en 2 secondes, 
                avec un léger <code>skewX</code> pour donner du relief et de la torsion à la carte durant la rotation.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-spin')">Copier le code</button>
                <pre><code id="code-spin">/* Animation de rotation 1080° */
.spinincard1080deg {{
  transition-duration: 0.25s;
  animation: spinincard1080deg 2s ease-in-out forwards;
}}

@keyframes spinincard1080deg {{
  0% {{
    transform: rotateY(0deg) skewX(2deg);
  }}
  100% {{
    transform: rotateY(1080deg) skewX(1deg);
  }}
}}

/* Exemple de déclenchement JS : */
// element.classList.add('spinincard1080deg');
// setTimeout(() => element.classList.remove('spinincard1080deg'), 2000);</code></pre>
            </div>
        </div>
    </div>
</div>

<script>
    function showTab(tabId, btn) {{
        document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
        document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        btn.classList.add("active");
    }}

    function copyCode(elementId) {{
        const text = document.getElementById(elementId).innerText;
        navigator.clipboard.writeText(text).then(() => {{
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = "Copié !";
            btn.style.background = "#00f6ff";
            btn.style.color = "#000";
            setTimeout(() => {{
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.color = "";
            }}, 2000);
        }}).catch(() => {{
            alert("Code copié !");
        }});
    }}

    // Changement de rareté
    function setRarity(rarity, color, btn) {{
        const card = document.getElementById("demoCard");
        card.classList.remove("common", "rare", "epic", "legendary");
        card.classList.add(rarity);

        document.querySelectorAll(".rarity-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.documentElement.style.setProperty("--neon-active", color);
        document.getElementById("badgeRarity").innerText = rarity.toUpperCase() + " FUSED";
        document.getElementById("badgeRarity").style.background = color;
    }}

    // Déclencheur du Spin 1080°
    function trigger1080Spin() {{
        const card = document.getElementById("demoCard");
        const btn = document.getElementById("btnSpin");

        btn.disabled = true;
        btn.style.opacity = "0.6";

        card.classList.remove("shimmy");
        card.classList.add("spinincard1080deg");

        setTimeout(() => {{
            card.classList.remove("spinincard1080deg");
            card.classList.add("shimmy");
            btn.disabled = false;
            btn.style.opacity = "1";
        }}, 2050);
    }}
</script>

</body>
</html>
"""

with open("/home/user/animation_carte_fused.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Demo file created at /home/user/animation_carte_fused.html, size:", len(html_content))

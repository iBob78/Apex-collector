import base64

with open("/home/user/effets_holographic/assets/holographic-motifs.png", "rb") as f:
    b64_motifs = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

with open("/home/user/effets_holographic/assets/kendra.png", "rb") as f:
    b64_kendra = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Effet Carte Holographique (Foil Shimmer) - BoobyLegends</title>
    <style>
        :root {{
            --bg-dark: #0a0614;
            --bg-card: #150d24;
            --bg-panel: #1d1233;
            --border-panel: rgba(162, 0, 255, 0.25);
            --neon-purple: #9b51e0;
            --neon-pink: #ff0b95;
            --neon-cyan: #00f6ff;
            --holo-base: #6b5dbf;
            --radius-card: 16px;
            --border-card: 4px;
            --speed: 5s;
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
            background: linear-gradient(135deg, rgba(107, 93, 191, 0.3), rgba(255, 11, 149, 0.3));
            border: 1px solid rgba(162, 0, 255, 0.6);
            color: #e2cbff;
            padding: 0.35rem 1.2rem;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 1rem;
            box-shadow: 0 0 15px rgba(162, 0, 255, 0.3);
        }}

        h1 {{
            font-size: 2.3rem;
            background: linear-gradient(135deg, #ffffff 0%, #e2cbff 50%, #00f6ff 100%);
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

        /* Barre d'outils interactifs */
        .controls-bar {{
            background: var(--bg-panel);
            border-radius: 16px;
            padding: 1.25rem 1.75rem;
            margin-bottom: 3rem;
            display: flex;
            align-items: center;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }}

        .control-group {{
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}

        .control-group label {{
            font-size: 0.9rem;
            font-weight: 600;
            color: #ccc;
        }}

        input[type="range"] {{
            accent-color: var(--neon-purple);
            cursor: pointer;
            width: 120px;
        }}

        .toggle-btn {{
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ccc;
            padding: 0.4rem 0.9rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }}

        .toggle-btn.active {{
            background: var(--neon-purple);
            color: #fff;
            border-color: var(--neon-purple);
            box-shadow: 0 0 12px rgba(162, 0, 255, 0.5);
        }}

        .btn-spin {{
            background: linear-gradient(135deg, #6b5dbf, #ff0b95);
            color: #fff;
            border: none;
            padding: 0.55rem 1.2rem;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(255, 11, 149, 0.4);
            transition: all 0.2s ease;
        }}

        .btn-spin:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(255, 11, 149, 0.7);
        }}

        /* Zone de Démo principale */
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
           LA CARTE HOLOGRAPHIQUE (.wrapper-card.holographic.shimmy)
        ==================================================================== */
        .wrapper-card.holographic {{
            position: relative;
            width: 270px;
            height: 405px;
            border-radius: var(--radius-card);
            background-color: var(--holo-base);
            user-select: none;
            transform-style: preserve-3d;
            box-sizing: border-box;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(107, 93, 191, 0.4);
            border: var(--border-card) solid #6b5dbf;
            transition: transform 0.25s ease;
        }}

        /* Effet d'oscillation 3D (Shimmy) */
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

        /* Conteneur Front */
        .wrapper-card.holographic .front {{
            position: absolute;
            inset: 0;
            border-radius: calc(var(--radius-card) - 4px);
            overflow: hidden;
            background-color: #6b5dbf;
        }}

        /* 1. MOTIFS FOIL IRISÉS (inner-motifs) */
        .wrapper-card.holographic .inner-motifs {{
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-repeat: no-repeat;
            background-size: 105% auto;
            background-position: center;
            background-image: url('{b64_motifs}');
            z-index: 1;
            mix-blend-mode: overlay;
            opacity: 0.95;
            pointer-events: none;
        }}

        /* 2. DOUBLE DÉGRADÉ ANIMÉ HOLOGRAPHIQUE (inner-anim:before & :after) */
        .wrapper-card.holographic .inner-anim {{
            position: absolute;
            inset: 0;
            z-index: 2;
            background-color: transparent;
            pointer-events: none;
        }}

        /* Couche Dégradé 1 (holographic normal) */
        .wrapper-card.holographic .inner-anim:after {{
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(135deg, 
                #FFFFF4 0%, #FFFFFF 2%, #F7A9DD 4%, #6F5BBC00 6%, #6959BB00 22%, 
                #6656B510 26%, #FFA2FC 28%, #FFABFF 30%, #6959BB00 33%, #6356B200 49%, 
                #F2AABE 52%, #F9FEB6 54%, #FEFECA 56%, #FFFFFF 57%, #6C5DC200 58%, 
                #6A5EC300 75%, #6A5EC200 78%, #FCE927A1 80%, #00DCFF 82%, #6A5EC100 84%, 
                #6B5DBF00 93%, #FF9B2E26 94%, #FFFFC5 96%, #FFF6C7 96%, #FDF6BE7D 97%, 
                #6F5FBC00 99%, #FFFFFF 100%
            );
            background-size: 200%;
            z-index: 1;
            animation: holographic var(--speed) linear infinite;
            mix-blend-mode: hard-light;
            opacity: 0.9;
        }}

        /* Couche Dégradé 2 Inversée (holographic-reverse) */
        .wrapper-card.holographic .inner-anim:before {{
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(135deg, 
                #6959BB00 0%, #6F5BBC00 6%, #F3FEFF 9%, #D5FEFE 11%, #D6FEFE 13%, 
                #D5D0FED1 15%, #FFF8FF 17%, #EF88FF 18%, #6959BB00 22%, #6656B510 26%, 
                #6959BB00 33%, #1EFF008C 35%, #77DDEE 37%, #9748FF85 39%, #FAA2CA 41%, 
                #FEFBE5 43%, #FEFFFB 44%, #E662B7 45%, #B16BC4 46%, #6356B200 49%, 
                #6C5DC200 58%, #6A5CBD00 65%, #F7E1DF 67%, #FFFFFF 68%, #FFFFFFE4 72%, 
                #C08CDE 73%, #6A5EC300 75%, #6A5EC200 78%, #6A5EC100 84%, #F97EFC 90%, 
                #6B5DBF00 93%, #6F5FBC00 99%, #6F5FBC00 100%
            );
            background-size: 200%;
            z-index: 2;
            animation: holographic-reverse var(--speed) linear infinite;
            mix-blend-mode: color-dodge;
            opacity: 0.85;
        }}

        @keyframes holographic {{
            0%, 100% {{
                background-position: 0% 0;
            }}
            50% {{
                background-position: 100% 0;
            }}
        }}

        @keyframes holographic-reverse {{
            0%, 100% {{
                background-position: 100% 0;
            }}
            50% {{
                background-position: 0% 0;
            }}
        }}

        /* 3. REFLET LUMINEUX OBLIQUE (Shine) */
        .shine-wrapper {{
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 6;
        }}

        .wrapper-card.shimmy .shine {{
            display: block;
            width: 35em;
            height: 4em;
            margin-left: -4em;
            transform: rotate(30deg);
            background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.35), transparent);
            position: absolute;
            animation: shine 6s ease-in-out infinite;
        }}

        @keyframes shine {{
            0%, 100% {{ margin-top: -6em; }}
            50%      {{ margin-top: 35em; }}
        }}

        /* 4. IMAGE DE LA STAR (Détourée transparente) */
        .img-pornstar {{
            position: absolute;
            inset: 0;
            background-image: url('{b64_kendra}');
            background-size: cover;
            background-position: center bottom;
            background-repeat: no-repeat;
            z-index: 4;
            pointer-events: none;
        }}

        /* 5. DÉGRADÉ INFÉRIEUR DU SOCLE (.cache) */
        .wrapper-card.holographic .cache {{
            position: absolute;
            inset: 0;
            box-shadow: inset 0px 0px 10px #1e0322;
            border-radius: inherit;
            background: linear-gradient(180deg, #F900FF00 55%, rgba(206, 0, 255, 0.4) 75%, #6600FF 100%);
            z-index: 3;
            pointer-events: none;
        }}

        /* 6. INFOS CARTE */
        .infos-card {{
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            z-index: 10;
        }}

        .titre-card h2 {{
            font-size: 1.25rem;
            font-weight: 800;
            color: #fff;
            text-shadow: 0 0 10px #6600ff, 0 2px 5px rgba(0,0,0,0.8);
        }}

        .pornstar-status {{
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            background: linear-gradient(90deg, #6600ff, #ff0b95);
            color: #fff;
            margin-top: 0.25rem;
            box-shadow: 0 0 10px rgba(102, 0, 255, 0.6);
        }}

        /* Animation Spin 1080° */
        .wrapper-card.spinincard1080deg {{
            transition-duration: 0.25s;
            animation: spinincard1080deg 2s ease-in-out !important;
        }}

        @keyframes spinincard1080deg {{
            0%   {{ transform: rotateY(0deg) skewX(2deg); }}
            100% {{ transform: rotateY(1080deg) skewX(1deg); }}
        }}

        /* Explication des 4 couches holographiques */
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
            background: rgba(162, 0, 255, 0.2);
            border: 1px solid rgba(162, 0, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.85rem;
            color: #dcb8ff;
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
            color: #fff;
            background: var(--neon-purple);
            box-shadow: 0 0 15px rgba(162, 0, 255, 0.4);
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
            background: var(--neon-purple);
        }}

        .expl-box {{
            background: rgba(162, 0, 255, 0.08);
            border-left: 4px solid var(--neon-purple);
            padding: 1.1rem 1.4rem;
            border-radius: 0 10px 10px 0;
            margin-top: 1rem;
            color: #e5d8ff;
            font-size: 0.95rem;
            line-height: 1.6;
        }}
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="badge">Extraction & Analyse CSS</div>
        <h1>Effet Carte Holographique (Foil Shimmer)</h1>
        <p class="intro">
            Dans ce code source (carte <strong>Kendra Sunderland</strong>, niveau Tier S Holographic), 
            la carte utilise l'effet de feuille holographique (<strong>Holographic Foil</strong>) 
            avec deux couches de dégradés multicolores inversés (<code>inner-anim</code>) et une texture de motifs floraux (<code>inner-motifs</code>).
        </p>
    </header>

    <!-- Contrôles interactifs -->
    <div class="controls-bar">
        <div class="control-group">
            <label for="speedRange">⚡ Vitesse holographique :</label>
            <input type="range" id="speedRange" min="1" max="12" value="5" step="0.5">
            <span id="speedVal" style="color: var(--neon-cyan); font-weight: bold;">5s</span>
        </div>

        <button class="toggle-btn active" id="btnMotifs" onclick="toggleMotifs()">🌸 Motifs Foil : ON</button>
        <button class="toggle-btn active" id="btnShimmy" onclick="toggleShimmy()">🌀 Oscillation 3D : ON</button>
        <button class="toggle-btn active" id="btnShine" onclick="toggleShine()">✨ Rayon Shine : ON</button>

        <button class="btn-spin" id="btnSpin" onclick="trigger1080Spin()">⚡ Spin 1080°</button>
    </div>

    <!-- Zone Démo & Analyse des Couches -->
    <div class="showcase-area">
        <!-- La Carte Interactive -->
        <div class="card-stage">
            <div id="demoCard" class="wrapper-card holographic shimmy">
                <div class="front">
                    <!-- 1. Couche Motifs Foil (fleurs iridescentes) -->
                    <div class="inner-motifs" id="cardMotifs"></div>
                    
                    <!-- 2. Double couche de dégradés holographiques animés -->
                    <div class="inner-anim"></div>
                    
                    <!-- 3. Dégradé de base / ombre inférieure -->
                    <div class="cache"></div>

                    <!-- 4. Rayon lumineux blanc oblique (Shine) -->
                    <div class="shine-wrapper" id="cardShine">
                        <div class="shine"></div>
                    </div>

                    <!-- 5. Personnage détouré (transparent) -->
                    <div class="img-pornstar"></div>

                    <!-- 6. Textes et labels -->
                    <div class="infos-card">
                        <div class="titre-card">
                            <h2>Kendra Sunderland</h2>
                        </div>
                        <div class="pornstar-status">Holographic S</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Décomposition des 4 couches de l'effet Holographique -->
        <div class="layers-breakdown">
            <div class="layers-title">
                <span>🌈</span> Anatomie de l'Effet Holographique
            </div>

            <div class="layer-item">
                <div class="layer-num">1</div>
                <div class="layer-details">
                    <h4>Double Dégradé Animé en Opposition (<code>.inner-anim</code>)</h4>
                    <p>
                        C'est le moteur de l'effet. Deux pseudo-éléments (<code>::before</code> et <code>::after</code>) 
                        portent des <strong>dégradés spectraux à 135°</strong> surdimensionnés à <code>200%</code>. 
                        L'un glisse de 0% à 100% via <code>@keyframes holographic</code> tandis que l'autre glisse en sens inverse 
                        via <code>holographic-reverse</code>. Le mélange en <code>color-dodge</code> crée un chatoiement arc-en-ciel perpétuel.
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">2</div>
                <div class="layer-details">
                    <h4>Texture de Motifs Foil (<code>.inner-motifs</code>)</h4>
                    <p>
                        Une texture PNG transparente de fleurs et feuillages géométriques (<code>holographic-motifs@2x.png</code>) 
                        est placée sous les dégradés en <code>mix-blend-mode: overlay</code>. Les motifs captent les reflets de lumière 
                        exactement comme les cartes collector imprimées à chaud sur feuille d'aluminium (Foil Stamp).
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">3</div>
                <div class="layer-details">
                    <h4>Prise en main 3D & Rayon Oblique (<code>.shimmy</code> + <code>.shine</code>)</h4>
                    <p>
                        L'oscillation en 3D (<code>rotateY(18deg) skewX(2.5deg)</code>) donne l'angle de vue parfait pour apprécier 
                        la réfraction de la lumière. Le rayon diagonal (<code>.shine</code>) balaye la surface de haut en bas toutes les 6 secondes.
                    </p>
                </div>
            </div>

            <div class="layer-item">
                <div class="layer-num">4</div>
                <div class="layer-details">
                    <h4>Personnage en Détourage PNG Translucide</h4>
                    <p>
                        Le personnage est au premier plan (<code>z-index: 4</code>). Comme son arrière-plan est transparent, 
                        tous les reflets holographiques, motifs scintillants et lumières traversent le fond de la carte tout autour d'elle.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Section Code Prêt à l'Emploi -->
    <div class="code-section">
        <h2><span>02.</span> Codes Source Prêts à l'Emploi</h2>

        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('tab-exact', this)">Code Original Exact (Foil + Double Gradient)</button>
            <button class="tab-btn" onclick="showTab('tab-pure', this)">Version 100% CSS Pur (Sans Motif PNG)</button>
        </div>

        <!-- Onglet 1 : Code Exact -->
        <div id="tab-exact" class="tab-content active">
            <div class="expl-box">
                <strong>Intégration du système Holographique original :</strong><br>
                La structure ci-dessous reproduit fidèlement la carte Holographic du site avec ses classes <code>.inner-motifs</code>, <code>.inner-anim</code>, et ses animations synchronisées.
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-exact')">Copier le code</button>
                <pre><code id="code-exact">&lt;!-- Structure HTML Carte Holographique --&gt;
&lt;div class="card-holographic shimmy"&gt;
  &lt;div class="front"&gt;
    &lt;!-- Motifs Foil --&gt;
    &lt;div class="inner-motifs"&gt;&lt;/div&gt;
    &lt;!-- Double dégradé irisé animé --&gt;
    &lt;div class="inner-anim"&gt;&lt;/div&gt;
    &lt;!-- Halo inférieur --&gt;
    &lt;div class="cache"&gt;&lt;/div&gt;
    &lt;!-- Rayon de lumière oblique --&gt;
    &lt;div class="shine-wrapper"&gt;&lt;div class="shine"&gt;&lt;/div&gt;&lt;/div&gt;
    &lt;!-- Image personnage PNG transparent --&gt;
    &lt;img src="votre-personnage.png" class="card-character" alt="Personnage"&gt;
    &lt;!-- Contenu texte --&gt;
    &lt;div class="card-infos"&gt;
      &lt;h3&gt;Mon Titre&lt;/h3&gt;
      &lt;span&gt;Holographic&lt;/span&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;style&gt;
:root {{
  --radius-card: 16px;
  --border-card: 4px;
}}

/* 1. Cadre & perspective 3D */
.card-holographic {{
  position: relative;
  width: 260px;
  height: 390px;
  border-radius: var(--radius-card);
  background-color: #6b5dbf;
  border: var(--border-card) solid #6b5dbf;
  transform-style: preserve-3d;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(107, 93, 191, 0.4);
}}

/* 2. Oscillation 3D */
.card-holographic.shimmy {{
  animation: shimmy 6s ease-in-out infinite;
}}

@keyframes shimmy {{
  0%, 100% {{ transform: rotateY(1deg) skewX(1deg); }}
  50%      {{ transform: rotateY(18deg) skewX(2.5deg); }}
}}

.front {{
  position: absolute;
  inset: 0;
  border-radius: calc(var(--radius-card) - 4px);
  overflow: hidden;
  background-color: #6b5dbf;
}}

/* 3. Motifs Foil (texture fleurs/étoiles) */
.inner-motifs {{
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 105% auto;
  background-position: center;
  background-image: url('holographic-motifs.png');
  mix-blend-mode: overlay;
  opacity: 0.95;
  z-index: 1;
}}

/* 4. Double Dégradé Holographique */
.inner-anim {{
  position: absolute;
  inset: 0;
  z-index: 2;
}}

/* Couche 1 */
.inner-anim::after {{
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(135deg, 
    #FFFFF4 0%, #FFFFFF 2%, #F7A9DD 4%, #6F5BBC00 6%, #6959BB00 22%, 
    #6656B510 26%, #FFA2FC 28%, #FFABFF 30%, #6959BB00 33%, #6356B200 49%, 
    #F2AABE 52%, #F9FEB6 54%, #FEFECA 56%, #FFFFFF 57%, #6C5DC200 58%, 
    #6A5EC300 75%, #6A5EC200 78%, #FCE927A1 80%, #00DCFF 82%, #6A5EC100 84%, 
    #6B5DBF00 93%, #FF9B2E26 94%, #FFFFC5 96%, #FFF6C7 96%, #FDF6BE7D 97%, 
    #6F5FBC00 99%, #FFFFFF 100%
  );
  background-size: 200%;
  animation: holographic 5s linear infinite;
  mix-blend-mode: hard-light;
  opacity: 0.9;
}}

/* Couche 2 inversée */
.inner-anim::before {{
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(135deg, 
    #6959BB00 0%, #6F5BBC00 6%, #F3FEFF 9%, #D5FEFE 11%, #D6FEFE 13%, 
    #D5D0FED1 15%, #FFF8FF 17%, #EF88FF 18%, #6959BB00 22%, #6656B510 26%, 
    #6959BB00 33%, #1EFF008C 35%, #77DDEE 37%, #9748FF85 39%, #FAA2CA 41%, 
    #FEFBE5 43%, #FEFFFB 44%, #E662B7 45%, #B16BC4 46%, #6356B200 49%, 
    #6C5DC200 58%, #6A5CBD00 65%, #F7E1DF 67%, #FFFFFF 68%, #FFFFFFE4 72%, 
    #C08CDE 73%, #6A5EC300 75%, #6A5EC200 78%, #6A5EC100 84%, #F97EFC 90%, 
    #6B5DBF00 93%, #6F5FBC00 99%, #6F5FBC00 100%
  );
  background-size: 200%;
  animation: holographic-reverse 5s linear infinite;
  mix-blend-mode: color-dodge;
  opacity: 0.85;
}}

@keyframes holographic {{
  0%, 100% {{ background-position: 0% 0; }}
  50%      {{ background-position: 100% 0; }}
}}

@keyframes holographic-reverse {{
  0%, 100% {{ background-position: 100% 0; }}
  50%      {{ background-position: 0% 0; }}
}}

/* 5. Halo inférieur */
.cache {{
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(206, 0, 255, 0.4) 75%, #6600FF 100%);
  z-index: 3;
}}

/* 6. Rayon de lumière oblique */
.shine-wrapper {{
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 6;
}}

.shine {{
  position: absolute;
  width: 35em;
  height: 4em;
  transform: rotate(30deg);
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.35), transparent);
  animation: shine 6s ease-in-out infinite;
}}

@keyframes shine {{
  0%, 100% {{ margin-top: -6em; }}
  50%      {{ margin-top: 35em; }}
}}

/* 7. Image du personnage & textes */
.card-character {{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  z-index: 4;
}}

.card-infos {{
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 10;
  color: #fff;
}}
&lt;/style&gt;</code></pre>
            </div>
        </div>

        <!-- Onglet 2 : Pure CSS -->
        <div id="tab-pure" class="tab-content">
            <div class="expl-box">
                <strong>Version Pure CSS (sans fichier image PNG de motifs) :</strong><br>
                Cette variante utilise uniquement les deux gradients CSS animés combinés à un filtre de brillance. Aucun asset PNG externe requis !
            </div>

            <div class="code-wrapper">
                <button class="copy-btn" onclick="copyCode('code-pure')">Copier le code</button>
                <pre><code id="code-pure">/* Version Pure CSS du fond Holographique */
.holo-pure-bg {{
  position: relative;
  width: 260px;
  height: 390px;
  border-radius: 16px;
  background-color: #6b5dbf;
  overflow: hidden;
}}

.holo-pure-bg::before,
.holo-pure-bg::after {{
  content: '';
  position: absolute;
  inset: 0;
  background-size: 200%;
}}

/* Couche 1 */
.holo-pure-bg::after {{
  background-image: linear-gradient(135deg, 
    rgba(255,255,255,0.8) 0%, rgba(247,169,221,0.6) 15%, transparent 30%,
    rgba(0,246,255,0.7) 50%, rgba(254,233,39,0.7) 70%, rgba(255,11,149,0.8) 100%
  );
  animation: holographic 5s linear infinite;
  mix-blend-mode: hard-light;
}}

/* Couche 2 */
.holo-pure-bg::before {{
  background-image: linear-gradient(135deg, 
    transparent 0%, rgba(119,221,238,0.7) 25%, rgba(230,98,183,0.8) 50%,
    rgba(254,251,229,0.9) 75%, transparent 100%
  );
  animation: holographic-reverse 5s linear infinite;
  mix-blend-mode: color-dodge;
}}

@keyframes holographic {{
  0%, 100% {{ background-position: 0% 0; }}
  50%      {{ background-position: 100% 0; }}
}}

@keyframes holographic-reverse {{
  0%, 100% {{ background-position: 100% 0; }}
  50%      {{ background-position: 0% 0; }}
}}</code></pre>
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

    // Vitesse interactive
    const speedRange = document.getElementById("speedRange");
    const speedVal = document.getElementById("speedVal");
    speedRange.addEventListener("input", (e) => {{
        const val = e.target.value + "s";
        speedVal.innerText = val;
        document.documentElement.style.setProperty("--speed", val);
    }});

    // Toggles
    let motifsOn = true;
    function toggleMotifs() {{
        motifsOn = !motifsOn;
        const btn = document.getElementById("btnMotifs");
        const el = document.getElementById("cardMotifs");
        btn.classList.toggle("active", motifsOn);
        btn.innerText = "🌸 Motifs Foil : " + (motifsOn ? "ON" : "OFF");
        el.style.display = motifsOn ? "block" : "none";
    }}

    let shimmyOn = true;
    function toggleShimmy() {{
        shimmyOn = !shimmyOn;
        const btn = document.getElementById("btnShimmy");
        const card = document.getElementById("demoCard");
        btn.classList.toggle("active", shimmyOn);
        btn.innerText = "🌀 Oscillation 3D : " + (shimmyOn ? "ON" : "OFF");
        card.classList.toggle("shimmy", shimmyOn);
    }}

    let shineOn = true;
    function toggleShine() {{
        shineOn = !shineOn;
        const btn = document.getElementById("btnShine");
        const el = document.getElementById("cardShine");
        btn.classList.toggle("active", shineOn);
        btn.innerText = "✨ Rayon Shine : " + (shineOn ? "ON" : "OFF");
        el.style.display = shineOn ? "block" : "none";
    }}

    // Spin 1080
    function trigger1080Spin() {{
        const card = document.getElementById("demoCard");
        const btn = document.getElementById("btnSpin");

        btn.disabled = true;
        btn.style.opacity = "0.6";

        card.classList.remove("shimmy");
        card.classList.add("spinincard1080deg");

        setTimeout(() => {{
            card.classList.remove("spinincard1080deg");
            if (shimmyOn) card.classList.add("shimmy");
            btn.disabled = false;
            btn.style.opacity = "1";
        }}, 2050);
    }}
</script>

</body>
</html>
"""

with open("/home/user/animation_carte_holographique.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Demo file created at /home/user/animation_carte_holographique.html, size:", len(html_content))

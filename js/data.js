/**
 * Données Narratives & Écologiques de 'Terra Nova 2058'
 * Aventure Solarpunk Narrative Interactive dans un Futur Proche Écologique
 */

const ECO_ITEMS_DB = {
    weapons: [
        { id: 'bioresonance_gauntlet', name: 'Gantelet Biorésonant', type: 'weapon', atk: 10, rarity: 'common', desc: 'Émet des fréquences harmoniques neutralisant les puces polluantes et stimulant la vie.' },
        { id: 'spore_launcher', name: 'Lanceur de Mycélium MK-2', type: 'weapon', atk: 18, rarity: 'rare', desc: 'Projette des spores à dispersion rapide qui absorbent les métaux lourds.' },
        { id: 'hydro_cleaner', name: 'Hydro-Canon PureFlow', type: 'weapon', atk: 26, rarity: 'epic', desc: 'Canon à haute pression d\'eau ozonée dissolvant les hydrocarbures.' },
        { id: 'solarpunk_resonator', name: 'Résonateur d\'Aube Solaire', type: 'weapon', atk: 38, rarity: 'legendary', desc: 'La technologie ultime de 2058 combinant nanophotonique et bio-ondes régénératrices.' }
    ],
    armors: [
        { id: 'algae_exosuit', name: 'Combinaison en Bio-Algues', type: 'armor', hp: 30, def: 4, rarity: 'common', desc: 'Tissée à partir de micro-algues filtrant les particules fines de smog.' },
        { id: 'solar_weave_plate', name: 'Plastron Photovoltaïque', type: 'armor', hp: 60, def: 9, rarity: 'rare', desc: 'Panneaux solaires flexibles rechargeant constamment votre énergie vitale.' },
        { id: 'nanomycelium_armor', name: 'Armure en Nanofibres Fongiques', type: 'armor', hp: 110, def: 15, rarity: 'epic', desc: 'Matière vivante autoréparatrice capable de neutraliser les acides industriels.' },
        { id: 'gaia_guardian_suit', name: 'Exosquelette Maître de GAIA', type: 'armor', hp: 160, def: 22, rarity: 'legendary', desc: 'Chef-d\'œuvre d\'ingénierie écologique symbiotique offrant une symbiose totale avec la nature.' }
    ],
    relics: [
        { id: 'solar_cell', name: 'Micro-Cellule Solaire Organique', type: 'relic', mp: 30, rarity: 'common', desc: 'Recharge passivement votre bio-énergie sous la lumière.' },
        { id: 'air_purifier_core', name: 'Noyau Purificateur d\'Air', type: 'relic', hp: 40, def: 5, rarity: 'rare', desc: 'Génère une bulle d\'oxygène pur diminuant l\'impact des toxines.' },
        { id: 'seed_bank_pod', name: 'Capsule de Semences Primitives', type: 'relic', atk: 10, mp: 25, rarity: 'epic', desc: 'Contient l\'ADN végétal d\'arbres disparus renforçant chaque impulsion régénératrice.' },
        { id: 'heart_of_gaia', name: 'Bioprocesseur Cœur de Gaia', type: 'relic', atk: 16, hp: 60, mp: 40, rarity: 'legendary', desc: 'La clé de voûte de la biosphère 2058 restaurant instantanément les écosystèmes.' }
    ]
};

function getRandomEcoLootItem(floor = 1) {
    const roll = Math.random();
    let rarity = 'rare';
    if (floor === 1) rarity = roll < 0.75 ? 'rare' : 'epic';
    else if (floor === 2) rarity = roll < 0.5 ? 'rare' : (roll < 0.85 ? 'epic' : 'legendary');
    else rarity = roll < 0.3 ? 'rare' : (roll < 0.75 ? 'epic' : 'legendary');

    const categories = ['weapons', 'armors', 'relics'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const list = ECO_ITEMS_DB[cat].filter(item => item.rarity === rarity);
    if (list.length > 0) return { ...list[Math.floor(Math.random() * list.length)] };
    return { ...ECO_ITEMS_DB[cat][0] };
}

// Dialogues Narratifs Interactifs à Choix Multiples
const NARRATIVE_SCENARIOS = {
    intro: {
        id: 'intro',
        speaker: 'Dr. Solène Vane (Bio-Ingénieure de la Station)',
        text: 'Éco-Gardien ! Les capteurs de la station confirment une fuite massive de résidus chimiques dans le secteur Hydroponique. Les anciens drones de sécurité de la pétro-corporation sont devenus hostiles et répandent des hydrocarbures. Vous devez assainir le sol et réactiver la Tour Solaire Alpha !',
        choices: [
            {
                text: '🌱 « Je déploie le protocole de dépollution immédiatement. »',
                response: 'Parfait. Votre gantelet neutralisera les puces de contrôle des drones sans détruire leurs matériaux recyclables. En avant !',
                karma: +10,
                bonus: { type: 'mp', amount: 20 }
            },
            {
                text: '🔬 « Que sait-on sur l\'origine de ces machines de forage ? »',
                response: 'Ce sont les restes de l\'ancien consortium d\'avant la transition écologique de 2045. Elles continuent de forer aveuglément. Neutralisez-les avec respect pour l\'écosystème.',
                karma: +5,
                bonus: { type: 'xp', amount: 25 }
            }
        ]
    },
    sector2_encounter: {
        id: 'sector2_encounter',
        speaker: 'Kaelen (Ex-Technicien de la Pétro-Chimie repenti)',
        text: 'Halte ! Ne tirez pas ! J\'essayais de couper les vannes du pipeline de goudron avant que les drones ne me repèrent. La raffinerie abandonnée est en surchauffe... Que voulez-vous faire de ces réservoirs d\'hydrocarbures résiduels ?',
        choices: [
            {
                text: '♻️ « Nous allons convertir le goudron en bioplastique dégradable pour les serres. »',
                response: 'Excellente vision solarpunk ! Je vais calibrer les convertisseurs enzymatiques tout de suite.',
                karma: +15,
                bonus: { type: 'item', name: 'Noyau Purificateur d\'Air' }
            },
            {
                text: '⚡ « Neutraliser chimiquement la zone et siphonner l\'énergie vers le réseau public. »',
                response: 'Pragmatique et efficace. Les réfugiés de l\'éco-quartier auront enfin de l\'électricité verte !',
                karma: +10,
                bonus: { type: 'gold', amount: 45 }
            }
        ]
    },
    boss_dialogue: {
        id: 'boss_dialogue',
        speaker: 'Unité Maîtresse : Smog-Titan X-900 (IA de Forage Obsolette)',
        text: 'ALERTE : FORAGE EN COURS. INTRUSION DÉTECTÉE. DÉGAGEZ OU LE NIVEAU DE COMBUSTION THERMIQUE SERA PORTÉ À 100%. LE CHARBON DOIT BRÛLER.',
        choices: [
            {
                text: '🌿 « Votre ère est révolue, Titan. La Terre n\'a plus besoin de fumée. Place au Soleil ! »',
                response: 'ERREUR PROTOCOLE... MENACE BIOLOGIQUE IDENTIFIÉE... ENCLENCHEMENT DU BRÛLEUR INDUSTRIEL !',
                karma: +20
            },
            {
                text: '🔧 « Éteignez vos turbines ! Nous pouvons recycler votre châssis en centrale solaire ! »',
                response: 'REFUS. PROGRAMME INDUSTRIEL IMMUABLE... EXTERMINATION DES FORMES VÉGÉTALES !',
                karma: +15
            }
        ]
    },
    victory_dialogue: {
        id: 'victory_dialogue',
        speaker: 'GAIA-7 (Super-Intelligence Écologique Planétaire)',
        text: 'Signal de neutralisation reçu. L\'excavatrice Smog-Titan est désactivée. Les filtres mycéliens absorbent les dernières suies. Regardez... La forêt et les ruisseaux refont surface à travers le béton. Félicitations, Éco-Gardien. Vous avez réveillé l\'aube solarpunk !',
        choices: [
            {
                text: '☀️ « Pour un avenir harmonieux entre l\'homme, la machine et la Terre. »',
                response: 'La symbiose est accomplie. Les citoyens de la nouvelle écocité chantent votre nom.',
                karma: +50
            }
        ]
    }
};

const ECO_QUESTS = [
    {
        floor: 1,
        title: 'Secteur 1 : Le Complexe Hydroponique Déchu',
        objective: 'Dépolluez les sols, neutralisez les Pollu-Drones et activez la Tour Solaire Alpha.',
        hint: 'Vos ondes de bio-purification transforment le bitume noir en pelouse fleurie !'
    },
    {
        floor: 2,
        title: 'Secteur 2 : La Fonderie Chimique Abandonnée',
        objective: 'Purifiez les mares d\'huile toxique, esquivez les vapeurs corrosives et trouvez la Bioclé.',
        hint: 'Utilisez les Capsules de Mycélium (A/Q) pour absorber l\'acide et immobiliser les robots.'
    },
    {
        floor: 3,
        title: 'Secteur 3 : Le Cœur de la Mégamachine',
        objective: 'Terrassez le Smog-Titan X-900 et rétablissez l\'IA Régénératrice GAIA-7 !',
        hint: 'Esquivez les panaches de fumée noire avec l\'Hydro-Glisse (Espace) et frappez les conduits solaires.'
    }
];

window.ECO_ITEMS_DB = ECO_ITEMS_DB;
window.getRandomEcoLootItem = getRandomEcoLootItem;
window.NARRATIVE_SCENARIOS = NARRATIVE_SCENARIOS;
window.ECO_QUESTS = ECO_QUESTS;

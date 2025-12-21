
import { pokemon as pokemonJP } from './pokemon-jp';

export const ui = {
    loading: "読み込み中...",
    welcome_trainer: "ようこそ、トレーナー！",
    login_prompt: "名前を入力して、色違い探しを始めましょう。",
    username_placeholder: "マサラタウンのサトシ",
    start_hunt: "ハントを開始する",
    disclaimer: "注意：これはシミュレーションです。進行状況はブラウザのローカルに保存され、サーバーには保存されません。",
    trainer: "トレーナー",
    logout: "ログアウト",
    shiny_tracker_title: "色違いトラッカー",
    shinydex_progress: "色違い図鑑の進行状況",
    shiny_pokemon_caught: "匹の色違いを捕まえましました",
    search_placeholder: "名前や番号で検索...",
    show_only_shiny: "色違いのみ表示",
    show_missing_shiny: "未所持の色違いを表示",
    hide_regional_forms: "リージョンフォームを非表示",
    all_generations: "すべて",
    generation_short: "世代",
    filter_by_game: "ゲームの入手可能性でフィルター：",
    no_pokemon_found: "該当するポケモンが見つかりませんでした。",
    trainer_data_loading: "トレーナーデータを読み込み中...",
    pokemon_shown: "{count} 匹のポケモンを表示中",
    collapse_filters: "フィルターを閉じる",
    expand_filters: "フィルターを開く",
    regions: {
        'Alola': 'アローラ',
        'Galar': 'ガラル',
        'Hisui': 'ヒスイ',
        'Paldea': 'パルデア',
    }
};

export const games: Record<string, string> = {
    'rb': '赤・緑',
    'ye': 'ピカチュウ',
    'gs': '金・銀',
    'c': 'クリスタル',
    'rs': 'ルビー・サファイア',
    'e': 'エメラルド',
    'frlg': 'ファイアレッド・リーフグリーン',
    'dp': 'ダイヤモンド・パール',
    'pt': 'プラチナ',
    'hgss': 'ハートゴールド・ソウルシルバー',
    'bw': 'ブラック・ホワイト',
    'bw2': 'ブラック2・ホワイト2',
    'xy': 'X・Y',
    'oras': 'オメガルビー・アルファサファイア',
    'sm': 'サン・ムーン',
    'usum': 'ウルトラサン・ウルトラムーン',
    'lgpe': 'Let\'s Go! ピカチュウ・イーブイ',
    'swsh': 'ソード・シールド',
    'bdsp': 'ブリリアントダイヤモンド・シャイニングパール',
    'la': 'LEGENDS アルセウス',
    'sv': 'スカーレット・バイオレット',
    'lza': 'LEGENDS Z-A',
};

export const pokemon: Record<string, string> = pokemonJP;

import { ChangeLogEntry } from './changelog-en';

export const changelogJP: ChangeLogEntry = {
    title: "更新履歴",
    date: "2026年3月14日",
    sectionTitle: "スペイン語対応＆品質改善",
    features: "新機能",
    featuresList: [
        "スペイン語：アプリケーション全体にスペイン語の完全翻訳を追加（UI、ゲーム、フォーム、法的ページ、SEO）",
        "エラーバウンダリ：予期しないエラーが発生した場合、白い画面ではなくリトライオプション付きで適切に処理",
        "パッシブスクロール：すべてのデバイスでスクロールパフォーマンスを改善",
    ],
    security: "セキュリティ改善",
    securityList: [
        "API CORS：APIアクセスを本番ドメインのみに制限（以前はすべてのオリジンに開放）",
        "認証トークン：安全でないグローバルウィンドウトークンストレージをモジュールスコープの安全なストアに置き換え",
        "ユーザーデータ型からレガシーパスワードハッシュフィールドを削除",
    ],
    technical: "技術的改善",
    technicalList: [
        "ShinyTracker（850行以上）を専用のフックとコンポーネントにリファクタリングし、保守性を向上",
        "API認証を単一の共有モジュールに統合（重複コードを削除）",
        "50以上のデバッグconsole.log呼び出しと未使用のレガシー認証サービスを削除",
        "重複したモバイル検出フックを削除し、TypeScript @ts-ignoreディレクティブを修正",
    ],
    close: "閉じる"
};

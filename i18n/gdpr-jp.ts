// GDPR/Legal translations for Japanese
export const gdprJp = {
    // Cookie Consent Banner
    cookie_banner_title: '必須Cookie',
    cookie_banner_message: '認証とサービス機能のために厳密に必要なCookieを使用しています。これらのCookieは必須であり、GDPRに基づく同意は必要ありません。',
    cookie_accept: '理解しました',
    cookie_reject: '拒否する',
    cookie_customize: 'カスタマイズ',
    cookie_learn_more: '詳細を見る',

    // Footer
    footer_privacy: 'プライバシーポリシー',
    footer_terms: '利用規約',
    footer_contact: 'お問い合わせ',
    footer_made_by: '制作者',
    footer_copyright: '© 2025 PokeTracker. All rights reserved.',
    footer_disclaimer: 'ポケモンおよび関連する名称は、任天堂、ゲームフリーク、株式会社ポケモンの商標です。',

    // Data Export
    export_data_title: 'データをエクスポート',
    export_data_description: 'すべての個人データをJSON形式でダウンロードします。',
    export_data_button: 'データをダウンロード',
    export_data_success: 'データのダウンロードが完了しました！',
    export_data_error: 'データのエクスポート中にエラーが発生しました。',
    export_filename: 'poketracker-data',

    // Privacy Policy
    privacy_title: 'プライバシーポリシー',
    privacy_last_updated: '最終更新日',
    privacy_intro: 'PokeTrackerはお客様のプライバシーを尊重します。本ポリシーでは、個人データの収集、使用、保護方法について説明します。',

    privacy_section1_title: '1. 収集するデータ',
    privacy_section1_content: `以下のデータを収集します：

**アカウント登録時（Clerk経由）：**
- メールアドレス
- ユーザー名
- 固有識別子

**データベース（Supabase）：**
- 捕獲した色違いポケモンのリスト（ID）
- 所有しているポケモンゲーム
- カスタム表示名
- 言語設定

**ゲストモード（localStorage）：**
- 色違いポケモンのリスト（ブラウザにローカル保存）
- 言語設定`,

    privacy_section2_title: '2. データの使用目的',
    privacy_section2_content: `お客様のデータは以下の目的で使用されます：
- 色違いポケモンコレクションの追跡
- デバイス間でのデータ同期（ログイン時）
- ユーザー体験のパーソナライズ（言語、設定）
- サービスの改善`,

    privacy_section3_title: '3. 法的根拠',
    privacy_section3_content: `データ処理は以下に基づいています：
- **同意**：アカウント作成時に規約に同意
- **正当な利益**：サービスの提供と改善
- **契約の履行**：サービス提供に必要`,

    privacy_section4_title: '4. データの共有',
    privacy_section4_content: `お客様のデータを販売することはありません。以下のサービスプロバイダーとのみ共有します：

**技術サービスプロバイダー：**
- **Clerk**（米国）：認証とアカウント管理
- **Supabase**（米国/EU）：安全なデータストレージ
- **Vercel**（米国/EU）：アプリケーションホスティング

これらのサービスはGDPR準拠であり、お客様のデータを保護します。`,

    privacy_section5_title: '5. データ保持期間',
    privacy_section5_content: `- **アカウントデータ**：アカウントが存在する限り保持
- **削除後**：即座に完全削除
- **セキュリティログ**：最大30日間`,

    privacy_section6_title: '6. お客様の権利',
    privacy_section6_content: `GDPRに基づき、以下の権利があります：

- **アクセス権**：データの閲覧
- **訂正権**：データの修正
- **削除権**：アカウントとすべてのデータの削除
- **データポータビリティ権**：データのエクスポート（「データをエクスポート」ボタン）
- **異議申立権**：特定の処理への異議
- **制限権**：データ使用の制限

これらの権利を行使するには、サイトのフッターにあるお問い合わせフォームをご利用ください。`,

    privacy_section7_title: '7. セキュリティ',
    privacy_section7_content: `適切なセキュリティ対策を実施しています：
- 転送中のデータ暗号化（HTTPS）
- 安全な認証（Clerk）
- 安全なデータベース（Supabase）
- データアクセスの制限`,

    privacy_section8_title: '8. Cookie',
    privacy_section8_content: `以下の目的で必須のCookieを使用します：
- ログインセッションの維持
- 設定の保存（言語）

Cookieを拒否することもできますが、ログインが必要な一部の機能は利用できなくなります。`,

    privacy_section9_title: '9. 国際データ転送',
    privacy_section9_content: `お客様のデータは米国（Clerk、Vercel）および欧州連合（Supabase、設定による）に転送される場合があります。これらの転送は安全であり、GDPR準拠です。`,

    privacy_section10_title: '10. 変更',
    privacy_section10_content: `本ポリシーを変更する場合があります。重要な変更は、メールまたはアプリケーション経由で通知されます。`,

    privacy_section11_title: '11. お問い合わせ',
    privacy_section11_content: `個人データに関するご質問は：

**お問い合わせ**：フッターのお問い合わせフォームをご利用ください
**責任者**：Xalarian（PokeTracker）
**回答期限**：最大30日`,

    // Terms of Service
    terms_title: '利用規約',
    terms_last_updated: '最終更新日',
    terms_intro: 'PokeTrackerを使用することで、本利用規約に同意したものとみなされます。',

    terms_section1_title: '1. サービスの説明',
    terms_section1_content: `PokeTrackerは、色違いポケモンコレクションを追跡するための無料のWebアプリケーションです。サービスは「現状のまま」保証なしで提供されます。`,

    terms_section2_title: '2. 許可される使用',
    terms_section2_content: `PokeTrackerは以下の目的で使用できます：
- 個人の色違いポケモンの追跡
- フィルターと検索機能の使用
- データ同期のためのアカウント作成

以下の行為は禁止されています：
- 違法な目的でのサービス使用
- サービスのハッキングまたは侵害の試み
- 許可なくソースコードのコピーまたは再配布
- 他のユーザーへの嫌がらせ目的でのサービス使用`,

    terms_section3_title: '3. 知的財産権',
    terms_section3_content: `**ポケモン**および関連するすべての名称、画像、商標は、任天堂、ゲームフリーク、株式会社ポケモンの財産です。PokeTrackerは非公式の非商用ファンプロジェクトです。

**PokeTracker**（アプリケーションのコードとデザイン）はXalarianによって作成されました。`,

    terms_section4_title: '4. ユーザーアカウント',
    terms_section4_content: `以下について責任を負います：
- アカウントのセキュリティ
- アカウントを通じて行われるすべての活動
- 正確なアカウント情報の維持

本規約に違反した場合、アカウントを停止または削除する権利を留保します。`,

    terms_section5_title: '5. 責任の制限',
    terms_section5_content: `PokeTrackerは無料で「現状のまま」提供されます。以下を保証しません：
- サービスの継続的な可用性
- エラーやバグがないこと
- データの永続的なバックアップ（最善を尽くしますが）

以下について責任を負いません：
- 技術的問題によるデータ損失
- サービス使用に関連する間接的な損害`,

    terms_section6_title: '6. サービスの変更',
    terms_section6_content: `以下の権利を留保します：
- いつでもサービスを変更または中止する
- 本利用規約を変更する
- 機能を追加または削除する

重要な変更はアプリケーション経由で通知されます。`,

    terms_section7_title: '7. 解約',
    terms_section7_content: `プロフィールページからいつでもアカウントを削除できます。本規約に違反した場合、アカウントを停止または削除することがあります。`,

    terms_section8_title: '8. 準拠法',
    terms_section8_content: `本規約はフランス法に準拠します。紛争は管轄裁判所に提出されます。`,

    terms_section9_title: '9. お問い合わせ',
    terms_section9_content: `本規約に関するご質問は：

**お問い合わせ**：フッターのお問い合わせフォームをご利用ください
**責任者**：Xalarian（PokeTracker）`,

    terms_section10_title: '10. ホスティング',
    terms_section10_content: `本サイトは以下によってホストされています：

**Vercel Inc.**
440 N Barranca Ave #4133
Covina, CA 91723
United States
privacy@vercel.com`,
};

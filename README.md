# K3 TRACK

非公式K3の来店・取材・結果・店舗履歴を整理するスマホ優先の非公式データサイトです。

## 現在のフェーズ
- 最優先は非公式K3単独サイトの完成
- 全国版への拡張はサイト完成・営業・必要な承諾確認の後
- K会長関連は参考・照合ソースに限定し、提携・監修・公認を示さない
- Operation COMPASS / IYSKとは別プロジェクトとして管理

## 実装済み
- トップ / 今日 / 次回予定 / 結果 / 履歴 / 店舗 / 企画
- 店舗・企画横断検索
- 店舗別詳細 / 企画別詳細 / 結果詳細
- 高画質企画POP
- モバイル下部ナビ
- DATA JSON連携
- 出典・非公式表記

## 完成までの優先順位
1. 当月予定・過去RESULT・店舗情報の補完
2. スマホUI最終調整
3. 画像・リンク・文言QA
4. DATA MASTERとWeb表示の整合確認
5. 営業先に見せられる品質で完成判定

## Cloudflare deployment
- OC / COMPASS と同じく Cloudflare Dashboard から GitHub リポジトリを直接接続してデプロイする。
- Repository: operation-compass/k3-track
- Deploy command: `npx wrangler deploy`
- Build command: なし
- Worker name: `k3-track`
- workers.dev: enabled
- GitHub Actions 経由のデプロイは現時点では使用しない。
- 次回の大きな更新時に自動化方式への移行を再検討する。


## 情報源と公開ルール

### アカウントの役割
- 非公式K3本人X: 本人来店・本人発信の一次情報。
- 非公式K3取材関連X: 取材告知・結果投稿の一次情報。
- 店舗公式X / 店舗公式サイト / P-WORLD店舗掲載: 開催店舗・日付・掲載名の一次情報。
- K会長X / K会長Note: K3関連企画の照合に使う準一次情報。提携・監修・公認を意味しない。
- IYSK取材班 / DMM等の媒体: 補助・照合用。単独で本人公式扱いしない。
- Yahoo!リアルタイム検索など: 候補発見専用。必ず元投稿または上位ソースへ戻る。

### 企画の公開条件
- 公開中: クロウ・スコープ取材 / 双翼乱舞取材 / 超団結・7店舗共闘 / 非公式K3来店 / お前の席ねぇから。
- 非公開保留: V.I.P / ピエロの晩餐会 / NUMBER MISSION:0to9。
- 名称や素材が確認できても、開催実績を一次情報または準一次情報で確認できるまでは公開企画へ昇格しない。
- 企画の正本は Google Drive の COVERAGE_MASTER。Web JSON は表示用同期レイヤー。

### 結果データの取得ルール
1. 本人・取材公式・店舗公式の最終結果投稿を最優先。
2. 公式最終値がない場合、みんレポ / アナスロ / スロナビ / パチスロ店道しるべ等の営業後データを補完に使用。
3. 中間ランキングは内部検証用。最終結果として公開しない。
4. 複数ソースの数値を推測で合成しない。店舗全体値・機種値・TOP値は出典単位を維持する。
5. 公開RESULTは出典URLと確認日を必須とし、PUBLIC経由でWebへ出す。


## バックアップと復旧

### 正本
- 業務データの正本: Google Drive「K3 DATA MASTER」
- Web表示データ: GitHub `operation-compass/k3-track`
- 公開環境: Cloudflare Workers / Git連携

### バックアップ
- Drive: 99_バックアップ配下にDATA MASTERの世代バックアップを保持。
- GitHub: 大きなUI変更前は退避ブランチを作成する。
- 2026-10-05時点の主要退避: `backup/pre-ui-finish-20261005` → `4a35b5ac8011c9716dda82fd0f44b5efc93f9d98`

### 復旧手順
1. データ不整合の場合はDrive正本を優先し、SCHEDULE / RESULTS / STORES / PUBLIC / QAを確認する。
2. Web JSONだけ壊れた場合はDrive正本から再生成し、GitHub mainへ反映する。
3. UIやJSの不具合の場合は直前コミットを確認し、必要なら退避ブランチの正常版へ戻す。
4. Cloudflare表示不具合の場合はGitHub mainの内容を先に確認し、Cloudflare Gitデプロイ履歴を確認する。
5. 復旧後は DATA_QA の件数・公開NG残存・PUBLIC同期を再監査してから公開完了とする。

### 復旧時に必ず確認するQA
- SCHEDULE / RESULTS / STORES / PUBLIC 件数
- EVENT_ID / RESULT_ID 重複
- 公開RESULTのPUBLIC漏れ
- 公開NG店舗のWeb残存
- PUBLIC Web同期
- STORE_VISUALS同期


## Production deployment

The production Worker is deployed from `main` with GitHub Actions.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers Scripts edit permission for the target account.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID that owns the `k3-track` Worker.

Workflow: `.github/workflows/deploy.yml`

If either secret is missing, deployment intentionally fails before Wrangler runs. This prevents edits from appearing "successful" in GitHub while production remains stale.

### Publishing rule

1. Update source/data on `main`.
2. Confirm the `Deploy K3 Worker` workflow succeeds.
3. Verify the production page response/header and the visible change.
4. Only then treat the update as published.

The site Worker disables caching for HTML, JSON, CSS, JS, and K3 OG images to reduce stale UI/OG previews after deployment.

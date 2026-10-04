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

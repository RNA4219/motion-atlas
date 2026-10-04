---
name: frontend-motion-atlas
description: "200のHTML/JavaScriptモーション作例を使い、WebのUI反応、文字演出、場面転換、Canvasの数理アニメーションを実装・調整する。既存フロントエンドへ動きを加えるとき、減衰やタイミングを比較するとき、単独サンプルを持ち出すときに使う。"
---

# Frontend Motion Atlas

このスキルのディレクトリを基準に、作例を選び、利用先の画面へ必要な動きを組み込む。
200作例のソース、プレイヤー、数理処理を同梱している。実行時の追加依存はない。

## 作例を選ぶ

- 名前・日本語の説明・分類は [src/catalog.js](src/catalog.js) と追加61件の [src/expansion.js](src/expansion.js) にある。目的に関係する項目を検索する。
- UI部品の反応は `controls.js` / `motion.js` / `lab-ui.js`、映像・文字演出は `cinema.js` / `lab-cinema.js`、数理表現は `systems.js` / `lab-systems.js` を読む。いずれも `src/` 内にある。
- 見た目の比較が必要なら、このディレクトリで `npm ci`、`npm run build`、`npm run dev` を実行し、表示されたローカルURLを開く。構築済みRelease ZIPではビルドを省略できる。
- 「2つを比較」は左右を同じ時刻で再生する。同じ作例でパラメータを変えると、減衰・重力・間隔などの効果を比較できる。

## 組み込む

Canvasとして使う場合は `src/` を利用先へコピーし、[src/player.js](src/player.js) の `createPlayer(canvas, id, options)` を入口にする。CanvasのCSSに幅と `aspect-ratio: 1.6` を設定する。モジュールはHTTP経由で配信する。

```js
import { createPlayer } from './src/player.js';
const demo = createPlayer(canvas, 'spring', { params: { damping: 0.4 } });
demo.setSpeed(0.5);
demo.setAccent('#ef7087');
// コンポーネントの破棄時に呼ぶ
// demo.destroy();
```

- 専用パラメータ名と範囲は [src/parameters.js](src/parameters.js) の `parameterSpecs(entry)`、追加作例の定義は `expansion.js` を確認する。存在しない調整項目を推測しない。
- `demo.preset()` / `demo.loadPreset(json)` で設定を往復できる。保存するのはデモID、パラメータ、色、時刻、速度、強度。入力文字や押下状態は保存しない。
- 一つのHTMLで渡す場合は、ビルド後の `dist/samples/<id>.html` を使う。設定JSONはこの単独HTMLでも読み込める。各項目専用のスキルZIPは `dist/downloads/<id>.zip` にある。
- Reactなどでは、DOMが作られた後に生成し、アンマウント時に `destroy()` を呼ぶ。プレイヤーのフレームループやイベントを重複して登録しない。

## 利用先へ合わせる

CanvasのUI作例は動きの説明用であり、フォーム部品の代替ではない。実際のボタン・メニューへ移植するときは、利用先のHTML部品、フォーカス、キーボード操作、状態通知へ動きだけを接続する。ユーザーの選んだフレームワーク、画面構成、デザイントークンを使う。

プレイヤーは `prefers-reduced-motion` に対応している。独自に移植するときも停止・動きを減らす設定を保ち、画面破棄後に描画を残さない。数値シミュレーションは可視化用の近似を含むため、物理計算の精度保証用途へ流用しない。

動きを変更したら、開始・停止・再開、狭い画面、対象の入力方法で結果を確認する。数式やプレイヤーを変更した場合は `npm test`、描画と配布物を変更した場合はビルド後に `npm run verify` と `python scripts/verify-artifacts.py` を実行する。

導入と出典の詳細は [README.md](README.md)、利用条件は [LICENSE](LICENSE) にある。再配布時はMITの著作権表示と本文を保持する。

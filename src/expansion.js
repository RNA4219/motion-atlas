// Copyright (c) 2026 Motion Atlas contributors — MIT License.
// 追加の題材・説明・パラメータ。元カタログとは独立して設計した61作例。
const additions = [
  ['ui','interaction-lab','操作の実験室',`
accordion|Accordion|高さを分け合う|行の開閉率で説明領域の高さを再配分する。見出しと次の行を連動させる。|height,展開の高さ,45,150,90|lag,行の時間差,0,0.6,0.12
radial-menu|Radial menu|円形の操作群|操作群を極座標で配置し、開閉率を半径と角度へ変換する。|items,項目数,3,10,6|radius,展開半径,60,135,105
pull-refresh|Pull to refresh|引いて更新|引き出す距離、回転、解放後の戻りを三段階の時間区間で描く。|travel,引く距離,30,100,65|turns,回転数,1,5,2
swipe-archive|Swipe archive|横へ送って片付ける|カードを横へ送り、背面の操作を露出してから次のカードを詰める。|distance,移動距離,120,450,310|hold,保持の割合,0.1,0.5,0.25
sortable-stack|Sortable stack|順序を入れ替える|持ち上げた行が挿入先へ移り、他の行が空いた位置へ詰まる。|lift,浮上量,0,25,14|rows,行数,3,6,4
magnetic-button|Magnetic button|引き寄せるボタン|ポインタとの距離を重みにしてボタンの位置を引き寄せる。|reach,反応距離,80,300,180|pull,引力,0.05,0.6,0.28
elastic-cursor|Elastic cursor|伸びるカーソル|時間差のある二点を結ぶ楕円で移動方向への伸びを表す。|delay,遅れ,0.03,0.5,0.16|stretch,伸び率,0.2,2,1
breadcrumb|Breadcrumb|つながる階層|階層の名前を固定した間隔へ送り、現在地を面の色で示す。|spacing,階層間隔,85,145,115|depth,階層数,2,4,4
skeleton-shimmer|Skeleton shimmer|読込みの光|プレースホルダーの形でクリップし、斜めの光帯を横へ流す。|band,光帯の幅,30,220,105|slope,傾き,0,0.8,0.35
circular-meter|Circular meter|円周の進捗|割合を円弧の角度へ写し、中央の値と端点を同じ計算で揃える。|target,目標値,10,100,76|thickness,線幅,4,30,14
price-counter|Price counter|値段の更新|差額に応じて数値を補間し、更新した桁を視覚的に強調する。|amount,価格,20,999,249|digits,小数桁,0,2,2
pin-input|PIN input|桁を埋める入力|桁ごとに入力位置を進め、完了時は全体の枠へ状態を反映する。|digits,桁数,4,8,6|gap,桁の間隔,5,22,12
notification-stack|Notification stack|重なる通知|通知の年齢から位置・縮小率・透明度を決め、新しい通知を手前へ置く。|count,通知数,2,5,3|offset,重なり幅,10,40,24
color-wheel|Color wheel|色相の選択|円周の角度を色相へ変換し、選択点と色見本を同期させる。|saturation,彩度,20,100,75|radius,色相環の半径,60,120,95
focus-ring|Focus ring|フォーカスの移動|フォーカス対象の矩形間を補間し、囲む線を途切れず移動させる。|padding,外側の余白,2,20,8|roundness,角丸,0,25,12
scroll-spy|Scroll spy|読む位置を追う|文章の移動と目次の選択を同じ進行率から求める。|sections,節の数,3,7,5|viewport,表示窓の高さ,150,270,225
split-pane|Split pane|幅を分け合う|二つの領域へ配分する比率を連続量にし、境界と内容を追従させる。|ratio,左側の割合,0.2,0.8,0.45|gutter,境界幅,3,18,8
step-journey|Step journey|段階を進む|現在段階を順に進め、完了した区間を線と印で接続する。|steps,段階数,3,7,5|spacing,点の間隔,50,85,70
pagination-bridge|Pagination bridge|ページの橋渡し|選択した番号へインジケータを移し、隣の番号へ近づく間だけ伸ばす。|pages,ページ数,4,9,7|radius,点の半径,10,24,16
`],
  ['movie','type-and-transitions','文字と場面の実験',`
iris-aperture|Iris aperture|絞りの転換|回転する多角形の窓を広げ、背面の次の場面を露出する。|blades,羽根の数,3,12,6|twist,回転角,0,2,0.8
venetian-blinds|Venetian blinds|帯で切り替える|水平帯の高さを時間差で広げ、次の面へ切り替える。|strips,帯の数,3,18,9|delay,帯の時間差,0,0.06,0.025
checker-reveal|Checker reveal|市松の開示|格子を市松の二群へ分け、位相をずらして拡大する。|columns,列数,4,14,8|roundness,セル角丸,0,20,3
diagonal-cascade|Diagonal cascade|斜めの連鎖|各セルの行と列の和を遅延に使い、対角方向へ開示を伝える。|columns,列数,4,12,8|delay,遅延,0.02,0.14,0.07
luminance-reveal|Luminance reveal|明るさで現す|各タイルの明度をしきい値と比較して次の絵を露出する。|cells,分割数,12,40,24|softness,境界幅,0.01,0.3,0.12
halftone-field|Halftone field|網点の映像|移動する明度場を円の面積へ写して網点へ変換する。|spacing,点の間隔,8,25,15|contrast,明暗の差,0.3,2,1
duotone-morph|Duotone morph|二色の移り変わり|明度を二つの色の混合比へ変換し、色面の境界を移動させる。|bands,帯の本数,4,24,12|curve,曲線の深さ,10,100,48
chromatic-orbit|Chromatic orbit|色の軌道|異なる色の軌道を加算合成し、交点に明るい色を作る。|orbits,軌道数,2,8,3|spread,色の間隔,5,65,26
flip-clock|Flip clock|めくれる時計|数字面を上下へ分け、片面を縮める区間で次の数字へ交換する。|digits,桁数,2,5,3|rate,更新頻度,0.2,3,1
typewriter|Typewriter|一文字ずつ書く|表示する文字数を時刻から決め、末尾へ点滅するカーソルを置く。|rate,入力速度,2,18,8|pause,末尾の待ち時間,0.3,3,1.2
text-scramble|Text scramble|文字を解く|確定位置より後ろを種付きの文字で置換し、順に正しい文字へ固定する。|duration,確定までの秒数,1,5,2.5|rate,置換頻度,3,25,12
text-wave|Text wave|行を伝わる波|文字の順番を位相差へ写し、上下移動と回転を同期させる。|amplitude,振幅,5,65,32|wavelength,波長,2,12,6
orbit-letters|Orbit letters|円周の文字|文字を円周へ均等配置し、接線の向きへ回転させる。|radius,半径,55,125,96|copies,周回の語数,1,3,2
perspective-crawl|Perspective crawl|奥へ流れる文章|奥行きの逆数で行を縮め、消失点へ向かって送り出す。|depth,奥行き,1,4,2.5|rows,行数,3,10,6
text-shutters|Text shutters|文字のブラインド|文字面を縦の帯でクリップし、帯ごとに異なる上下位置から揃える。|slices,分割数,4,24,12|travel,移動量,20,170,90
letter-trace|Letter trace|線で文字を描く|自作の線字形の区間長を足し、累積距離に従って線を描き進める。|width,線幅,2,16,7|duration,描画時間,1,5,3
mosaic-focus|Mosaic focus|解像していく|粗いセルから細かいセルへ段階的に移り、同じ色場の解像度を上げる。|minimum,最小分割数,3,10,4|maximum,最大分割数,16,48,32
ribbon-weave|Ribbon weave|交差する帯|曲線の帯へ深さの位相を与え、交差位置で前後を入れ替える。|ribbons,帯の本数,2,9,5|amplitude,うねり,15,100,60
bokeh-drift|Bokeh drift|ぼけた光|種付きの光点を奥行きごとに拡大・減光し、ゆっくり流す。|count,光点数,8,60,28|radius,光の半径,8,60,28
moire-interference|Moire interference|線の干渉|二組の平行線を重ね、角度差から生まれる大きな模様を見る。|spacing,線間隔,4,18,8|angle,角度差,0.03,0.8,0.2
`],
  ['game','simulation-lab','計算の実験室',`
pendulum|Pendulum|振り子の周期|小角度近似の角周波数を長さと重力から求め、振り子の端点へ変換する。|length,糸の長さ,70,190,140|gravity,重力,20,250,100
newton-cradle|Newton cradle|衝突の受け渡し|片側の球が接触する時刻で運動を反対側へ受け渡す理想化モデル。|balls,球数,3,7,5|angle,振り上げ角,0.2,1.2,0.7
projectile|Projectile|放物運動|一定の水平速度と鉛直加速度から位置を求め、地面との接触を計算する。|speed,初速,80,220,145|angle,射出角,20,75,50
orbital-gravity|Orbital gravity|楕円軌道|Kepler方程式を反復で解いて離心近点角を求め、楕円軌道へ写す。|eccentricity,離心率,0,0.8,0.45|radius,長半径,80,220,160
lissajous|Lissajous|二軸の振動|二つの正弦振動の周波数比と位相差から閉じた軌跡を作る。|a,横の周波数,1,9,3|b,縦の周波数,1,9,2
spirograph|Spirograph|転がる円の線|大円の内側を転がる小円上の点から内トロコイドを計算する。|ratio,半径比,2,8,3.5|offset,描点の距離,10,100,55
rose-curve|Rose curve|花の極座標|角度の余弦から半径を求め、花弁のような曲線を描く。|petals,花弁の係数,2,11,5|radius,外半径,60,135,110
superformula|Superformula|形の方程式|三角関数のべきの和から半径を作り、多角形と有機形状の間を探る。|symmetry,対称性,3,12,6|exponent,丸み,0.3,6,1.5
lorenz-attractor|Lorenz attractor|ローレンツの軌道|三つの常微分方程式を固定刻みで積分し、軌道を平面へ投影する。|rho,対流の係数,10,45,28|length,表示点数,250,1500,800
rossler-attractor|Rössler attractor|らせんの吸引子|Rössler方程式を固定刻みで積分し、回転しながら奥行きを投影する。|c,形の係数,3,8,5.7|length,表示点数,250,1500,800
flocking|Flocking|群れの局所規則|近隣との分離・整列・結合から速度を更新し、群れの形を作る。|count,個体数,8,40,22|separation,分離の強さ,0.2,2,1
voronoi-drift|Voronoi drift|最も近い領域|各画素の標本を最も近い母点へ割り当て、領域の変化を描く。|sites,母点数,4,18,9|motion,移動幅,0,70,35
delaunay-mesh|Delaunay mesh|空円の三角形|外接円の中に他の点を含まない三角形を選び、動く点群を結ぶ。|sites,点数,6,22,13|motion,移動幅,0,55,25
poisson-disk|Poisson disk|距離を守る点|候補点を種付き乱数で生成し、既存点との最小距離を満たすものだけ受理する。|distance,最小距離,15,60,30|attempts,候補数,100,700,350
metaballs|Metaballs|つながる面|複数の球からの距離の逆数を足し、等値面を格子で可視化する。|balls,球数,2,7,4|radius,影響半径,20,65,40
verlet-rope|Verlet rope|長さを保つ縄|位置Verletで重力を進め、線分の長さを繰り返し拘束する。|segments,節の数,6,22,14|gravity,重力,0.1,1.5,0.6
cloth-grid|Cloth grid|布の拘束|格子点を重力と風で動かし、横と縦の距離拘束で面を保つ。|wind,風,0,1.2,0.4|stiffness,拘束反復,1,6,3
double-pendulum|Double pendulum|二重振り子|二つの角度と角速度を結合した運動方程式で積分する。|angle,初期角,0.3,2.8,1.8|gravity,重力,1,12,8
game-of-life|Game of Life|隣接の世代|八近傍の生存数から次の世代を同時更新し、模様の出現と消滅を見る。|density,初期密度,0.1,0.5,0.28|rate,世代速度,1,12,5
sandpile|Sandpile|砂の雪崩|中心へ粒を加え、しきい値を超えたセルから四近傍へ粒を渡す。|grains,投入量,30,300,160|threshold,崩れる量,4,8,4
astar-search|A-star search|道を見つける|移動コストと目標までの距離から探索する順序を選び、最短経路を復元する。|obstacles,障害物の密度,0.05,0.35,0.2|seed,配置の種,1,20,7
pendulum-wave|Pendulum wave|周期のずれ|少しずつ異なる周期の振り子を並べ、位相が揃う瞬間を観察する。|count,振り子数,5,20,12|spread,周期差,0.01,0.2,0.06
`],
];
const integerKeys=new Set('items rows depth digits count sections steps pages blades strips columns cells bands orbits copies slices minimum maximum ribbons balls a b petals symmetry length sites attempts segments stiffness grains threshold seed'.split(' '));
export const expansionEntries=additions.flatMap(([category,family,group,rows])=>rows.trim().split('\n').map(row=>{
  const [id,title,label,mechanism,...raw]=row.split('|');
  const parameters=raw.map(text=>{const [key,label,min,max,value]=text.split(',');return{key,label,min:+min,max:+max,default:+value,step:integerKeys.has(key)?1:(+max-+min<=2?.01:.1)};});
  return{id,title,label,kind:id,category,family,group,summary:mechanism,mechanism,parameters,duration:8,interaction:['magnetic-button','elastic-cursor','color-wheel'].includes(id)?'pointer':'activate',tags:[category,family,id,label,'追加','実験'],added:true};
}));

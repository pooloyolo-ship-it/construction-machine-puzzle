(function(root){
 const names=['スコップ','一輪車','プレートコンパクタ','ミニバックホウ','バックホウ','ダンプトラック','ブルドーザー','ロードローラ','ホイールローダ','ラフタークレーン','クローラクレーン','竣工'];
 const files=['shovel','wheelbarrow','plate_compactor','mini_backhoe','backhoe','dump_truck','bulldozer','road_roller','wheel_loader','rough_terrain_crane','crawler_crane','completion'];
 const uses=['掘削・整形','運搬','締固め','小規模掘削','掘削・積込み','運搬','押土・敷均し','締固め','積込み','揚重','大型揚重','工事が完成すること'];
 const descriptions=['土や砂を掘ったり、すくったりする基本的な道具です。細かな作業や重機が入れない場所でも使います。','土や砕石、資材などを人力で運ぶための道具です。狭い場所での運搬に向いています。','地面や砕石を振動で締め固める小型機械です。狭い場所や仕上げ作業でよく使います。','小型の油圧ショベルで、狭い現場や住宅まわりの掘削などで活躍します。','土木工事でよく使われる代表的な建設機械です。地面を掘ったり、土砂をダンプへ積み込んだりします。','土砂や砕石、アスファルト合材などを大量に運ぶための車両です。','前方の大きなブレードで土砂を押したり、地面を粗くならしたりする重機です。','地面や路盤、舗装材料をローラで締め固める機械です。','大きなバケットで土砂や砕石などをすくい、ダンプへ積み込む機械です。','重い資材や構造物を吊り上げて移動させるための移動式クレーンです。','クローラで走行する大型のクレーンで、重量物の吊上げに使われます。','工事が計画どおり完成し、検査や引渡しへ進む段階を「竣工」といいます。'];
 const points=['小規模な掘削や仕上げでは、今でも欠かせない道具です。','現場では「ネコ」と呼ばれることもあります。','埋戻しや舗装下地など、平らな面の締固めに向いています。','小回りが利くため、道路脇や狭い敷地でも使いやすい機械です。','「油圧ショベル」と呼ばれることもあります。','荷台を傾けて材料を降ろせるのが大きな特徴です。','広い場所での造成や土工事で活躍します。','道路工事では、種類の異なるローラを使い分けます。','タイヤで走るため、機動性が高いのが特徴です。','現場内を自走でき、比較的狭い場所でも使われます。','安定性が高く、大規模工事や橋梁工事などでも活躍します。','工事は施工して終わりではなく、完成確認や検査、書類整理などを経て引渡しへ進みます。'];
 const icons=['⚒','🛒','▥','🚜','🚜','🚚','🚜','◉','🚜','🏗','🏗','🚩'];
 const amounts=[0,5,10,30,50,100,200,300,500,1000,2000,5000];
 const ranks=names.map((name,i)=>({level:i+1,name,image:`assets/images/machines/${files[i]}.png`,category:i===11?'完成':uses[i],mainUse:uses[i],description:descriptions[i],fieldPoint:points[i],mergeAmount:amounts[i],icon:icons[i],use:uses[i]}));
 const data={size:4,maxLevel:12,swipeThreshold:28,animationMs:280,comboDurationMs:1000,spawnRates:[{level:1,weight:75},{level:2,weight:20},{level:3,weight:5}],mergeAmounts:[0,...ranks.map(rank=>rank.mergeAmount)],comboAmounts:{2:50,3:100,4:200,5:300},ranks};
 root.ConstructionData=data;if(typeof module!=='undefined')module.exports=data;
})(globalThis);

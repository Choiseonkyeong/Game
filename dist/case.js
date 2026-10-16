export const CASE={title:'단추: 00:13의 편지',subtitle:'CASE 01 · THE ROOM THAT LIED',intro:'수선사 윤이 사라졌다. 문은 안에서 잠겼고, 시계는 00:13에 멈췄다. 단추에게 남겨진 편지에는 한 문장뿐이었다. “시간보다 흔적을 믿어.”',goal:'여섯 공간의 증거를 연결해, 사라진 사람의 경로와 가짜 시각을 밝혀라.'};
export const roomIds=['bedroom','observatory','workshop','archive','music','greenhouse'];
export const milestones=[
 ['curve','temperature','elapsed','blackout','bedroom_open'],
 ['seal','footprints','window_route','star_chart','observatory_open'],
 ['blueprint','relay','clock_method','tool_made','workshop_open'],
 ['ledger','calibration','cart_time','archive_order','archive_open'],
 ['splice','score','recording_loop','tune','music_open'],
 ['route','letter','timeline','exit_method','case_closed']
];
export const rooms={
 bedroom:{name:'침실',tag:'01 / A FALSE MIDNIGHT',intro:'벽시계는 00:13. 하지만 방 안의 다른 물건들은 같은 시각을 말하지 않는다.',next:'observatory',unlock:null,mood:'벽시계만 믿으면 안 될 것 같아.',hint:['전원이 끊긴 뒤 난방기의 온도가 얼마나 내려갔는지 조사하세요.','30°C에서 24°C. 10분에 2°C씩 내려갔다면 30분이 지났습니다.','독립 시계 00:10에서 30분을 빼면 전원이 꺼진 시각은 전날 23:40입니다.'],
 hotspots:[{id:'clock',label:'멈춘 벽시계',x:53.5,y:16.1,art:0,evidence:'wallclock'},{id:'bed',label:'침대',x:17,y:66,action:'sleep'},{id:'radiator',label:'난방기와 온도표',x:75,y:58,art:1,evidence:'curve'},{id:'thermometer',label:'유리 온도계',x:26.5,y:45,art:1,evidence:'temperature'},{id:'watch',label:'책상의 독립 시계',x:94,y:46.7,art:0,evidence:'watch'},{id:'safe',label:'협탁의 숫자 잠금',x:19.2,y:44,art:3,puzzle:'blackout'},{id:'window',label:'밤하늘',x:85,y:31,action:'gaze'},{id:'door',label:'안쪽 문',x:57,y:59,art:3,use:'bedroom_open'}]},
 observatory:{name:'천문실',tag:'02 / THE SEALED WINDOW',intro:'발자국은 창문을 향한다. 정말 누군가 이 창으로 드나들었을까?',unlock:'bedroom_open',next:'workshop',mood:'발자국의 방향과 출입 경로는 같은 말이 아니야.',hint:['창문을 열었다면 반드시 끊어져야 할 흔적이 있습니다.','왁스 봉인은 22:00의 사진과 지금 모습이 같습니다. 발자국만으로 창문 출입을 단정할 수 없습니다.','성도의 동쪽 표식은 광학 안내처럼 좌우로 반전됩니다. 잠금의 실제 방위는 서쪽 W입니다.'],
 hotspots:[{id:'window',label:'봉인된 창문',x:17.8,y:32.3,art:4,evidence:'seal',action:'gaze'},{id:'floor',label:'젖은 발자국',x:39,y:81,art:4,evidence:'footprints',action:'crouch'},{id:'chart',label:'성도와 광학 안내',x:66,y:21,art:15,evidence:'star_chart'},{id:'telescope',label:'망원경 렌즈',x:48,y:42,art:5,item:'lens'},{id:'cabinet',label:'방위 잠금장치',x:91,y:48,art:5,puzzle:'direction'},{id:'door',label:'작업실 통로',x:94,y:72,art:3,door:'workshop'}]},
 workshop:{name:'시계 작업실',tag:'03 / A MANUFACTURED TIME',intro:'벽시계와 연결된 릴레이. 누군가는 시계가 멈추는 순간까지 설계했다.',unlock:'observatory_open',next:'archive',mood:'우연히 고장 난 시계라면, 이 배선은 왜 필요했을까?',hint:['시계 도면과 릴레이 접점의 흔적을 함께 비교하세요.','자석과 가는 구리선을 소지품에서 선택해 조합할 수 있습니다.','완성한 자석 낚싯줄을 환기구에 사용하면 안쪽 철제 걸쇠를 당길 수 있습니다.'],
 hotspots:[{id:'drawing',label:'시계 회로 도면',x:36,y:23,art:9,evidence:'blueprint'},{id:'relay',label:'타버린 릴레이 접점',x:60,y:30,art:9,evidence:'relay'},{id:'magnet',label:'말굽자석',x:10.5,y:47.5,art:6,item:'magnet'},{id:'wire',label:'가는 구리선',x:15.2,y:48,art:7,item:'wire'},{id:'vent',label:'걸쇠가 보이는 환기구',x:91.5,y:14,art:8,use:'workshop_open'},{id:'floor',label:'바닥 조사',x:59,y:83,action:'crouch'},{id:'door',label:'기록실 통로',x:94,y:71,art:3,door:'archive'}]},
 archive:{name:'기록실',tag:'04 / TWELVE MINUTES AHEAD',intro:'기록은 거짓말하지 않을까? 기록을 찍은 시계부터 확인해야 한다.',unlock:'workshop_open',next:'music',mood:'같은 기준으로 고치기 전에는 시각들을 비교할 수 없어.',hint:['출입대장의 시각은 타각 시계로 찍혔습니다. 보정 메모를 먼저 읽으세요.','타각 시계는 실제보다 12분 빠릅니다. 23:52의 카트 기록은 실제 23:40입니다.','실제 시각으로 고쳐 정렬하면 B(23:23), C(23:40), A(23:56), D(00:09) 순서입니다.'],
 hotspots:[{id:'ledger',label:'네 장의 출입 기록',x:14,y:45,art:10,evidence:'ledger'},{id:'clock',label:'타각 시계 보정표',x:60,y:32,art:11,evidence:'calibration'},{id:'drawer',label:'알파벳 기록함',x:75,y:58,art:10,puzzle:'archive_order'},{id:'card',label:'음악실 출입카드',x:76,y:69,art:11,item:'music_card',requires:'archive_order'},{id:'door',label:'음악실 카드 리더',x:94,y:66,art:11,use:'archive_open'}]},
 music:{name:'음악실',tag:'05 / A BELL THAT REPEATS',intro:'00:13에 들렸다는 종소리. 이 방에서는 소리조차 목격자가 될 수 없다.',unlock:'archive_open',next:'greenhouse',mood:'같은 배경 소리가 정확히 반복돼. 누가 소리를 잘라 붙였어.',hint:['납통의 이음선과, 정확히 8초마다 반복되는 배경 소리를 연결하세요.','녹음기를 재생하거나 소리 대신 기록 보기를 눌러 선율을 확인하세요.','들은 음은 도·미·레·솔입니다. 악보 대응표에서 1·3·2·5, 순서대로 건반을 누르세요.'],
 hotspots:[{id:'cylinder',label:'이음선이 있는 납통',x:53,y:46,art:12,evidence:'splice'},{id:'score',label:'건반 대응 악보',x:15,y:41,art:13,evidence:'score'},{id:'player',label:'납통 녹음기',x:58,y:44,art:12,player:true},{id:'piano',label:'네 개의 건반',x:17,y:51,art:13,puzzle:'tune'},{id:'key',label:'온실 열쇠',x:38,y:66,art:3,item:'greenhouse_key',requires:'tune'},{id:'door',label:'옥상 온실 문',x:86,y:54,art:3,use:'music_open'}]},
 greenhouse:{name:'옥상 온실',tag:'06 / THE ROOM BEYOND',intro:'유리문 너머에는 서쪽 보존실이 있다. 단추는 지금까지 모은 흔적들을 마지막으로 맞춰 본다.',unlock:'music_open',next:null,mood:'문을 열기 전에, 어떤 사건이었는지 스스로 설명해야 해.',hint:['배송표의 실제 운행 시각과 출입대장 보정 결과는 서로 다른 사건입니다. 카트는 23:40에 진입하고 23:56에 떠났습니다.','순서는 실제 정전 23:40 → 운반 승강기 출발 23:56 → 녹음된 종소리 00:13입니다.','온전한 창문 봉인, 운반용 승강기, 편지의 계획을 함께 설명하는 가설은 자발적인 실종 연출입니다.'],
 hotspots:[{id:'lift',label:'운반용 승강기',x:17,y:62,art:14,evidence:'lift'},{id:'route',label:'운행표와 배송 상자',x:53,y:65,art:14,evidence:'route'},{id:'letter',label:'윤이 남긴 봉인 편지',x:65,y:54,art:2,evidence:'letter'},{id:'window',label:'새벽 하늘',x:53,y:22,action:'gaze'},{id:'door',label:'서쪽 보존실의 문',x:87,y:56,art:15,puzzle:'conclusion'}]}
};
export const evidence={
 wallclock:{title:'멈춘 벽시계 · 00:13',room:'bedroom',art:0,text:'시침과 분침이 00:13을 가리킨다. 태엽식 시계인데 전기 릴레이가 외부에서 연결되어 있다. 이 숫자가 실제 사건 시각인지는 아직 알 수 없다.',detail:'목격된 숫자와 실제 시각을 구분해야 한다.'},
 curve:{title:'난방기 냉각 기록',room:'bedroom',art:1,flag:'curve',text:'정상 작동 중 표면 온도는 30°C. 전원이 끊기면 처음 60분 동안 정확히 10분마다 2°C씩 내려간다. 오늘 밤의 실측 보정표가 붙어 있다.',detail:'이 사건 안에서 제공되는 보정 조건이다. 현실의 일반적인 냉각 법칙으로 추측할 필요는 없다.'},
 temperature:{title:'현재 표면 온도 · 24°C',room:'bedroom',art:1,flag:'temperature',text:'전원이 꺼진 난방기 표면에 붙어 있던 온도계. 현재 24°C를 가리킨다. 온도표의 센서와 같은 위치다.',detail:'30°C에서 6°C가 내려갔다.'},
 watch:{title:'독립 시계 · 00:10',room:'bedroom',art:0,text:'단추가 가지고 온 배터리식 시계. 조사 기준 시각은 00:10이며 정전의 영향을 받지 않았다. 방 안의 관찰은 이 기준 시각에 이루어졌다.',detail:'기준 시각은 계산을 위해 고정된다. 실제 플레이 시간은 계산에 영향을 주지 않는다.'},
 seal:{title:'끊어지지 않은 창문 봉인',room:'observatory',art:4,flag:'seal',text:'22:00에 찍은 관리 사진과 현재의 붉은 왁스 봉인이 일치한다. 창짝과 고정 틀을 잇는 왁스가 갈라지지 않았고 경첩도 분리되지 않았다.',detail:'이 창문을 열었다면 봉인은 반드시 끊어진다. 별도의 창짝 분리 흔적도 없다.'},
 footprints:{title:'창을 향하는 젖은 발자국',room:'observatory',art:4,flag:'footprints',text:'바닥의 젖은 신발 자국은 창문을 향한다. 그러나 창틀 먼지에는 신발이나 손이 지나간 흔적이 없다. 실내 물통이 쓰러져 있다.',detail:'발자국이 향하는 방향만으로 그 지점에서 출입했다고 단정할 수 없다.'},
 star_chart:{title:'성도와 망원경 광학 안내',room:'observatory',art:15,flag:'star_chart',text:'성도에는 밝은 표식이 오른쪽인 동쪽 E 칸에 그려져 있다. 북 N은 위, 남 S는 아래, 서 W는 왼쪽이다. 이 망원경은 상하는 유지하고 좌우만 반전한다. 렌즈함은 “좌우가 반전된 영상 안에서 표식이 대응하는 도면 방위”를 입력받는다.',detail:'동 E와 서 W를 서로 바꾼다. 북 N과 남 S는 유지된다.'},
 sky:{title:'창가에서 확인한 동쪽 표식',room:'observatory',art:5,text:'단추가 창가에서 양손으로 빛을 가리고 직접 하늘을 보았다. 성도의 동쪽 표식과 창밖 표식이 일치한다. 망원경을 통한 좌우 반전만 적용하면 된다.',detail:'창문을 열지 않고 유리 너머로 관찰했다.'},
 blueprint:{title:'벽시계 정지 장치 도면',room:'workshop',art:9,flag:'blueprint',text:'태엽의 남은 시간을 세팅한 뒤 릴레이로 재가동하는 장치. 정전 후 별도 축전지로 작동하며, 지정한 표시 시각에서 시계 바늘을 정지시킬 수 있다.',detail:'주전원 정전만으로 00:13이라는 특정 표시 시각이 만들어지는 구조가 아니다.'},
 relay:{title:'수동 설정 흔적',room:'workshop',art:9,flag:'relay',text:'릴레이의 수동 설정 단자에만 최근의 금속 마찰 흔적이 있다. 설정 다이얼은 00:13 위치에 고정되어 있고, 봉인용 나사에는 새 공구 자국이 있다.',detail:'도면과 결합하면 의도적으로 특정 시각을 표시하도록 손댄 정황이 된다.'},
 ledger:{title:'출입대장 · 네 장의 기록',room:'archive',art:10,flag:'ledger',text:'모두 같은 타각 시계로 찍혔다. A 00:08 / B 23:35 / C 23:52(운반카트 진입) / D 00:21. 기록함은 실제 시각 순서의 알파벳 네 글자로 열린다.',detail:'밤 23시에서 다음 날 00시로 넘어가는 연속된 기록이다. A와 D는 자정 이후다.'},
 calibration:{title:'타각 시계 보정 · +12분',room:'archive',art:11,flag:'calibration',text:'오늘의 교정 메모: “실제보다 12분 빠름. 모든 타각 기록에서 12분을 뺄 것.” 네 장의 기록 모두 이 시계가 찍었다.',detail:'자정을 넘겨 빼는 계산에 주의해야 한다.'},
 splice:{title:'편집된 납통 녹음',room:'music',art:12,flag:'splice',text:'납통의 동일 구간에 접합 흔적이 있다. 종소리 뒤의 바람 소리와 두 번의 작은 클릭이 정확히 8초마다 똑같이 반복된다. 복제된 구간의 파형도 일치한다.',detail:'같은 소리가 반복된다는 인상뿐 아니라 동일 파형과 접합 흔적이 함께 있다.'},
 score:{title:'건반 대응 악보',room:'music',art:13,flag:'score',text:'이 방의 잠금은 납통에 저장된 네 음의 순서로 열린다. 건반 대응표: 도=1, 레=2, 미=3, 솔=5. 멜로디를 들은 뒤 순서대로 누른다.',detail:'오디오를 사용할 수 없으면 녹음기의 “소리 대신 기록 보기”로 동등한 정보를 확인할 수 있다.'},
 recording:{title:'납통의 네 음 · 도·미·레·솔',room:'music',art:12,text:'녹음에서 들린 순서는 도 → 미 → 레 → 솔. 종소리는 별도의 반복 구간으로 편집되어 있다.',detail:'네 음을 대응표의 숫자로 바꾸면 된다.'},
 lift:{title:'실내 운반용 승강기',room:'greenhouse',art:14,text:'작업실의 서비스 통로, 기록실 옆 카트 진입로, 옥상을 잇는 운반용 승강기. 실내 문을 밖에서 열지 않고도 보존실 방향으로 이동할 수 있다.',detail:'창문을 통하지 않는 이동 경로가 실제로 존재한다.'},
 route:{title:'배송표 · 실제 운행 23:56',room:'greenhouse',art:14,flag:'route',text:'승강기 제어기의 독립 시계로 남긴 기록: 23:56 옥상 출발 → 서쪽 보존실 도착. 앞서 대장의 23:40은 카트가 건물 안 운반로로 진입한 시각이다.',detail:'진입과 출발은 서로 다른 사건이다. 이 배송표에는 기록실의 +12분 보정을 적용하지 않는다.'},
 letter:{title:'윤의 편지',room:'greenhouse',art:2,flag:'letter',text:'“작품들이 압류되기 전에 보존실로 옮겨야 했다. 직접 나가면 운반로가 봉쇄될 거야. 시각과 소문이 사람들의 눈을 다른 곳으로 돌려주길 바랐다. 단추야, 내가 지나간 길을 따라와 줘.”',detail:'편지의 주장만 믿기보다, 지금까지 확인한 물리적 경로와 시각 기록이 이를 뒷받침하는지 검증해야 한다.'}
};
export const items={
 bedroom_key:{name:'안쪽 문 열쇠',art:3,desc:'협탁에서 찾은 황동 열쇠. 침실 안쪽 문의 홈과 맞는다.'},
 lens:{name:'광학 렌즈',art:5,desc:'손바닥 크기의 돋보기 렌즈. 봉인과 발자국의 세부를 확대할 수 있다.'},
 magnet:{name:'말굽자석',art:6,desc:'철제 물건을 끌어당기는 작은 자석. 좁은 환기구 안쪽까지 손으로 닿기는 어렵다.'},
 wire:{name:'가는 구리선',art:7,desc:'길고 잘 휘는 구리선. 다른 도구를 매달아 좁은 틈으로 보낼 수 있다.'},
 magnet_line:{name:'자석 낚싯줄',art:8,desc:'구리선 끝에 자석을 단 도구. 환기구 안의 철제 걸쇠를 끌어당길 수 있다.'},
 music_card:{name:'음악실 출입카드',art:11,desc:'기록함에서 나온 천공 카드. 음악실 카드 리더와 같은 간격의 구멍이 있다.'},
 greenhouse_key:{name:'옥상 온실 열쇠',art:3,desc:'네 음의 잠금이 풀린 피아노 서랍에서 찾은 열쇠. 온실 문에 맞는다.'}
};
export const puzzles={
 elapsed:{title:'얼마나 시간이 흘렀을까?',type:'choice',requires:['curve','temperature'],pair:['curve','temperature'],question:'난방기가 30°C에서 24°C로 내려갔다. 제공된 보정표에 따르면 정전 후 경과 시간은?',options:[['20','20분'],['30','30분'],['60','60분']],answer:'30',flag:'elapsed',explain:'6°C 하강 ÷ (10분당 2°C) = 30분. 현재 표면 온도와 오늘의 보정표를 함께 사용한 결과다.'},
 blackout:{title:'협탁의 실제 정전 시각',type:'code',requires:['elapsed','watch'],pair:['watch','curve'],question:'00:10에 조사한 난방기는 정전 후 30분이 지났다. 실제 정전 시각 네 자리(HHMM)를 입력하라.',answer:'2340',flag:'blackout',reward:'bedroom_key',explain:'00:10 − 30분 = 전날 23:40. 벽시계의 00:13은 이 기록과 일치하지 않는다.'},
 window_route:{title:'창문으로 드나들었을까?',type:'choice',requires:['seal','footprints'],pair:['seal','footprints'],question:'온전한 봉인과 창틀의 먼지, 창을 향한 실내 발자국을 함께 설명하는 판단은?',options:[['entry','발자국이 창을 향하니 창문으로 나갔다'],['sealed','이 창문 출입은 배제하고 실내의 다른 경로를 찾아야 한다'],['flying','창틀을 분리해 봉인을 보존한 출입으로 단정한다']],answer:'sealed',flag:'window_route',explain:'창을 열면 봉인이 끊어져야 한다. 실제 봉인은 온전하고 창틀도 깨끗하다. 발자국의 방향을 출입의 증명으로 착각하면 안 된다.'},
 direction:{title:'렌즈함의 방위 잠금',type:'choice',requires:['window_route','star_chart','sky'],pair:['star_chart','sky'],question:'성도에서 표식은 오른쪽 E 칸에 있다. 좌우만 반전한 영상에서는 도면의 어느 방위 칸에 대응할까?',options:[['N','북 N'],['E','동 E'],['S','남 S'],['W','서 W']],answer:'W',flag:'observatory_open',explain:'영상의 좌우를 반전하면 오른쪽 E 칸의 표식은 왼쪽 W 칸에 대응한다. 실제 천체의 지리적 방위가 바뀐다는 뜻은 아니다. 렌즈함 뒤에서 작업실 통로가 열린다.'},
 clock_method:{title:'시계가 멈춘 이유',type:'choice',requires:['blueprint','relay'],pair:['blueprint','relay'],question:'지정 시각에 정지 가능한 도면과 00:13의 수동 설정 흔적을 함께 설명하는 것은?',options:[['accident','주전원 정전만으로 우연히 00:13을 표시했다'],['staged','별도 전원과 수동 설정으로 00:13이라는 표시를 의도적으로 만들었다'],['broken','12분 빠른 기록실 시계 때문에 이 방의 바늘도 00:13을 표시했다']],answer:'staged',flag:'clock_method',explain:'도면에는 정전 후 별도 전원이 있다. 특정 시각의 수동 설정 흔적도 있으므로, 00:13을 실제 정전 시각으로 볼 수 없다.'},
 cart_time:{title:'카트는 실제 언제 진입했을까?',type:'choice',requires:['ledger','calibration','blackout'],pair:['ledger','calibration'],question:'12분 빠른 시계가 23:52로 찍은 카트 진입 기록. 실제 시각은?',options:[['2340','23:40 · 실제 정전과 같은 시각'],['2352','23:52 · 기록 그대로'],['0004','00:04 · 12분을 더한 시각']],answer:'2340',flag:'cart_time',explain:'23:52 − 12분 = 23:40. 카트 진입과 실제 정전이 겹친다. 이때 시작된 실내 운반 경로를 추적해야 한다.'},
 archive_order:{title:'네 장의 기록 순서',type:'code',requires:['ledger','calibration','cart_time'],pair:['ledger','calibration'],question:'모두 실제 시각으로 고쳐 이른 순서대로 알파벳 네 글자를 입력하라. A 00:08 / B 23:35 / C 23:52 / D 00:21.',answer:'BCAD',flag:'archive_order',explain:'B 23:23 → C 23:40 → A 23:56 → D 00:09. 자정 이후 기록에서 12분을 빼는 부분이 핵심이다.'},
 recording_loop:{title:'종소리는 실시간이었을까?',type:'choice',requires:['splice','recording'],pair:['splice','recording'],question:'접합 흔적과 8초마다 일치하는 배경 파형을 보았다. 00:13의 종소리를 어떻게 취급해야 할까?',options:[['live','현장에서 실시간으로 울렸다는 확실한 증거'],['recorded','편집된 녹음일 수 있으므로 실제 사건 시각의 증거로 사용할 수 없다'],['rain','접합 흔적이 있어도 녹음 속 시각은 현장의 실제 시각으로 볼 수 있다']],answer:'recorded',flag:'recording_loop',explain:'동일 파형의 반복과 접합 흔적이 함께 확인됐다. 들린 종소리가 실시간이었다는 전제를 버려야 한다.'},
 tune:{title:'피아노의 네 음 잠금',type:'notes',requires:['score','recording','recording_loop'],pair:['score','recording'],question:'녹음의 도·미·레·솔을 악보 대응표로 바꿔 네 건반을 순서대로 누르라.',answer:'1325',flag:'tune',explain:'도=1, 미=3, 레=2, 솔=5. 피아노 서랍이 열리고 온실 열쇠가 드러난다.'},
 timeline:{title:'세 사건의 실제 순서',type:'choice',requires:['route','blackout','cart_time','recording_loop'],pair:['route','watch'],question:'실제 정전, 운반 승강기의 출발, 편집된 종소리 재생의 순서는?',options:[['power-lift-bell','23:40 정전 → 23:56 승강기 출발 → 00:13 녹음 종소리'],['bell-power-lift','00:13 종소리 → 23:40 정전 → 23:56 승강기 출발'],['lift-bell-power','23:56 승강기 출발 → 00:13 종소리 → 23:40 정전']],answer:'power-lift-bell',flag:'timeline',explain:'같은 밤을 자정 기준으로 끊지 말고 이어 읽는다. 정전·운반 시작·지연된 소리 연출은 다른 사건이다.'},
 exit_method:{title:'닫힌 방에서 사라진 경로',type:'choice',requires:['window_route','clock_method','route','lift'],pair:['seal','route'],question:'봉인을 깨지 않고, 실제로 확인된 구조와 운행 기록을 이용한 이동 경로는?',options:[['window','창문을 열고 외부로 나갔다'],['lift','실내 서비스 통로 → 운반용 승강기 → 서쪽 보존실'],['magic','정문으로 나간 뒤 독립 승강기 운행 기록만 조작했다']],answer:'lift',flag:'exit_method',explain:'창문 출입은 배제된다. 반면 서비스 통로와 승강기는 실재하고, 독립 제어기에도 서쪽 보존실로 향한 23:56 운행이 남아 있다.'},
 conclusion:{title:'단추의 마지막 추리',type:'choice',requires:['letter','timeline','exit_method','recording_loop','clock_method'],pair:['letter','route'],question:'물리적 흔적과 보정된 시각, 편지를 가장 적은 추가 가정으로 설명하는 사건의 전모는?',options:[['kidnap','다른 사람이 윤을 실내 카트로 강제로 옮긴 뒤 편지까지 위조했다'],['planned','윤이 작품을 보존실로 옮기기 위해 실종 시각을 연출하고 실내 운반로로 이동했다'],['allfake','윤은 00:13까지 방에 있었고, 앞선 23:56 운행은 사건과 무관했다']],answer:'planned',flag:'case_closed',explain:'가짜 정지 시각과 녹음 종소리가 시선을 붙잡는 동안 윤은 실내 운반로를 이용했다. 편지는 독립적인 흔적들과 일치한다. 보존실 문 너머에서 윤의 목소리가 들린다. “시간보다 흔적을 믿었구나, 단추.”'}
};
export const connections=Object.entries(puzzles).filter(([,p])=>p.type==='choice'||p.type==='code').map(([id,p])=>({id,pair:p.pair,title:p.title}));
export const useRules={
 bedroom_open:{room:'bedroom',item:'bedroom_key',requires:['blackout'],message:'열쇠가 돌아가며 천문실로 가는 안쪽 문이 열린다.'},
 workshop_open:{room:'workshop',item:'magnet_line',requires:['clock_method','tool_made'],message:'자석이 안쪽 철제 걸쇠를 끌어당긴다. 기록실로 이어지는 서비스 통로가 열린다.'},
 archive_open:{room:'archive',item:'music_card',requires:['archive_order'],message:'천공 카드가 맞물리며 음악실 잠금이 해제된다.'},
 music_open:{room:'music',item:'greenhouse_key',requires:['tune'],message:'옥상 온실 문이 열리고, 차가운 새벽 공기가 들어온다.'}
};

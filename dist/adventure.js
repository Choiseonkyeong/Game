// Six contemporary cities. World targets are furniture regions; discoveries live inside them.
export const roomList=[['seoul','서울 · 작은 숙소','출발의 한 장'],['tokyo','도쿄 · 필름 편집숍','처음 보는 골목'],['taipei','타이베이 · 비 오는 카페','잠시 머무는 법'],['bangkok','방콕 · 디자인 호스텔','낯선 빛의 방향'],['paris','파리 · 사진 작업실','흔적을 읽는 시간'],['lisbon','리스본 · 마지막 숙소','이어지는 여행책']];
export const tools={scope:['탁상 망원경',16],camera:['필름카메라',0],film:['새 필름',1],loaded:['필름을 넣은 카메라',0],key:['작은 은색 열쇠',3],cable:['충전 케이블',4],adapter:['여행용 어댑터',5],bank:['보조 배터리',6],pencil:['연필',7],mirror:['작은 손거울',8],clip:['종이 클립',9],cord:['면 끈',10],hook:['끈을 단 클립',11],map:['접힌 도시 지도',12],photo:['여행 사진',13],card:['교통 카드',14],cloth:['면 손수건',15],page:['완성한 여행책 한 장',13],note:['윤의 메모',12],ticket:['이동 예약 카드',14],stamp:['카페의 기념 카드',14]};
// x/y/w/h are percentages of the painted room, not arbitrary screen positions.
export const roomAreas=[
 {bed:[26,63,38,28],tote:[34,53,16,18],tin:[74.5,7.5,7,6],drawer:[88,49,16,7],desk:[80,42,30,12],jacket:[60,38,10,30],window:[41,24,30,37],suitcase:[90,65,12,20],door:[97,61,6,29],shelf:[79,13,37,22]},
 {bed:[21,65,30,20],tote:[37,61,10,26],tin:[56,23,9,14],drawer:[21,59,30,14],desk:[23,43,34,12],jacket:[65,27,8,29],window:[83,27,22,45],suitcase:[69,77,15,18],door:[80,52,11,38],shelf:[50,32,20,50]},
 {bed:[22,67,20,20],tote:[47,47,12,16],tin:[82,14,10,13],drawer:[79,43,15,10],desk:[32,45,20,8],jacket:[90,68,11,25],window:[17,24,28,40],suitcase:[49,78,15,17],door:[95,54,7,39],shelf:[79,17,28,22]},
 {bed:[23,45,32,23],tote:[32,43,11,17],tin:[54,52,7,7],drawer:[79,40,12,8],desk:[80,34,20,10],jacket:[96,55,9,16],window:[36,18,41,30],suitcase:[91,48,11,27],door:[97,34,6,35],shelf:[73,16,25,24]},
 {bed:[86,65,20,21],tote:[87,53,12,20],tin:[65,43,8,6],drawer:[57,57,22,16],desk:[56,42,42,12],jacket:[89,29,9,32],window:[18,28,23,51],suitcase:[85,79,14,16],door:[97,32,6,35],shelf:[58,11,49,14]},
 {bed:[53,57,24,20],tote:[53,46,12,17],tin:[87,42,7,6],drawer:[85,48,12,8],desk:[77,43,34,10],jacket:[95,25,8,31],window:[24,32,39,62],suitcase:[95,59,9,20],door:[31,50,18,29],shelf:[75,11,37,14]}
];
export const foregroundMasks=[
 'polygon(0% 40%,22% 40%,31% 47%,44% 49%,55% 59%,54% 71%,29% 93%,0% 85%)',
 'polygon(0% 50%,40% 46%,40% 77%,0% 95%)',
 'polygon(12% 47%,33% 46%,33% 76%,15% 84%)',
 'polygon(1% 40%,35% 36%,43% 48%,41% 60%,8% 70%,0% 62%)',
 'polygon(32% 46%,81% 46%,81% 68%,32% 69%)',
 'polygon(41% 45%,58% 43%,62% 53%,59% 65%,43% 67%)'
];
let ri=0;
const views={bed:[0,1,'이불을 옆으로 걷기'],tote:[2,3,'가방 안쪽 살펴보기'],tin:[4,5,'뚜껑 열기'],drawer:[6,7,'서랍 당겨 보기'],jacket:[8,9,'주머니 안 확인하기'],envelope:[10,11,'봉투 펼치기'],box:[12,13,'상자 끈 풀기'],map:[14,15,'접힌 부분 펼치기']};
function area(id,name,anchor,extra={}){const [x,y,w,h]=roomAreas[ri][anchor];return {id,name,x,y,w,h,anchor,...extra};}
function container(id,name,anchor,kind=anchor,extra={}){const v=views[kind]||views.drawer;return area(id,name,anchor,{container:true,view:v[0],openView:v[1],flag:id+'_open',verb:v[2],detail:'겉모습보다 안쪽과 접힌 부분을 살펴보자.',...extra});}
function hidden(item,parent,extra={}){const p=roomAreas[ri][parent.anchor||'desk'];return {id:item,name:tools[item][0],tool:item,x:p[0],y:p[1],w:8,h:8,inside:parent.id,need:[parent.flag],hide:[item+'_taken'],...extra};}
const tap=(target,set,msg,extra={})=>({action:'tap',target,set,msg,...extra});
const open=(o,msg='안쪽을 살펴봤어.')=>tap(o.id,o.flag,msg,{pose:6});
const take=(item,extra={})=>tap(item,item+'_taken',`${tools[item][0]}을 챙겼어.`,{grant:item,pose:0,...extra});
const use=(item,target,set,msg,extra={})=>({action:'use',item,target,set,msg,...extra});
const join=(a,b,out,set,msg)=>({action:'combine',items:[a,b],grant:out,set,msg,consume:[a,b]});
const finish=(target,msg,need=[])=>tap(target,'done',msg,{need,pose:0});
const code=(o,answer,need,msg)=>({action:'code',target:o.id,answer,need,set:'done',msg});
function lock(id,name,anchor,answer,requires,clue){return area(id,name,anchor,{pad:true,answer,requires,clue});}
const stages=[];function add(title,goal,story,objects,rules,hints){stages.push({id:stages.length+1,room:ri,title,goal,story,objects,rules,hints});}
// SEOUL — learn discovery, use, and combination through ordinary luggage.
{
const bed=container('blanket','침대의 이불','bed'),tin=container('tin','선반의 작은 틴','tin'),window=area('window','숙소 창밖','window');
add('출발의 한 장','첫 여행 사진을 찍어줘.','윤이 미완성 여행책을 맡겼어. 첫 장은 지금 이 방에서 시작해. 카메라는 짐 사이 어디에 두었더라?',[bed,{id:'camera_box',name:'카메라 보관함',anchor:'bed',x:30,y:66,w:10,h:8,inside:'blanket',need:['blanket_open'],pad:true,answer:'314',requires:[],clue:'',flag:'camera_box_open',special:'camera-box'},hidden('camera',{id:'camera_box',flag:'camera_box_open',anchor:'bed'}),tin,hidden('film',tin),window],[open(bed,'접힌 천 아래 보관함이 있어.'),{action:'code',target:'camera_box',answer:'314',set:'camera_box_open',msg:'보관함이 열렸어.'},take('camera'),open(tin,'평범한 틴 안에 새 필름을 따로 넣어 두었네.'),take('film'),join('camera','film','loaded','loaded','카메라 뒷판을 열어 필름을 끼우고 감았어.'),use('loaded','window','done','찰칵. 거창한 명소보다, 여행을 시작한 방의 빛을 첫 장에 남겼어.')],['이불 아래의 보관함과 베개 아래 작은 메모를 살펴봐.','블라인드를 끝까지 내리고 침대 옆 조명을 꺼 봐. 어둠 속에서 남는 흔적이 있어.','보관함의 카메라와 선반 틴의 필름을 조합해 창가에 사용해 봐.']);}
{
const d=container('drawer','책상 서랍','drawer'),b=container('tote','침대 위 가방','tote'),desk=area('phone','책상 위 휴대폰','desk',{detail:'충전기는 있지만 플러그 모양이 달라. 어댑터와 케이블이 모두 필요해.'});
add('꺼진 화면','예약 내용을 확인할 수 있게 휴대폰을 충전해줘.','첫 이동 예약은 휴대폰에 있어. 배터리는 꺼졌지만 필요한 건 이미 짐 안에 있을 거야.',[d,hidden('adapter',d),b,hidden('cable',b),desk],[open(d),take('adapter'),open(b),take('cable'),use('adapter','phone','adapted','어댑터가 콘센트에 맞았어.'),use('cable','phone','wired','케이블을 연결하자 충전 표시가 켜졌어.',{need:['adapted']}),finish('phone','예약 확인 완료. 다음 목적지는 도쿄의 작은 필름 편집숍이야.',['wired'])],['책상과 가방을 살펴보면 충전할 준비물이 있어.','어댑터를 먼저 연결한 뒤 케이블을 사용해.']);}
{
const j=container('jacket','걸어 둔 재킷','jacket'),d=container('drawer','책상 서랍','drawer'),book=area('book','책상 위 여행책','desk'),tower=area('tower','남산타워가 보이는 창','window');
add('사진 밖의 풍경','윤의 사진과 같은 풍경을 찾아 첫 장을 완성해줘.','사진만으론 이 방의 느낌을 다 기억할 수 없어. 윤이 남긴 메모와 함께 끼워 보자.',[j,hidden('photo',j),d,hidden('note',d),hidden('scope',d),tower,book],[open(j,'재킷 안주머니에 막 인화한 사진을 넣어 두었어.'),take('photo'),open(d,'서랍 안에서 윤의 메모를 찾았어.'),take('note'),take('scope'),use('scope','tower','scope_ready','창가에 망원경을 놓았어.',{consume:['scope']}),{action:'observe',target:'tower',set:'tower_seen',need:['scope_ready'],solution:{x:48.5,y:16,focus:75},msg:'사진 뒷면의 작은 탑은 창밖 남산타워였어.'},join('photo','note','page','page_ready','사진과 메모를 같은 페이지에 정리했어.'),use('page','book','done','윤의 사진과 같은 방향을 찾았어. 서울의 첫 장을 완성했어.',{need:['tower_seen'],consume:['page']})],['액자의 사진과 실제 창밖을 비교해 봐. 서랍에 작은 광학 도구가 있어.','망원경을 창가에 두고 남산타워에 초점을 맞춰 봐. 사진과 메모는 한 장으로 묶어줘.']);}
{
const j=container('jacket','재킷 주머니','jacket'),b=container('tote','가방 안쪽','tote'),gap=area('gap','침대 아래 좁은 틈','bed',{x:33,y:80,w:24,h:12,detail:'교통 카드 모서리가 보이지만 손이 닿지 않아. 구멍 난 카드 케이스의 고리를 걸 수 있겠어.'}),card={id:'card',name:tools.card[0],tool:'card',inside:'gap',x:25,y:73,w:8,h:8,need:['retrieved'],hide:['card_taken']},door=area('door','책상 위 휴대폰의 교통 카드 지갑','desk');
add('손이 닿지 않는 곳','침대 아래로 미끄러진 카드를 꺼내줘.','짐을 정리하다 카드가 침대 아래로 들어갔어. 침대를 억지로 옮기기보단 길게 걸 수 있는 걸 만들자.',[j,hidden('clip',j),b,hidden('cord',b),gap,card,door],[open(j),take('clip'),open(b),take('cord'),join('clip','cord','hook','hook_ready','클립 끝을 구부리고 끈을 묶었어.'),use('hook','gap','retrieved','카드 케이스의 고리를 걸어 천천히 끌어냈어.'),take('card'),use('card','door','done','휴대폰의 교통 카드 정보와 실물 카드를 함께 확인했어. 이제 나설 준비가 됐네.')],['클립은 고리, 끈은 길이를 만들어 줘.','재킷과 가방의 물건을 조합해 침대 틈에 사용해.']);}
{
const desk=area('reservation','책상 위 예약 메모','desk'),s=lock('suitcase','캐리어의 세 자리 잠금','suitcase','740',['read'],'출발 08:15. 숙소에서 출발지까지 35분. 늦어도 몇 시에 나가야 할까? 시:분에서 앞의 0을 뺀 세 자리.');
add('출발 시간','짐 잠금을 풀고 도쿄로 출발해줘.','캐리어 번호를 출발 시각에 맞췄대. 예약 메모를 읽고 늦지 않게 나가자.',[desk,s],[tap('reservation','read','예약 메모: 08:15 출발, 이동 35분. 숙소를 나갈 시각은?',{reveal:'08:15 − 35분'}),code(s,'740',['read'],'07:40. 짐을 챙겨 나왔어. 도쿄에서 다음 장을 만나자.')],['예약 메모를 먼저 읽어줘.','08:15에서 35분을 빼면 07:40이야.']);}
ri=1;
{
const b=container('tote','카운터 옆 가방','tote'),d=container('drawer','카운터의 얕은 서랍','drawer'),win=area('window','가게 앞 골목','window');
add('유리 너머 골목','흐릿한 렌즈를 정리하고 골목을 찍어줘.','도쿄의 첫 목적지는 작은 필름숍. 렌즈에 묻은 지문 때문에 사진이 뿌옇게 나와.',[b,hidden('loaded',b),d,hidden('cloth',d),win],[open(b),take('loaded'),open(d),take('cloth'),join('loaded','cloth','camera','cleaned','손수건으로 렌즈의 지문을 조심스럽게 닦았어.'),use('camera','window','done','골목의 자전거와 빛이 선명해졌어. 두 번째 도시의 첫 사진이야.')],['필름보다 렌즈 표면이 문제인 것 같아.','가방의 카메라와 서랍의 손수건을 함께 써 봐.']);}
{
const desk=area('map','카운터 위 접힌 지도','desk',{container:true,view:14,openView:15,flag:'map_open',verb:'지도를 펼치기'}),b=container('tote','가방 안쪽','tote'),sign=lock('route','지도 아래 경로 메모','shelf','231',['read','map_open'],'지도 범례: 카페② → 필름숍③ → 역①. 메모의 방문 순서는 카페, 필름숍, 역.');
add('가까운 길보다 좋은 길','메모에 적힌 방문 순서를 찾아줘.','윤은 지름길 대신 좋아하던 세 장소를 이어 걸었어. 같은 순서로 길을 표시해 보자.',[desk,b,hidden('note',b),sign],[open(desk,'접힌 안쪽에 장소 번호가 있었어. 카페②, 필름숍③, 역①.'),open(b),take('note'),use('note','map','read','메모의 순서는 카페 → 필름숍 → 역이야.',{reveal:'카페 → 필름숍 → 역'}),code(sign,'231',['read','map_open'],'②③①. 윤이 걷던 골목길을 이어 찾았어.')],['접힌 지도 안쪽과 가방의 메모를 함께 봐.','장소 번호를 방문 순서대로 적으면 돼.']);}
{
const d=container('drawer','문구 서랍','drawer'),tin=container('tin','선반의 필름 틴','tin'),paper=area('paper','카운터의 눌린 종이','desk');
add('지워진 가게 이름','종이에 남은 눌린 자국을 읽어줘.','메모 위의 글씨는 지워졌지만 아래 종이에는 자국이 남아 있어.',[d,hidden('pencil',d),tin,hidden('cloth',tin),paper],[open(d),take('pencil'),open(tin),take('cloth'),use('cloth','paper','dry','젖은 부분을 눌러 종이를 말렸어.'),use('pencil','paper','done','연필을 눕혀 가볍게 문지르자 가게의 작은 지도와 “비 오는 카페”라는 메모가 드러났어.',{need:['dry']})],['젖은 종이에 바로 문지르면 찢어질 수 있어.','손수건으로 먼저 눌러 말린 뒤 연필을 사용해.']);}
{
const j=container('jacket','걸어 둔 재킷','jacket'),d=container('drawer','잠긴 카운터 서랍','drawer','drawer',{detail:'열쇠 구멍이 있는 얕은 서랍이야.'}),book=area('book','카운터의 여행책','desk');d.flag='unlocked';
add('익숙한 물건의 안쪽','사진 봉투를 찾아 여행책에 끼워줘.','가게 주인이 윤의 사진을 보관해 뒀대. 작은 열쇠가 든 재킷도 함께 맡겨 놓았어.',[j,hidden('key',j),d,hidden('photo',d),book],[open(j),take('key'),use('key','drawer','unlocked','서랍이 열렸어. 안쪽에 사진 봉투가 있어.',{consume:['key']}),take('photo'),use('photo','book','done','도쿄의 사진을 여행책에 끼웠어. 윤이 좋아했던 건 명소보다 이 작은 가게였구나.',{consume:['photo']})],['보관 물건은 재킷 주머니와 서랍을 함께 살펴봐.','열쇠로 서랍을 열면 사진 봉투를 찾을 수 있어.']);}
{
const tin=container('tin','선반의 작은 틴','tin'),b=container('tote','출발 가방','tote'),desk=area('phone','카운터 충전 자리','desk'),door=area('exit','가게 출입문','door');
add('다음 장의 주소','휴대폰에 다음 도시의 주소를 띄워줘.','비 오는 카페의 주소는 휴대폰에 저장돼 있어. 이동 전에 배터리를 조금 채워 두자.',[tin,hidden('bank',tin),b,hidden('cable',b),desk,door],[open(tin),take('bank'),open(b),take('cable'),use('bank','phone','power','보조 배터리를 옆에 놓았어.'),use('cable','phone','charged','케이블을 연결했어. 다음 주소는 타이베이야.',{need:['power']}),finish('exit','필름숍을 나와 다음 도시로 향했어.',['charged'])],['틈새 시간을 이용해 충전해 두자.','보조 배터리와 케이블을 모두 연결한 뒤 출입문으로 나가.']);}
ri=2;
{
const box=container('box','테이블의 페이스트리 상자','desk','box'),b=container('tote','의자 위 가방','tote'),win=area('window','빗방울 맺힌 창','window');
add('비를 남기는 사진','반사광을 줄여 창밖의 비를 찍어줘.','타이베이의 카페. 창에 실내 조명이 비쳐 거리 대신 내 모습만 보여.',[box,hidden('cloth',box),b,hidden('loaded',b),win],[open(box),take('cloth'),open(b),take('loaded'),use('cloth','window','shaded','렌즈 주변을 손수건으로 가려 실내 반사를 줄였어.'),use('loaded','window','done','젖은 골목의 작은 불빛이 사진에 남았어.',{need:['shaded']})],['유리 밖을 닦을 수는 없어. 실내 빛이 비치는 걸 막아 보자.','손수건을 창가에 사용한 뒤 카메라로 찍어.']);}
{
const box=container('box','테이블의 종이 상자','desk','box'),tin=container('tin','카운터 선반의 틴','tin'),receipt=lock('receipt','영수증 뒤의 메모','drawer','425',['box_open','tin_open'],'영수증의 차②, 커피⑤, 케이크④. 주문한 순서는 케이크 → 차 → 커피.');
add('주문 뒤에 남은 숫자','윤의 주문 순서로 메모를 읽어줘.','가게는 윤이 자주 앉던 자리를 기억해. 남겨 둔 영수증과 작은 주문 메모를 함께 보자.',[box,tin,receipt],[open(box,'상자 속 메모: 케이크, 차, 커피 순서로 주문했대.'),open(tin,'틴 안의 영수증: 차②, 커피⑤, 케이크④.'),code(receipt,'425',['box_open','tin_open'],'④②⑤. 메모 안쪽에 다음 만남의 시간이 적혀 있었어.')],['메모는 순서, 영수증은 번호를 알려 줘.','케이크④ → 차② → 커피⑤야.']);}
{
const b=container('tote','의자 위 가방','tote'),d=container('drawer','카운터 서랍','drawer'),leg=area('gap','의자 뒤 좁은 틈','bed',{detail:'사진 케이스의 작은 고리가 의자 뒤에 걸려 있어.'}),photo={id:'photo',name:tools.photo[0],tool:'photo',inside:'gap',x:29,y:69,w:8,h:8,need:['retrieved'],hide:['photo_taken']},book=area('book','테이블의 여행책','desk');
add('의자 뒤의 한 장','미끄러진 사진을 구기지 않고 꺼내줘.','카페 의자 뒤로 사진 케이스가 들어갔어. 손을 억지로 넣으면 사진이 접힐 것 같아.',[b,hidden('cord',b),d,hidden('clip',d),leg,photo,book],[open(b),take('cord'),open(d),take('clip'),join('cord','clip','hook','hook_ready','클립 고리에 끈을 묶었어.'),use('hook','gap','retrieved','고리를 걸어 사진 케이스를 끌어냈어.'),take('photo'),use('photo','book','done','구겨지지 않은 사진을 여행책에 넣었어.',{consume:['photo']})],['사진 자체 대신 케이스의 고리를 걸어 봐.','클립과 끈을 조합하면 손이 닿지 않는 곳도 꺼낼 수 있어.']);}
{
const tin=container('tin','선반의 틴','tin'),paper=area('paper','테이블의 얼룩진 메모','desk'),box=container('box','테이블의 종이 상자','desk','box');
add('젖은 메모','잉크가 번지기 전에 메모를 읽어줘.','음료가 조금 쏟아졌어. 문지르면 글씨가 더 번질 수 있어.',[tin,hidden('cloth',tin),paper,box,hidden('note',box)],[open(tin),take('cloth'),use('cloth','paper','dry','문지르지 않고 눌러 물기를 흡수했어.'),open(box,'빈 상자에 마른 메모를 옮겨 두었어.'),take('note',{need:['dry']}),use('note','paper','done','메모를 펼쳐 읽었어. “서두르지 않아도 여행은 계속된다.”',{need:['dry']})],['먼저 손수건으로 물기를 눌러 흡수하자.','마른 메모를 챙긴 뒤 테이블에서 펼쳐 봐.']);}
{
const b=container('tote','의자 위 가방','tote'),box=container('box','마지막 간식 상자','desk','box'),book=area('book','여행책','drawer'),door=area('exit','카페 문','door');
add('머물렀던 자리','카페의 기억을 한 장으로 정리하고 출발해줘.','주인은 작은 기념 카드를 건넸어. 방콕행 이동 전에 이곳의 사진과 함께 챙기자.',[b,hidden('photo',b),box,hidden('stamp',box),book,door],[open(b),take('photo'),open(box),take('stamp'),join('photo','stamp','page','page_ready','사진 뒤에 카페의 기념 카드를 함께 꽂았어.'),use('page','book','packed','비 오는 카페의 한 장이 완성됐어.',{consume:['page']}),finish('exit','비가 잦아들었어. 다음 장은 방콕의 오후야.',['packed'])],['가방의 사진과 종이 상자의 기념 카드를 모아 봐.','조합한 페이지를 여행책에 넣고 나가면 돼.']);}
ri=3;
{
const b=container('tote','소파 위 가방','tote'),d=container('drawer','충전 책상 서랍','drawer'),desk=area('socket','벽면 충전 자리','desk');
add('같은 구멍, 다른 모양','맞는 연결을 만들어 휴대폰 충전기를 켜줘.','방콕의 호스텔. 익숙한 충전기라도 플러그 모양부터 확인해야 해.',[b,hidden('adapter',b),d,hidden('cable',d),desk],[open(b),take('adapter'),open(d),take('cable'),use('adapter','socket','fit','어댑터가 콘센트에 맞았어.'),use('cable','socket','done','케이블을 연결하자 충전 표시가 켜졌어.',{need:['fit']})],['충전선만으로 플러그 모양은 바뀌지 않아.','어댑터를 먼저, 케이블을 다음에 사용해.']);}
{
const tin=container('tin','커피 테이블의 작은 틴','tin'),b=container('tote','소파의 가방','tote'),shelf=area('paper','선반 뒤의 작은 글씨','shelf',{detail:'글씨가 정면에서 보이지 않고 거꾸로 비쳐. 손거울이라면 각도를 바꿀 수 있겠어.'}),lockbox=lock('code','책상 메모의 번호','drawer','527',['read'],'거울로 읽은 세 자리: 5 · 2 · 7.');
add('보이는 방향을 바꾸면','가구를 옮기지 않고 뒤쪽의 번호를 읽어줘.','선반 뒤에 윤이 적어 둔 메모가 있어. 무거운 선반을 당기기보단 보는 방향을 바꿔 보자.',[tin,hidden('mirror',tin),b,hidden('cloth',b),shelf,lockbox],[open(tin),take('mirror'),open(b),take('cloth'),use('cloth','paper','clean','먼지를 털어 글씨 윤곽이 드러났어.'),use('mirror','paper','read','거울 각도를 바꾸니 5 · 2 · 7이 읽혀.',{need:['clean'],reveal:'5 · 2 · 7'}),code(lockbox,'527',['read'],'선반을 옮기지 않고 필요한 메모를 확인했어.')],['각도를 바꾸는 작은 거울이 도움이 될 것 같아.','먼지를 먼저 털고 거울을 사용해.']);}
{
const bed=container('cushion','소파의 쿠션','bed','bed'),d=container('drawer','책상 서랍','drawer'),table=area('table','바람 부는 테이블','tin');
add('바람과 페이지','날아가는 지도를 고정하고 경로를 확인해줘.','창에서 불어오는 바람이 지도를 계속 접어 버려. 끈과 클립으로 책상 모서리에 고정하자.',[bed,hidden('map',bed),d,hidden('clip',d),table],[open(bed,'쿠션 뒤에 접힌 지도가 끼어 있었어.'),take('map'),open(d),take('clip'),use('clip','table','held','테이블 모서리에 클립을 걸어 받침을 만들었어.'),use('map','table','done','지도를 클립 아래 끼우자 바람에도 펼쳐져 있어. 동쪽 골목의 촬영 장소를 찾았어.',{need:['held']})],['바람을 없앨 수 없다면 종이를 고정해 보자.','클립을 테이블에 놓고 지도를 끼워줘.']);}
{
const j=container('jacket','문 옆 작은 가방','jacket','tote'),b=container('tote','소파의 가방','tote'),win=area('window','발코니 쪽 창','window');
add('너무 강한 오후','강한 반사광을 가리고 한 장을 찍어줘.','오후 빛이 렌즈에 곧장 들어와. 카메라가 고장 난 게 아니라 빛의 각도 때문이야.',[j,hidden('cloth',j),b,hidden('loaded',b),win],[open(j),take('cloth'),open(b),take('loaded'),use('cloth','window','shaded','손수건으로 렌즈 위에 작은 그늘을 만들었어.'),use('loaded','window','done','눈부심이 줄어 골목의 그늘과 빛이 함께 남았어.',{need:['shaded']})],['빛 자체를 없애기보다 렌즈에 직접 들어오는 빛을 가려 봐.','손수건으로 그늘을 만든 뒤 카메라를 사용해.']);}
{
const tin=container('tin','테이블의 작은 틴','tin'),b=container('tote','소파의 가방','tote'),book=area('book','테이블의 여행책','desk'),door=area('exit','호스텔 출입문','door');
add('빛의 메모','방콕의 사진과 메모를 정리해줘.','같은 곳도 빛의 방향에 따라 달랐어. 사진 옆에 배운 것을 짧게 남기자.',[tin,hidden('note',tin),b,hidden('photo',b),book,door],[open(tin),take('note'),open(b),take('photo'),join('photo','note','page','page_ready','사진과 빛의 방향 메모를 한 장에 정리했어.'),use('page','book','packed','방콕의 장이 완성됐어.',{consume:['page']}),finish('exit','다음은 파리의 사진 작업실. 오래된 필름을 함께 확인할 거야.',['packed'])],['사진과 메모를 각각 찾아 모아 봐.','한 장으로 조합해 여행책에 넣고 출발해.']);}
ri=4;
{
const b=container('tote','작업 의자의 가방','tote'),d=container('drawer','얕은 인화 서랍','drawer'),box=area('lightbox','테이블의 라이트박스','desk');
add('빛에 비춰 보는 기억','필름의 먼지를 정리하고 빛에 비춰줘.','파리의 작은 작업실. 윤이 맡겨 둔 필름이 있지만 맨손으로 문지르면 흠집이 날 수 있어.',[b,hidden('film',b),d,hidden('cloth',d),box],[open(b),take('film'),open(d),take('cloth'),use('cloth','lightbox','clean','필름 대신 라이트박스의 유리부터 닦았어.'),use('film','lightbox','done','필름을 가장자리로 잡아 빛에 올렸어. 도시 사이에 이어지는 같은 작은 표식이 보여.',{need:['clean']})],['민감한 필름을 직접 문지르지 말자.','라이트박스 유리를 먼저 닦고 필름을 올려.']);}
{
const tin=container('tin','작업대의 필름 틴','tin'),paper=area('paper','작업대 메모','desk'),d=lock('drawer','인화 서랍 번호','drawer','314',['read'],'사진 뒤의 표식 순서: 삼각형③ → 선① → 사각형④.');
add('모양이 먼저, 숫자는 나중','사진 뒤 표식의 순서로 서랍을 열어줘.','사진마다 뒷면에 작은 모양이 있어. 모양을 읽는 순서는 메모에 적혀 있대.',[tin,hidden('photo',tin),paper,d],[open(tin),take('photo'),tap('paper','order','메모: 삼각형 → 선 → 사각형 순서로.'),use('photo','paper','read','사진 뒤에 삼각형③, 선①, 사각형④가 있어.',{need:['order'],reveal:'△ ③ → | ① → □ ④'}),code(d,'314',['read'],'인화 서랍에 윤이 처음 찍었던 리스본 사진이 보관돼 있었어.')],['숫자 크기가 아니라 모양의 순서를 따라가야 해.','메모 순서대로 번호를 옮기면 314야.']);}
{
const j=container('jacket','벽의 재킷','jacket'),b=container('tote','작업 가방','tote'),desk=area('paper','작업대의 눌린 종이','desk');
add('남겨진 압력','사진 아래 남은 주소 자국을 읽어줘.','주소를 적었던 원본은 없어졌지만 아래 종이는 남았어.',[j,hidden('pencil',j),b,hidden('mirror',b),desk],[open(j),take('pencil'),open(b),take('mirror'),use('mirror','paper','angled','창빛을 비스듬히 돌려 눌린 자국의 위치를 확인했어.'),use('pencil','paper','done','연필을 눕혀 가볍게 문지르자 리스본 숙소의 주소가 드러났어.',{need:['angled']})],['빛을 비스듬히 비추면 눌린 자국의 그림자가 보여.','거울로 자국을 확인한 뒤 연필을 사용해.']);}
{
const b=container('tote','작업 의자의 가방','tote'),d=container('drawer','작업대 서랍','drawer'),sleeve=area('sleeve','테이블의 사진 보관 봉투','desk');
add('접지 않고 보내는 법','사진과 필름을 나눠 보관해줘.','인화 사진과 원본 필름을 같은 주머니에 밀어 넣으면 긁힐 수 있어. 가방 속 칸을 나눠 두자.',[b,hidden('photo',b),d,hidden('film',d),sleeve],[open(b),take('photo'),open(d),take('film'),use('photo','sleeve','photos','인화 사진은 넓은 종이 봉투에 넣었어.',{consume:['photo']}),use('film','sleeve','done','필름은 별도 안쪽 포켓에 넣었어. 다음 도시까지 안전하게 가져갈 수 있어.',{need:['photos'],consume:['film']})],['크고 평평한 사진부터 넓은 칸에 넣자.','사진을 먼저, 필름을 다음에 봉투에 사용해.']);}
{
const tin=container('tin','작업대 틴','tin'),b=container('tote','여행 가방','tote'),book=area('book','작업대 여행책','desk'),door=area('exit','작업실 출입문','door');
add('사진의 바깥 이야기','파리의 한 장을 완성하고 마지막 도시로 가줘.','사진을 복원하는 동안 생긴 이야기도 여행의 일부였어. 마지막 주소가 기다려.',[tin,hidden('note',tin),b,hidden('photo',b),book,door],[open(tin),take('note'),open(b),take('photo'),join('photo','note','page','page_ready','복원한 사진과 작업실 메모를 정리했어.'),use('page','book','packed','파리의 한 장을 끼웠어.',{consume:['page']}),finish('exit','마지막 목적지는 리스본. 여행책의 빈 마지막 장을 만나러 가자.',['packed'])],['두 곳에 나눠 둔 사진과 메모를 모아 봐.','완성한 페이지를 여행책에 넣고 나가면 돼.']);}
ri=5;
{
const b=container('tote','의자 위 가방','tote'),tin=container('tin','책상 위 틴','tin'),window=area('window','지붕들이 보이는 발코니','window');
add('처음의 빛을 다시','마지막 도시의 첫 사진을 찍어줘.','리스본의 숙소에 도착했어. 윤의 첫 여행 사진도 이 창에서 찍었대.',[b,hidden('camera',b),tin,hidden('film',tin),window],[open(b),take('camera'),open(tin),take('film'),join('camera','film','loaded','loaded','마지막 필름을 끼웠어.'),use('loaded','window','done','첫 방에서 익힌 손길로 마지막 도시의 빛을 찍었어.')],['가방의 카메라와 책상 틴의 필름을 찾아봐.','조합한 카메라를 발코니 풍경에 사용해.']);}
{
const j=container('jacket','걸린 재킷','jacket'),d=container('drawer','닫힌 책상 서랍','drawer');d.flag='unlocked';const desk=area('book','책상 위 여행책','desk');
add('마지막 봉투','윤이 남긴 마지막 봉투를 열어줘.','마지막 메모는 잠긴 서랍에 있어. 재킷은 윤이 걸어 둔 그대로 남아 있네.',[j,hidden('key',j),d,hidden('note',d),desk],[open(j),take('key'),use('key','drawer','unlocked','서랍을 열자 봉투 한 장이 있었어.',{consume:['key']}),take('note'),use('note','book','done','“네가 지나온 곳들로 이 책을 완성해 줘. 내 여행을 따라 할 필요는 없어.”',{consume:['note']})],['재킷 주머니의 작은 금속 끝을 살펴보자.','열쇠로 서랍을 열어 메모를 여행책 옆에서 읽어.']);}
{
const desk=area('notes','책상 위 여섯 도시 메모','desk'),s=lock('suitcase','사진 보관 케이스','suitcase','631',['read'],'메모: 서울①, 도쿄②, 타이베이③, 방콕④, 파리⑤, 리스본⑥. 케이스의 표식 순서: 마지막 도시 → 세 번째 도시 → 출발 도시.');
add('길을 되짚는 순서','세 도시의 순서로 사진 케이스를 열어줘.','사진을 찍은 순서가 케이스의 암호가 됐어. 지도보다 우리가 지나온 길을 떠올려 보자.',[desk,s],[tap('notes','read','도시 순서: 서울① → 도쿄② → 타이베이③ → 방콕④ → 파리⑤ → 리스본⑥.',{reveal:'마지막 → 세 번째 → 출발'}),code(s,'631',['read'],'리스본⑥, 타이베이③, 서울①. 서로 다른 도시의 사진이 한 케이스에 모였어.')],['케이스가 묻는 건 실제 이동 순서 속 위치야.','마지막⑥, 세 번째③, 출발①이야.']);}
{
const b=container('tote','의자 위 여행 가방','tote'),tin=container('tin','책상 위 작은 틴','tin'),book=area('book','펼쳐 둔 여행책','desk');
add('비어 있던 마지막 장','마지막 사진과 새 메모를 여행책에 넣어줘.','윤의 책을 채웠지만 단추 자신의 이야기도 필요해. 가장 기억하고 싶은 순간을 남겨 보자.',[b,hidden('photo',b),tin,hidden('note',tin),book],[open(b),take('photo'),open(tin),take('note'),join('photo','note','page','page_ready','사진 옆에 나의 메모를 함께 놓았어.'),use('page','book','done','“좋은 여행은 유명한 곳의 개수보다, 자세히 본 순간으로 남는다.” 마지막 장을 채웠어.',{consume:['page']})],['가방의 사진과 틴에 넣어 둔 메모가 마지막 재료야.','조합한 한 장을 펼친 여행책에 끼워줘.']);}
{
const d=container('drawer','책상 서랍','drawer'),b=container('tote','여행 가방','tote'),desk=area('book','완성한 여행책','desk'),window=area('window','숙소 발코니','window');
add('다음 여행의 여백','완성한 책을 묶고 마지막 풍경을 바라봐줘.','서울에서 시작한 빈 책이 여섯 도시의 기억으로 채워졌어. 다 채우지 않은 여백도 조금 남겨 두자.',[d,hidden('cord',d),b,hidden('photo',b),desk,window],[open(d),take('cord'),open(b),take('photo'),use('photo','book','cover','마지막 사진을 책의 표지 안쪽에 끼웠어.',{consume:['photo']}),use('cord','book','bound','면 끈으로 책을 묶었어. 물건을 찾던 여행이, 기억을 모은 여행이 됐네.',{need:['cover'],consume:['cord']}),finish('window','나의 첫 여행책 완성. 다음 여행의 첫 장은 아직 비워 두었어.',['bound'])],['마지막 사진을 끼운 뒤 끈으로 책을 묶어 봐.','책을 정리했으면 발코니의 풍경을 바라봐.']);}
export {stages};

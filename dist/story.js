// One familiar room, one clear journey. Each episode asks the player to combine what is lying around.
export const chapters=[
 {title:'침대 아래에서',range:'01—06',description:'잠에서 깬 단추. 별 조명은 어디로 갔을까?',view:'room'},
 {title:'장난감 사이로',range:'07—12',description:'별 조각을 따라 장난감 사이를 지나가요.',view:'toys'},
 {title:'바닥 위 작은 여행',range:'13—18',description:'작은 물건도 단추에게는 훌륭한 도구예요.',view:'floor'},
 {title:'창가의 소동',range:'19—24',description:'달빛 아래, 마지막 별 조각이 가까워졌어요.',view:'window'},
 {title:'다시, 포근한 침대',range:'25—30',description:'모은 조각으로 별 조명을 다시 켤 시간이에요.',view:'bed'}
];
// Props are drawn in a square viewBox, so small flat boxes are squared up (centered) to keep items readable.
const o=(id,type,label,x,y,w=85,h=85,extra={})=>{const n=Math.max(w,h);if(w!==h&&n<=130){x=Math.max(0,Math.min(400-n,x-(n-w)/2));y=Math.max(0,Math.min(555-n,y-(n-h)/2));w=h=n;}return {id,type,label,x,y,w,h,...extra};};
// extra on a rule: heroTo (단추 이동), wear (단추가 착용), keep (옮긴 뒤에도 남음)
const move=(item,target,hint,done,extra={})=>({kind:'move',item,target,hint,done,...extra});
const shift=(item,hint,done)=>({kind:'shift',item,hint,done});
const tap=(item,hint,done,count=1)=>({kind:'tap',item,count,hint,done});
const all=(parts,hint,done)=>({kind:'all',parts,hint,done});
const L=(title,goal,objects,steps,extra={})=>({title,goal,objects,steps,...extra});
export const levels=[
 // 1 — 침대 아래에서
 L('조금 쌀쌀한 밤','단추를 따뜻하게 해 주세요.',[
 o('sock','sock','커다란 털양말',18,395,100,100),o('fan','fan','장난감 선풍기',282,285,95,115),o('milk','cup','차가운 우유',290,440,75,75)
 ],[move('sock','hero','털양말을 단추에게 끌어다 주세요. 쏙 들어갈 크기예요!','털양말 침낭 완성! 이제 별 조명을 찾으러 가 볼까?',{wear:'body'})],
 {mood:'cold',tutorial:'drag',tutorialText:'털양말을 끌어 단추에게 가져다 주세요.',fail:{'fan>hero':'으슬으슬… 바람은 더 추워요!','milk>hero':'차가운 우유는 지금 말고요.',fan:'윙~ 더 추워졌어요!'}}),
 L('깜깜한 침대 밑','손전등을 켜 주세요.',[
 o('flashlight','flashlight','건전지 없는 손전등',265,410,115,75),o('remote','remote','장난감 리모컨',28,400,70,105),o('battery','battery','건전지 두 개',30,420,65,60,{after:1})
 ],[tap('remote','리모컨 뒤쪽 뚜껑을 톡 열어 보세요.','달칵! 리모컨 속에 건전지가 있어요.'),move('battery','flashlight','건전지를 손전등에 넣어요.','딸깍! 침대 밑이 환해졌어요.')],
 {dim:true,tutorial:'tap',tutorialText:'리모컨을 톡 눌러 보세요.',fail:{flashlight:'딸깍… 건전지가 없나 봐요.'}}),
 L('너무 무거운 쿠션','쿠션 밑의 별 조각을 꺼내요.',[
 o('pillow','leverPillow','무거운 쿠션',232,345,145,125,{until:3}),o('eraser','eraser','네모 지우개',20,440,90,60),o('pencil','pencil','긴 연필',10,300,120,55),
 o('pillowUp','pillow','들린 쿠션',270,250,110,95,{after:3}),o('star','star','별 조각',272,405,60,60,{after:3})
 ],[move('eraser','pillow','지우개를 쿠션 앞에 받침으로 놓아 봐요.','받침 준비 완료!'),move('pencil','pillow','연필을 지우개 위에 걸쳐 쿠션 밑에 끼워요.','지렛대 완성!'),tap('pillow','연필 끝을 꾹! 쿠션을 눌러 보세요.','번쩍! 쿠션이 들렸어요.'),tap('star','별 조각을 주워요.','첫 번째 별 조각을 찾았어요!')],
 {fail:{'hero>pillow':'영차… 단추 혼자서는 꿈쩍도 안 해요.',pillow:'끙… 너무 무거워요. 도구가 필요해요.','pencil>hero':'연필은 무기가 아니에요!'}}),
 L('침대 위의 별 조각','사다리를 만들어 올라가요.',[
 o('rails','rails','침대에 기댄 젓가락 두 짝',262,150,115,300,{stretch:true}),o('crayonA','crayon','빨간 크레파스',10,360,100,40),o('crayonB','crayonBlue','파란 크레파스',20,440,100,40),o('crayonC','crayonGreen','초록 크레파스',130,480,100,40),
 o('candy','candy','끈적한 사탕',20,320,70,55),o('star','star','침대 위 별 조각',318,80,70,70)
 ],[all([move('crayonA','rails','','한 칸!'),move('crayonB','rails','','두 칸!'),move('crayonC','rails','','세 칸!')],'크레파스를 젓가락 사이에 하나씩 끼워 발판을 만들어요.','크레파스 사다리 완성!'),move('hero','star','단추를 침대 위 별 쪽으로 옮겨요.','영차영차! 침대 위에 도착!',{heroTo:'star'}),tap('star','별 조각을 주워요.','두 번째 별 조각!')],
 {fail:{'candy>rails':'끈적끈적… 발판으로 쓰면 미끄러져요.','hero>star':'너무 높아요! 밟고 올라갈 게 필요해요.','hero>rails':'아직 발판이 없어요.',star:'손이 안 닿아요.'}}),
 L('꽃병에 빠진 열쇠','꽃병 속 열쇠를 꺼내요.',[
 o('vase','vase','물이 반쯤 찬 좁은 꽃병',248,295,140,175,{stretch:true}),o('marbles','marbles','유리구슬 주머니',20,430,90,80),o('straw','straw','짧은 빨대',30,300,45,110),
 o('door','door','잠긴 장난감 문',140,110,92,140),o('key','key','코르크 열쇠고리',272,250,80,55,{after:1})
 ],[move('marbles','vase','구슬을 넣으면 물이 어떻게 될까요?','퐁퐁퐁! 물이 차올라 열쇠가 둥실 떠올랐어요.'),move('key','door','열쇠를 문에 넣어요.','찰칵! 문이 열렸어요.')],
 {fail:{'straw>vase':'빨대가 너무 짧아요.','hero>vase':'손이 안 닿아요. 물을 올라오게 할 수 없을까?',door:'잠겨 있어요. 열쇠는 꽃병 속에!'}}),
 L('높은 선반 위','풍선을 타고 선반에 올라요.',[
 o('balloon','balloon','둥실 뜬 헬륨 풍선',275,300,95,165),o('yarn','yarn','털실 뭉치',22,430,80,75),o('pin','pin','장난감 핀',30,320,75,70),
 o('star','star','선반 위 별 조각',300,70,70,70)
 ],[move('yarn','balloon','풍선에 털실을 묶어 줄을 만들어요.','풍선 줄 완성!'),move('balloon','hero','풍선 줄을 단추에게 쥐여 줘요.','둥실~ 단추가 떠올라요!',{heroTo:'star',wear:'up'}),tap('star','별 조각을 잡아요.','세 번째 별 조각!')],
 {fail:{'pin>balloon':'펑! 하면 안 돼요. 꾹 참아요.','balloon>hero':'줄이 없어서 잡을 수가 없어요.',star:'너무 높아요.'}}),
 // 7 — 장난감 사이로
 L('잠 안 자는 경비 곰','곰을 재우고 지나가요.',[
 o('bear','bearAwake','눈 뜬 경비 곰',258,285,120,155,{until:2}),o('sleepy','bear','꾸벅꾸벅 곰',258,285,120,155,{after:2}),
 o('musicbox','musicbox','태엽이 빠진 오르골',20,410,100,90),o('windkey','windkey','작은 태엽',300,455,60,55),o('drum','drum','장난감 북',25,300,85,80),
 o('door','door','곰 뒤의 문',290,120,80,125)
 ],[move('windkey','musicbox','태엽을 오르골에 끼워요.','쏙! 딱 맞아요.'),tap('musicbox','오르골을 톡 눌러 틀어요.','딩동댕~ 자장가에 곰이 꾸벅꾸벅…'),move('hero','door','살금살금, 단추를 문으로 옮겨요.','통과! 쉿, 잘 자 곰아.',{heroTo:'door'})],
 {fail:{drum:'둥둥! 곰이 더 말똥말똥해졌어요.','hero>door':'곰이 “어딜 가!” 하고 막아요.',musicbox:'태엽이 없어서 안 돌아가요.'}}),
 L('어항 속 별 조각','자석 낚싯대를 만들어요.',[
 o('fishbowl','fishbowl','물이 가득한 어항',255,300,125,130),o('pencil','rod','긴 연필',18,300,115,90),o('yarn','yarn','털실',30,420,75,70),o('magnet','magnet','말굽 자석',290,455,70,60),
 o('star','starMetal','쇠 별 조각',275,240,55,55,{after:2})
 ],[all([move('yarn','pencil','','연필 끝에 털실을 묶었어요.'),move('magnet','pencil','','털실 끝에 자석을 달았어요.')],'연필에 털실과 자석을 달아 낚싯대를 만들어요.','자석 낚싯대 완성!'),move('pencil','fishbowl','낚싯대를 어항에 드리워요.','철컥! 쇠 별 조각이 자석에 붙어 올라왔어요.'),tap('star','별 조각을 떼어 내요.','네 번째 별 조각!')],
 {fail:{'hero>fishbowl':'단추는 솜인형이라 물에 젖으면 큰일!','magnet>fishbowl':'자석만 넣으면 건질 수가 없어요.','yarn>fishbowl':'실만으로는 별이 안 걸려요.'}}),
 L('종이배 대항해','웅덩이를 건너가요.',[
 o('paper','paper','종이 한 장',20,415,95,80,{until:1}),o('boat','boat','종이배',20,420,100,75,{after:1}),
 o('puddle','puddle','넓은 물웅덩이',215,405,165,95),o('fan','fan','장난감 선풍기',290,270,85,110)
 ],[tap('paper','종이를 두 번 톡톡 눌러 접어요.','종이배 완성!',2),move('boat','puddle','종이배를 웅덩이에 띄워요.','둥실! 잘 떠요.'),move('hero','puddle','단추를 배에 태워요.','올라탔어요! 그런데 배가 안 움직여요.',{heroTo:'puddle'}),move('fan','puddle','선풍기 바람을 돛에 보내요.','슝~ 바람 돛단배로 건넜어요!')],
 {fail:{'hero>puddle':'첨벙! 그냥 들어가면 다 젖어요.','paper>puddle':'흐물흐물… 그대로는 가라앉아요.',fan:'바람은 나중에 쓸모가 있을 거예요.'}}),
 L('얼음 속 열쇠','얼음을 녹여 열쇠를 꺼내요.',[
 o('ice','ice','열쇠가 든 얼음',255,380,115,110,{until:2}),o('dryer','dryer','헤어드라이어',18,385,110,100),o('plug','plug','드라이어 플러그',120,495,55,50),
 o('outlet','outlet','벽 콘센트',305,260,60,60),o('hammer','hammer','장난감 망치',28,290,80,85),o('key','key','꺼낸 열쇠',268,425,85,60,{after:2})
 ],[move('plug','outlet','드라이어 플러그를 콘센트에 꽂아요.','위잉~ 따뜻한 바람!'),move('dryer','ice','드라이어를 얼음에 대요.','사르르 녹았어요!'),tap('key','열쇠를 주워요.','차갑지 않은 열쇠를 얻었어요!')],
 {fail:{'hammer>ice':'쾅! 열쇠까지 망가질 수 있어요.','dryer>ice':'코드가 안 꽂혀 있어요.',dryer:'코드가 안 꽂혀 있어요.'}}),
 L('당근을 좋아하는 토끼','토끼와 별을 바꿔요.',[
 o('rabbit','rabbit','별을 안은 토끼',255,275,120,170),o('pot','pot','흙이 담긴 화분',18,405,100,105,{until:1}),o('carrot','carrot','쑥 자란 당근',22,410,90,90,{after:1}),
 o('can','wateringcan','물뿌리개',22,295,100,85),o('candy','candy','알록달록 사탕',140,500,60,50),o('star','star','토끼가 내려놓은 별 조각',290,455,60,60,{after:2})
 ],[move('can','pot','화분에 물을 줘 봐요.','쑥쑥! 순식간에 당근이 자랐어요.'),move('carrot','rabbit','당근을 토끼에게 건네요.','토끼가 별 조각을 내려놓았어요.'),tap('star','별 조각을 주워요.','다섯 번째 별 조각!')],
 {fail:{'candy>rabbit':'토끼는 사탕보다 채소가 좋대요.','pot>rabbit':'흙은 안 먹어요!',rabbit:'토끼가 별을 꼭 안고 놓지 않아요.'}}),
 L('깜깜한 터널','달빛으로 터널을 비춰요.',[
 o('tunnel','tunnel','깜깜한 장난감 터널',245,335,135,125),o('mirror','mirror','손거울',22,395,80,105),o('lamp','lamp','전선이 짧은 스탠드',25,255,80,120),
 o('star','star','터널 속 별 조각',290,385,55,55,{after:1})
 ],[move('mirror','tunnel','창밖 달빛을 거울로 터널에 반사해요.','반짝! 달빛이 터널을 환히 비춰요.'),tap('star','별 조각을 주워요.','여섯 번째 별 조각!')],
 {overlay:[{from:1,svg:'<path d="M62 30 L58 415 L300 400 Z" fill="#fff5c8" opacity=".16"/>'}],fail:{'lamp>tunnel':'전선이 짧아서 닿지 않아요.',lamp:'콘센트가 너무 멀어요.',tunnel:'너무 깜깜해서 안이 안 보여요.'}}),
 // 13 — 바닥 위 작은 여행
 L('끊어진 기찻길','다리를 놓아 기차를 보내요.',[
 o('gap','gap','끊어진 레일',240,420,135,75),o('block','block','나무 블록',22,440,70,65),o('plank','plank','길쭉한 나무 자',20,365,115,45),
 o('ribbon','ribbon','긴 리본',22,280,90,60),o('train','train','장난감 기차',255,300,110,100)
 ],[move('block','gap','블록을 틈 가운데 받침 기둥으로 세워요.','기둥 완성!'),move('plank','gap','나무 자를 기둥 위에 얹어요.','튼튼한 다리 완성!'),tap('train','기차를 출발시켜요.','칙칙폭폭! 무사히 건넜어요.')],
 {fail:{'ribbon>gap':'흐물흐물… 기차가 빠져 버려요.','plank>gap':'가운데가 휘청! 받침이 먼저 필요해요.',train:'이대로 가면 떨어져요!'}}),
 L('쉿, 곰이 자요','곰을 깨우지 말고 지나가요.',[
 o('bear','bear','잠든 곰',255,265,120,150),o('bell','bell','길목의 방울',290,430,60,60),o('pillow','pillow','작은 쿠션',20,420,100,85),
 o('sock','sock','폭신한 양말',25,305,85,85),o('door','door','곰 뒤의 문',290,110,80,125)
 ],[all([move('pillow','bell','','방울 소리를 막았어요.'),move('sock','hero','','발소리가 사라졌어요.',{wear:'feet'})],'방울 소리와 발소리, 둘 다 막아야 해요.','이제 아무 소리도 안 나요!'),move('hero','door','살금살금 문으로!','쉿! 곰이 모르게 지나왔어요.',{heroTo:'door'})],
 {mood:'quiet',fail:{bell:'딸랑! 쉿… 곰이 뒤척였어요.','hero>door':'딸랑, 저벅저벅… 이대로면 곰이 깨요!',bear:'쉿! 깨우면 안 돼요.'}}),
 L('바닥의 물웅덩이','웅덩이를 말려 별을 주워요.',[
 o('puddle','puddle','별 조각이 빠진 웅덩이',215,400,165,100,{until:1}),o('sponge','sponge','노란 스펀지',22,420,90,75),o('cup','cup','작은 컵',30,310,75,80),
 o('star','star','별 조각',285,420,60,60,{after:1})
 ],[move('sponge','puddle','스펀지로 물을 빨아들여요.','쭈욱! 웅덩이가 말끔해졌어요.'),tap('star','별 조각을 주워요.','일곱 번째 별 조각!')],
 {fail:{'cup>puddle':'한 컵씩 퍼내다간 아침이 돼요.','hero>puddle':'솜인형이 물에 들어가면 큰일!',puddle:'물속에서 뭔가 반짝여요.'}}),
 L('진짜 별은 어디?','빛나는 진짜 별을 골라요.',[
 o('lamp','lamp','켜진 스탠드',22,250,85,130),o('fakeA','starPlain','노란 별',265,290,70,70),o('fakeB','starPlain','노란 별',295,430,70,70),
 o('real0','starPlain','노란 별',30,425,70,70,{until:1}),o('star','star','혼자 빛나는 별',30,425,70,70,{after:1,glow:true})
 ],[tap('lamp','불을 끄면 진짜 별만 빛나요.','깜깜… 딱 하나만 반짝여요!'),tap('star','반짝이는 별을 골라요.','진짜 별 조각이에요!')],
 {darkAt:1,fail:{fakeA:'음… 그냥 종이별이에요.',fakeB:'이것도 종이별이네요.',real0:'다 똑같아 보여요. 어두우면 다를까요?'}}),
 L('커튼봉의 목도리','목도리를 되찾아요.',[
 o('window','windowOpen','열린 창문',250,130,125,135,{until:1}),o('closed','window','닫힌 창문',250,130,125,135,{after:1}),o('scarf','scarf','커튼봉에 걸린 목도리',30,120,95,100,{until:2}),o('hanger','hanger','옷걸이',22,425,105,75),
 o('scarf2','scarf','떨어진 목도리',30,330,95,100,{after:2})
 ],[tap('window','창문을 닫아 바람부터 막아요.','바람이 멈췄어요.'),move('hanger','scarf','옷걸이 고리로 목도리를 걸어 당겨요.','쏙 걸려서 툭 떨어졌어요!'),move('scarf2','hero','목도리를 단추에게 둘러 줘요.','단추의 소중한 목도리!',{wear:'neck'})],
 {mood:'cold',overlay:[{to:1,svg:'<g stroke="#e8f3ff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"><path d="M250 180q-60 10-110 0"/><path d="M250 215q-80 15-140 0"/></g>'}],fail:{'hanger>scarf':'바람에 휙! 창문부터 닫아요.','hero>scarf':'너무 높아요!',scarf:'팔이 안 닿아요.'}}),
 L('손잡이 없는 서랍','서랍을 열어 별을 찾아요.',[
 o('drawer','drawer','손잡이가 빠진 서랍',235,330,140,120,{until:3}),o('open','drawerOpen','열린 서랍',235,330,140,120,{after:3}),
 o('tape','tape','양면테이프',25,435,80,60),o('spool','spool','빈 실패',30,320,70,85),o('star','star','서랍 속 별 조각',280,335,55,55,{after:3})
 ],[move('tape','drawer','테이프를 서랍 앞에 붙여요.','끈끈!'),move('spool','drawer','실패를 테이프 위에 붙여 손잡이로!','새 손잡이 완성!'),tap('drawer','손잡이를 당겨요.','드르륵! 별 조각이 반짝!'),tap('star','별 조각을 꺼내요.','여덟 번째 별 조각!')],
 {fail:{'spool>drawer':'그냥 대면 툭 떨어져요. 붙일 게 필요해요.',drawer:'잡을 데가 없어요.','hero>drawer':'손톱이 없어서 못 열어요.'}}),
 // 19 — 창가의 소동
 L('창틀까지 책 계단','책으로 계단을 쌓아요.',[
 o('stairs','stairs','창틀 아래 빈자리',250,350,125,140),o('bookA','book','두꺼운 사전',18,300,95,55),o('bookB','bookTeal','동화책',22,385,95,55),o('bookC','bookPink','그림책',28,470,95,55),
 o('star','star','창틀 위 별 조각',300,120,55,55),o('ball','ball','통통 공',150,500,55,55)
 ],[all([move('bookA','stairs','','한 칸!'),move('bookB','stairs','','두 칸!'),move('bookC','stairs','','세 칸!')],'책을 창틀 아래에 차곡차곡 쌓아요.','책 계단 완성!'),move('hero','star','단추를 계단 위로!','영차! 창틀에 올라섰어요.',{heroTo:'star'}),tap('star','별 조각을 주워요.','아홉 번째 별 조각!')],
 {fail:{'ball>stairs':'데굴데굴… 공은 계단이 안 돼요.','hero>star':'너무 높아요!'}}),
 L('창밖에 걸린 별','우산으로 별을 끌어와요.',[
 o('window','window','빗장이 높은 창문',240,130,135,140),o('ruler','ruler','긴 자',22,300,60,150),o('umbrella','umbrella','손잡이가 굽은 우산',25,440,110,90),
 o('star','star','창밖 나뭇가지 별 조각',318,55,60,60),o('star2','star','끌려온 별 조각',285,440,60,60,{after:2})
 ],[move('ruler','window','자로 높은 빗장을 밀어요.','달칵! 창문이 열렸어요.',{keep:true}),move('umbrella','star','우산 손잡이를 갈고리처럼!','휙! 별 조각을 끌어왔어요.'),tap('star2','별 조각을 주워요.','열 번째 별 조각!')],
 {fail:{'umbrella>star':'창문이 잠겨 있어서 손이 안 나가요.','umbrella>window':'창문이 잠겨 있어요.',window:'빗장이 너무 높아요.','hero>star':'창밖은 위험해요!'}}),
 L('달 한 그릇','그릇에 달을 담아요.',[
 o('bowl','bowl','빈 그릇',250,430,125,75),o('water','water','물 한 컵',25,415,85,90),o('spoon','spoon','숟가락',30,320,60,90),o('moon','moonSmall','창밖의 달',55,15,40,40)
 ],[move('water','bowl','그릇에 물을 부어 봐요.','찰랑~ 물에 달이 비쳤어요!'),move('bowl','hero','달이 뜬 그릇을 단추에게!','달빛 한 그릇! 길이 환해요.',{wear:'hands'})],
 {fail:{'moon>bowl':'진짜 달은 너무 멀어요. 비치게 할 수는 있을까?','spoon>moon':'숟가락으로는 안 닿아요.',moon:'저 멀리 동그란 달.'}}),
 L('거꾸로 보면 달라져요','그림 속 친구를 웃게 해 주세요.',[
 o('portrait','portrait','거꾸로 된 웃는 그림',260,282,110,135),o('ball','ball','작은 공',27,441,65,65)
 ],[tap('portrait','그림을 두 번 눌러 반 바퀴 돌려요.','거꾸로 된 웃는 얼굴이었네요!',2)],{effect:'portrait'}),
 L('반짝, 도망가지 마!','별을 병 속으로 유인해요.',[
 o('star','star','달아나는 별',290,250,65,65,{until:1}),o('near','star','다가온 별',140,395,55,55,{after:1}),
 o('jar','jar','빈 유리병',22,395,95,115),o('candy','candy','별사탕',30,300,70,55)
 ],[move('candy','jar','달콤한 별사탕을 병에 넣어요.','별이 킁킁… 병 가까이 다가와요!'),tap('jar','들어가는 순간 뚜껑을 탁!','잡았다! 별이 병 속에 쏙.')],
 {fail:{'jar>star':'휙! 너무 빨라요. 유인해 볼까요?',star:'잡으려 하면 도망가요!','hero>star':'휙! 너무 빨라요.'}}),
 L('꽉 잠긴 뚜껑','병뚜껑을 열어요.',[
 o('jar','jarStar','별이 든 유리병',255,320,120,150,{until:2}),o('glove','glove','고무장갑',22,410,90,90),o('spoon','spoon','숟가락',30,300,60,90),
 o('star','star','병에서 나온 별 조각',285,440,60,60,{after:2})
 ],[move('glove','jar','미끄럽지 않게 고무장갑을 끼워요.','꽉 잡혔어요!'),tap('jar','뚜껑을 세 번 돌려요.','뽁! 열렸어요.',3),tap('star','별 조각을 꺼내요.','열한 번째 별 조각!')],
 {fail:{jar:'미끌미끌… 손이 헛돌아요.','spoon>jar':'톡톡… 조금 헐거워진 것 같지만 아직 미끄러워요.'}}),
 // 25 — 다시, 포근한 침대
 L('시소를 타고 침대로','시소로 침대에 올라가요.',[
 o('block','seesaw','둥근 블록',245,440,110,70),o('plank','plank','길쭉한 나무 자',20,375,115,45),o('books','books','두꺼운 책',22,270,105,95),
 o('bed','spot','침대 위',290,130,90,70)
 ],[move('plank','block','나무 자를 블록 위에 얹어요.','시소 완성!'),move('hero','block','단추를 시소 한쪽 끝에!','올라탔어요. 반대쪽에 무게가 필요해요.',{heroTo:'block'}),move('books','block','반대쪽 끝에 책을 쿵!','휘익~ 단추가 침대 위로 착지!',{heroTo:'bed'})],
 {fail:{'hero>bed':'너무 높아요! 튕겨 올라갈 방법이 없을까?','books>block':'시소부터 만들어요.'}}),
 L('잠자기 좋은 방','은은하고 조용한 방으로 만들어요.',[
 o('lamp','lamp','눈부신 스탠드',265,240,90,140),o('paper','paperYellow','노란 색종이',22,430,90,75),o('clock','clock','째깍째깍 탁상시계',30,300,80,85),o('sock','sock','두툼한 양말',290,440,80,80)
 ],[all([move('paper','lamp','','노란 불빛이 은은해졌어요.'),move('sock','clock','','째깍 소리가 쏙 작아졌어요.')],'불빛도, 시계 소리도 부드럽게 바꿔요.','이제 잠자기 딱 좋은 방이에요.')],
 {mood:'sleepy',overlay:[{to:1,svg:'<circle cx="310" cy="290" r="120" fill="url(#light)" opacity=".9"/>'}],fail:{lamp:'끄면 너무 깜깜해요. 은은하게만!',clock:'째깍째깍… 시끄러워요.'}}),
 L('줄이 꼬였어요','선을 자르지 말고 풀어 주세요.',[
 o('knot','knot','꼬인 전선',256,346,112,115),o('end','plug','빠질 수 있는 플러그 끝',290,444,62,52),o('scissors','scissors','가위',30,420,85,80)
 ],[shift('end','가위는 필요 없어요. 아래 플러그 끝을 옆으로 빼 봐요.','한쪽 끝을 빼니 선이 스르르 풀렸어요.')],
 {effect:'untie',fail:{'scissors>knot':'싹둑 하면 조명이 안 켜져요!',scissors:'자르지 않는 방법이 있을 거예요.'}}),
 L('전선이 안 닿아요','멀티탭으로 전선을 이어요.',[
 o('outlet','outlet','먼 벽 콘센트',310,255,60,60),o('tap','multitap','멀티탭',22,420,110,60),o('plug','plug','짧은 조명 플러그',150,495,55,50),o('ribbon','ribbon','리본',30,320,90,60)
 ],[move('tap','outlet','멀티탭을 벽 콘센트에 먼저 꽂아요.','멀티탭에 불이 들어왔어요.',{keep:true}),move('plug','tap','조명 플러그를 멀티탭에!','딸깍! 전기가 연결됐어요.')],
 {fail:{'plug>outlet':'전선이 짧아서 안 닿아요.','ribbon>outlet':'리본으로는 전기가 안 통해요!'}}),
 L('딱 맞는 마지막 조각','별 조명을 켜 주세요.',[
 o('star','star','모아 온 별 조각들',23,420,90,90),o('lamp','starLamp','별이 빠진 조명',254,284,125,165),o('switch','switch','조명 스위치',291,466,68,45)
 ],[move('star','lamp','별 조각을 조명의 빈 자리에 넣어요.','별이 꼭 맞게 들어갔어요.'),tap('switch','이제 작은 스위치를 눌러요.','반짝! 별 조명이 다시 켜졌어요.')],
 {fail:{switch:'별이 빠져 있어요. 먼저 끼워요.'}}),
 L('좋은 꿈 꿔, 단추','단추를 재워 주세요.',[
 o('blanket','blanket','포근한 이불',25,410,115,100),o('lamp','starLamp','켜진 별 조명',265,253,105,155,{lit:true})
 ],[move('blanket','hero','모험을 마친 단추에게 이불을 덮어 줘요.','포근한 이불 속으로 쏙.',{wear:'body'}),tap('lamp','별 조명을 눌러 은은한 수면등으로 바꿔요.','좋은 꿈 꿔, 단추. 오늘의 모험 끝!')],
 {night:true,mood:'sleepy'})
].map((l,i)=>({...l,id:i+1,chapter:Math.floor(i/6),hero:l.hero||{x:125,y:260,w:150,h:225}}));

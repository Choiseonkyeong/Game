export function tutorialStep({level,harvested,stage=1,stock=0,shells=0}){
 if(level>=3)return{step:5,title:'나의 섬이 한 뼘 더 자랐어요',copy:'첫 수확과 확장을 마쳤어요. 이제 내 취향으로 섬을 가꿔요.',action:'done'};
 if((harvested||level>=2)&&stock>0&&shells<150)return{step:3,title:'보관함의 수확물을 판매해요',copy:'수확한 작물은 보관함에 담겨요. 사과 꾸러미를 판매해 조개를 받고 확장해요.',action:'sell'};
 if(harvested||level>=2)return{step:4,title:'모은 조개로 섬을 넓혀요',copy:'하단 확장을 눌러 비용을 확인하고 확장해 주세요. 조개는 구매할 때만 사용돼요.',action:'expand'};
 if(stage>=5)return{step:2,title:'잘 익은 사과를 수확해요',copy:'오른쪽 사과나무를 누르고 수확하면 보관함에 담겨요.',action:'tree'};
 return{step:1,title:'오른쪽 작은 새싹을 돌봐요',copy:`기본 사과나무 ${stage}/5단계 · 새싹 → 어린나무 → 성장나무 → 풋열매 → 수확. 나무를 누르고 물을 주세요.`,action:'tree'};
}

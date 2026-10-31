'use strict';
// Shared data for 오늘의 옷장 and 햇살 부티크. Image files are registered paths, not bundled artwork.
const ClothingCategories = ['몸체','헤어','상의','하의','아우터','소품','모자'];
const ClothingSlots = {몸체:'body',헤어:'hair',상의:'top',하의:'bottom',아우터:'outer',소품:'accessory',모자:'hat'};
const ClothingItems = [
  {id:'top-oat',name:'오트밀 스웨트셔츠',category:'상의',price:0,iconImg:'./images/icons/top-oat.png',layerImg:'./images/top.png'},
  {id:'top-pink',name:'딸기 스트라이프 티',category:'상의',price:150,iconImg:'./images/icons/top-pink.png',layerImg:'./images/top-pink.png'},
  {id:'top-lace',name:'파스텔핑크 레이스 블라우스',category:'상의',price:200,iconImg:'./images/icons/top-lace.png',layerImg:'./images/top-lace.png'},
  {id:'top-beige-knit',name:'포근한 오프숄더 베이지 니트',category:'상의',price:250,iconImg:'./images/icons/top-beige-knit.png',layerImg:'./images/top-beige-knit.png'},
  {id:'bottom-denim',name:'데님 롤업 반바지',category:'하의',price:0,iconImg:'./images/icons/bottom-denim.png',layerImg:'./images/bottom.png'},
  {id:'bottom-tiered',name:'화이트 티어드 롱스커트',category:'하의',price:200,iconImg:'./images/icons/bottom-tiered.png',layerImg:'./images/bottom-tiered.png'},
  {id:'bottom-check',name:'체크 플리츠 미니스커트',category:'하의',price:180,iconImg:'./images/icons/bottom-check.png',layerImg:'./images/bottom-check.png'},
  {id:'outer-beige',name:'클래식 베이지 코트',category:'아우터',price:350,iconImg:'./images/icons/outer-beige.png',layerImg:'./images/outer-beige.png'},
  {id:'outer-ivory',name:'보송보송 아이보리 가디건',category:'아우터',price:300,iconImg:'./images/icons/outer-ivory.png',layerImg:'./images/cardigan-illustrated.png'},
  {id:'hat-lace',name:'리본 레이스 헤어밴드',category:'모자',price:120,iconImg:'./images/icons/hat-lace.png',layerImg:'./images/hat-lace.png'},
  {id:'accessory-fairy',name:'달빛 반짝 요정 날개',category:'소품',price:500,iconImg:'./images/icons/accessory-fairy.png',layerImg:'./images/accessory-fairy.png'}
];
const RequestedFashion = ClothingItems.map(item=>({...item,slot:ClothingSlots[item.category],tag:['top-lace','bottom-tiered','hat-lace','accessory-fairy'].includes(item.id)?'러블리':'꾸안꾸'}));

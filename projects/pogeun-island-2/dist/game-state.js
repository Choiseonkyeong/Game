'use strict';
let economyStorage;try{economyStorage=localStorage}catch{}
const economy=LifeEconomy.create({storage:economyStorage});

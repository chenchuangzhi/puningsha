'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        name: 'liaoyuan',
        connect: true,
        character: {
            // huanshi3:['male','liaoyuan2',4,['huanxie3','yaowan3']],
            yuwentai:['male','liaoyuan2',4,['wuzhuang','woquan']]
        },
        skill: {
            huanxie3: {
                enable: 'phaseUse',
                usable: 1,
                skillAnimation: true,
                animationColor: 'metal',
                content: function () {
                    "step 0"
                    event.delay = false;
                    event.targets = game.filterPlayer();
                    event.targets.remove(player);
                    event.targets.sort(lib.sort.seat);
                    player.line(event.targets, 'green');
                    event.targets2 = event.targets.slice(0);
                    event.targets3 = event.targets.slice(0);
                    "step 1"
                    player.draw(5);
                    player.removeSkill('huanxie');
                    "step 2"
                    if (event.targets.length) {
                        event.current = event.targets.shift()
                        if (event.current.countCards('e')) event.delay = true;
                        event.current.discard(event.current.getCards('e')).delay = false;
                    }
                    "step 3"
                    if (event.delay) game.delay(0.5);
                    event.delay = false;
                    if (event.targets.length) event.goto(2);
                    "step 4"
                    if (event.targets3.length) {
                        var target = event.targets3.shift();
                        target.chooseToDiscard(100, 'h', true).delay = false;
                        if (target.countCards('h')) event.delay = true;
                    }
                    "step 5"
                    if (event.delay) game.delay(0.5);
                    event.delay = false;
                    if (event.targets3.length) event.goto(4);
                }
            },
            yaowan3: {
                forced: true,
                trigger:{player:'phaseJieshuBegin'},
                filter: function (event, player,) {
                    return !player.hasSkill('huanxie'); //不包含自己,则其他角色
                },
                content:function(){
                    player.die(); // 添加临时技能，直到回合结束
                },
            },
            wuzhuang:{
                forced:true,
                group:['wuzhuang1','wuzhuang2_1','wuzhuang2_2','wuzhuang3','wuzhuang4','woquan0']
            },
            wuzhuang1:{
                trigger:{source:'damageBegin1'},
                forced:true,
                filter:function(event,player){
                    if(player.getEquip(1)){
                        return true
                    }
                    return false
                },
                content:function(){
                    if(trigger.card && trigger.card.name === 'sha'){
                        trigger.num++;
                    }
                }
            },
            wuzhuang2_1:{
                trigger:{player:['equipEnd']},
                forced:true,
                filter:function(event,player){
					return get.subtype(event.card)=='equip2';
				},
                content:function(){
                    if(player.hujia < 1){
                        player.changeHujia(1)
                    }
                }
            },
            wuzhuang2_2:{
                trigger:{player:['loseEnd']},
                forced:true,
                content:function(){
                    if(!player.getEquip(2)){
                        player.changeHujia(-1)
                    }
                }
            },
            wuzhuang3:{
                trigger:{player:'damageBegin1'},
                forced:true,
                filter:function(event,player){
                    if(player.getEquip(3) || player.getEquip(4)){
                        return true
                    }
                    return false
                },
                content:function(){
                    let p = 0
					player.getEquip(3) && (p+=0.25)
					player.getEquip(4) && (p+=0.25)
                    if(Math.random() > p){
                        game.log('杀的伤害被取消了');
                        prompt('杀的伤害被取消了')
                        trigger.cancel()
                    }
                }
            },
            wuzhuang4:{
                trigger:{player:'phaseZhunbeiBegin'},
                forced:true,
                filter:function(event,player){
                    if(player.getEquip(5)){
                        return true
                    }
                    return false
                },
                content:function(){
                    player.draw()
                }
            },
            woquan0:{
                trigger:{
                    player:'useCard'
                },
                forced:true,
                filter:function(event,player){
                    return get.type(event.card)=='equip';
                },
                init:function(player){
                    player.storage['wu'] = []
                },
                intro:{//标记介绍
                    name2:'武',
                    content:'已装备#种不同类型的装备'
                },
                content:function(){
                    if(!player.storage['wu'].includes(get.subtype(trigger.card))){
                        player.storage['wu'].push(get.subtype(trigger.card))
                        player.addMark('woquan0')
                    }
                }
            },
            woquan:{
                skillAnimation:true,
				animationColor:'wood',
				unique:true,
				juexingji:true,
				trigger:{player:'useCard'},
				forced:true,
                filter:function(event,player){
					return !player.hasSkill('woquan1') && player.storage['wu'] && player.storage['wu'].length > 2
				},
                content:function(){
                    player.addSkill('woquan1')
                }
            },
            woquan1:{
                mod:{
					canBeDiscarded:function(card){
                        debugger
						if(get.position(card)=='e') return false;
					},
				},
            }
            
        },
        translate: {
            huanshi3:'幻始3',
            huanxie3:'幻屑',
            huanxie3_info:'【限定技】出牌阶段，你可以摸五张牌，然后弃置所有角色的所有手牌和装备牌',
            yaowan3:'药丸',
            yaowan3_info:'回合结束阶段，若你没有"幻屑技能"，则你死亡',
            yuwentai:"宇文泰",
            wuzhuang:'武装',
            woquan0:'武',
            woquan:'握权',
            wuzhuang_info:'锁定技。当你装备区有武器时，你的杀伤害+1;当你装备有防具时，若你没有护甲，你获得一点护甲;当你装备区有马时，你有25%（一匹25%，两匹50%）的概率躲过杀的伤害;当你装备区宝物时，回合开始阶段你摸一张牌。',
            woquan_info:'觉醒技。当你装备过3种不同类型的装备牌时。你装备区内的牌不能被其他角色弃置'
        },
    };
});

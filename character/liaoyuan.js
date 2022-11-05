'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        name: 'liaoyuan',
        connect: true,
        character: {
            // huanshi3:['male','liaoyuan2',4,['huanxie3','yaowan3']],
            yuwentai:['male','liaoyuan2',4,['wuzhuang','woquan']],
            chengyaojin:['male','liaoyuan2',5,['jifen','rexue1']]
        },
        skill: {
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
                trigger:{target:'useCardToTarget'},
                forced:true,
				logTarget:'player',
                filter:function(event,player){
                    if(event.card.name !== 'sha'){
                        return false
                    }
                    if(player.getEquip(3) || player.getEquip(4)){
                        return true
                    }
                    return false
                },
                content:function(){
                    'step 0'
                    let p = []
                    player.getEquip(3) && p.push('spade')
                    player.getEquip(4) && p.push('club')
					player.judge(function(result){
						if(p.includes(get.suit(result))) return 2;
						return -1;
					}).judge2=function(result){
						return result.bool;
					};
					'step 1'
					if(result.bool){
						trigger.targets.remove(player);
						trigger.getParent().triggeredTargets2.remove(player);
						trigger.untrigger();
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
                    content:function(storage,player){
                        let m = {
                            equip1:'武器',
                            equip2:'防具',
                            equip3:'防御马',
                            equip4:'进攻马',
                            equip5:'宝物',
                        }
                        let s = player.storage['wu']
                        let r = s.map(i=>m[i])
                        return `已装备过${r.join('、')}`;
                    }
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
						if(get.position(card)=='e') return false;
					},
				},
            },
            rexue1:{
                enable:"phaseUse",//出牌阶段发动
                usable:1,
                filter:function(event,player){
                    return player.hp !== player.maxHp
                },
                content:function(){
                    player.recover(player.hp)
                },
            },
            jifen:{
                trigger:{source:'damageBegin1'},
                forced:true,
                filter:function(event,player){
                    return player.hp !== player.maxHp
                },
                content:function(){
                    if(trigger.card && trigger.card.name === 'sha'){
                        trigger.num = (player.maxHp - player.hp);
                    }
                }
            },
        },
        translate: {
            yuwentai:"宇文泰",
            wuzhuang:'武装',
            wuzhuang3:'躲避',
            woquan0:'武',
            woquan:'握权',
            wuzhuang_info:'锁定技。当你装备区有武器时，你的杀伤害+1;当你装备有防具时，若你没有护甲，你获得一点护甲;当你装备区有马时，你成为杀的目标可以进行一次判定，若有防御马,则你判断为♠️时，目标取消，若有进攻马,判定为♣️时,目标取消;当你装备区宝物时，回合开始阶段你摸一张牌。',
            woquan_info:'觉醒技。当你装备过3种不同类型的装备牌时。你装备区内的牌不能被其他角色弃置',
            chengyaojin:"程咬金",
            rexue1:"热血",
            rexue1_info:"主动技。每回合限一次，当你受伤时，在出牌阶段使用，你最多可以回复当前剩余体力值对应数量的体力值",
            jifen:"激奋",
            jifen_info:"锁定技。当你受伤时，你使用杀造成的伤害为x（x为你已损失的体力值）",
        },
    };
});

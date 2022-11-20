"use strict";
game.import("character", function (lib, game, ui, get, ai, _status) {
  return {
    name: "liaoyuan",
    connect: true,
    character: {
      yuwentai: ["male", "liaoyuan2", 4, ["wuzhuang", "woquan"]],
      chengyaojin: ["male", "liaoyuan2", 5, ["jifen", "rexue1"]],
      shierkaite: ["female", "liaoyuan2", 4, ["huanghun", "yujin1"]],
      baibianguai: ["male", "liaoyuan2", 4, ["baibian"]],
      hanxin: ["male", "liaoyuan2", 4, ["juejin", "xianzhen1"]],
      nengtianshi: ["female", "liaoyuan2", 4, ["guozai","paoguang2"]],
      yuebuqun:["male","liaoyuan2",4,["zixia","zigong"]],
      linpingzhi:["male","liaoyuan2",4,['shane',"xianchou1"]],
      yuyanjia:["female","liaoyuan2",3,['yuyan1','duanyan1']]
    },
    skill: {
      wuzhuang: {
        forced: true,
        group: [
          "wuzhuang1",
          "wuzhuang2_1",
          "wuzhuang2_2",
          "wuzhuang3",
          "wuzhuang4",
          "woquan0",
        ],
      },
      wuzhuang1: {
        trigger: { source: "damageBegin1" },
        forced: true,
        filter: function (event, player) {
          if (player.getEquip(1)) {
            return true;
          }
          return false;
        },
        content: function () {
          if (trigger.card && trigger.card.name === "sha") {
            trigger.num++;
          }
        },
      },
      wuzhuang2_1: {
        trigger: { player: ["equipEnd"] },
        forced: true,
        filter: function (event, player) {
          return get.subtype(event.card) == "equip2";
        },
        content: function () {
          if (player.hujia < 1) {
            player.changeHujia(1);
          }
        },
      },
      wuzhuang2_2: {
        trigger: { player: ["loseEnd"] },
        forced: true,
        content: function () {
          if (!player.getEquip(2)) {
            player.changeHujia(-1);
          }
        },
      },
      wuzhuang3: {
        trigger: { target: "useCardToTarget" },
        forced: true,
        logTarget: "player",
        filter: function (event, player) {
          if (event.card.name !== "sha") {
            return false;
          }
          if (player.getEquip(3) || player.getEquip(4)) {
            return true;
          }
          return false;
        },
        content: function () {
          "step 0";
          let p = [];
          player.getEquip(3) && p.push("spade");
          player.getEquip(4) && p.push("club");
          player.judge(function (result) {
            if (p.includes(get.suit(result))) return 2;
            return -1;
          }).judge2 = function (result) {
            return result.bool;
          };
          "step 1";
          if (result.bool) {
            trigger.targets.remove(player);
            trigger.getParent().triggeredTargets2.remove(player);
            trigger.untrigger();
          }
        },
      },
      wuzhuang4: {
        trigger: { player: "phaseZhunbeiBegin" },
        forced: true,
        filter: function (event, player) {
          if (player.getEquip(5)) {
            return true;
          }
          return false;
        },
        content: function () {
          player.draw();
        },
      },
      woquan0: {
        trigger: {
          player: "useCard",
        },
        forced: true,
        filter: function (event, player) {
          return get.type(event.card) == "equip";
        },
        init: function (player) {
          player.storage["wu"] = [];
        },
        intro: {
          //标记介绍
          name2: "武",
          content: function (storage, player) {
            let m = {
              equip1: "武器",
              equip2: "防具",
              equip3: "防御马",
              equip4: "进攻马",
              equip5: "宝物",
            };
            let s = player.storage["wu"];
            let r = s.map((i) => m[i]);
            return `已装备过${r.join("、")}`;
          },
        },
        content: function () {
          if (!player.storage["wu"].includes(get.subtype(trigger.card))) {
            player.storage["wu"].push(get.subtype(trigger.card));
            player.addMark("woquan0");
          }
        },
      },
      woquan: {
        skillAnimation: true,
        animationColor: "wood",
        unique: true,
        juexingji: true,
        trigger: { player: "useCard" },
        forced: true,
        filter: function (event, player) {
          return (
            !player.hasSkill("woquan1") &&
            player.storage["wu"] &&
            player.storage["wu"].length > 2
          );
        },
        content: function () {
          player.addSkill("woquan1");
        },
      },
      woquan1: {
        mod: {
          canBeDiscarded: function (card) {
            if (get.position(card) == "e") return false;
          },
        },
      },
      rexue1: {
        forced: true,
        trigger: {
          player: "phaseJieshuBegin",
        },
        content: function () {
          if (player.hp < 3) {
            player.recover();
          } else {
            player.loseHp();
          }
        },
      },
      jifen: {
        trigger: { source: "damageBegin1" },
        forced: true,
        filter: function (event, player) {
          return player.hp !== player.maxHp;
        },
        content: function () {
          if (trigger.card && trigger.card.name === "sha") {
              trigger.num = player.maxHp - player.hp + (trigger.num - 1);
          }
        },
      },
      huanghun: {
        unique: true, //特殊技(限定技和觉醒技都是)
        limited: true, //限定技
        mark: true, //标记
        intro: {
          //标记介绍
          content: "limited", //内容:未发动
        },
        skillAnimation: true, //有技能动画
        animationColor: "red",
        init: function (player) {
          //初始化
          player.storage["huanghun"] = false;
        },
        filter: function (event, player) {
          //发动限制条件
          return player.storage["huanghun"] == false; //你没发动过这个技能
        },
        enable: "phaseUse", //出牌阶段发动
        content: function () {
          "step 0"; //第0步(必须从0开始)
          player.storage["huanghun"] = true; //技能发动过
          player.awakenSkill("huanghun"); //技能文本变灰(失去技能，标记消失)
          "step 1";
          player.addSkill("huanghun1");
          player.addSkill("huanghun2");
          player.addSkill("huanghun3");
          player.addSkill("qinggang_skill");
          "step 2";
          player.gainMaxHp(5);
          player.recover(10);
        },
        ai:{
          unequip2:true,

					basic:{
						order:6
					},
					result:{
						player:function(player){
							if(player.hp>3) return -1;
							return 1;
						}
					}
				}
      },
      yujin1: {
        forced: true,
        trigger: {
          player: "dyingBegin",
        },
        filter: function (event, player) {
          return !player.hasSkill("yujin11");
        },
        content: function () {
          player.recover(1 - player.hp);
          player.addSkill("yujin11");
          player.addSkill("yujin12");
        },
      },
      yujin11: {
        trigger: {
          global: "phaseJieshuBegin",
        },
        forced: true,
        intro: {
          //标记介绍
          name2: "余",
          content: function (storage, player) {
            return `还有${8 - player.countMark("yujin11")}个角色回合后你会死亡`;
          },
        },
        content: function () {
          "step 0";
          player.addMark("yujin11");
          "step 1";
          if (player.countMark("yujin11") > 7) {
            player.die();
          }
        },
      },
      yujin12: {
        forced: true,
        trigger: {
          player: "dyingBegin",
        },
        content: function () {
          player.recover(1 - player.hp);
        },
      },
      huanghun1: {
        forced: true,
        trigger: {
          player: "phaseJieshuBegin",
        },
        init: function (player) {
          player.storage["huanghun1"] = 1;
        },
        content: function () {
          player.loseHp(player.storage["huanghun1"]);
          player.storage["huanghun1"]++;
        },
      },
      huanghun2: {
        mod: {
          targetInRange: function (card) {
            if (card.name == "sha") return true;
          },
        },
      },
      huanghun3: {
        mod: {
          cardname: function (card, player, name) {
            if (card.dataset.cardType == "basic") return "sha";
          },
          cardnature: function (card, player) {
            if (card.dataset.cardType == "basic") return false;
          },
        },
      },
      // 杀无视防具
      qinggang_skill: {
        equipSkill: true,
        audio: true,
        trigger: {
          player: "useCardToPlayered",
        },
        filter: function (event) {
          return event.card.name == "sha";
        },
        forced: true,
        logTarget: "target",
        content: function () {
          trigger.target.addTempSkill("qinggang2");
          trigger.target.storage.qinggang2.add(trigger.card);
          trigger.target.markSkill("qinggang2");
        },
        ai: {
          unequip_ai: true,
          skillTagFilter: function (player, tag, arg) {
            if (arg && arg.name == "sha") return true;
            return false;
          },
        },
      },
      // 牌无视防具
      qinggang2: {
        forced: true,
        firstDo: true,
        ai: { unequip2: true },
        init: function (player, skill) {
          if (!player.storage[skill]) player.storage[skill] = [];
        },
        onremove: true,
        trigger: {
          player: ["damage", "damageCancelled", "damageZero"],
          source: ["damage", "damageCancelled", "damageZero"],
          target: ["shaMiss", "useCardToExcluded", "useCardToEnd"],
          global: ["useCardEnd"],
        },
        charlotte: true,
        filter: function (event, player) {
          return (
            player.storage.qinggang2 &&
            event.card &&
            player.storage.qinggang2.contains(event.card) &&
            (event.name != "damage" || event.notLink())
          );
        },
        silent: true,
        forced: true,
        popup: false,
        priority: 12,
        content: function () {
          player.storage.qinggang2.remove(trigger.card);
          if (!player.storage.qinggang2.length) player.removeSkill("qinggang2");
        },
        marktext: "※",
        intro: { content: "当前防具技能已失效" },
      },
      baibian: {
        forced: true,
        trigger: {
          player: ["phaseZhunbeiBegin", "phaseJieshuBegin"],
        },
        init:function(player){
          player.storage.baibian = {
            old:player.skills,
            new:[]
          }
        },
        content: function () {
          "step 0";
          player.removeSkill(player.storage.baibian["new"]);
          player.storage.baibian["new"] = []
          "step 1";
          const pl = game.players.filter((item) => item !== player);
          let i = Math.floor(Math.random() * pl.length);
          let p = pl[i];
          var createDialog = function (player) {
            var str = get.translation(player) + "变身成了" + get.translation(p);
            ui.create.dialog(str);
          };
          game.broadcastAll(createDialog, player);
          player.addSkill(p.skills);
          player.storage.baibian["new"].push(...p.skills)
        },
      },
      juejin: {
        enable: "phaseUse",
        usable: 1,
        filter: function (event, player) {
          return player.hp < 2 || player.countCards("h") === 1;
        },
        filterTarget: function (card, player, target) {
          return player.canCompare(target);
        },
        content: function () {
          "step 0";
          player.chooseToCompare(target);
          "step 1";
          if (result.bool) {
            player.gainPlayerCard(target, true, "h", target.countCards("h"));
          } else {
             const next = player.damage('nocard');
             next.num = 1
             next.source = target
          }
        },
        ai: {
          order: function (name, player) {
            return 9;
          },
          result: {
            player: function (player) {
              return 0.6;
            },
            target: function (player, target) {
              var num = target.countCards("h");
              if (num == 1) return -1;
              if (num > 2) return -0.7;
              return -0.5;
            },
          },
          threaten: 1.3,
        },
      },
      xianzhen1: {
        trigger: { player: "damageEnd" },
        content: function () {
          player.useCard({ name: "sha", nature: "fire" }, trigger.source);
        },
      },
      guozai: {
        trigger: { player: "useCardToPlayered" },
        forced: true,
        filter: function (event, player) {
          return !!(event.card.name == "sha" && event.target != player && event.card.suit)
        },
        content: function () {
            for(let i of [0,1,2,3]){
                if(trigger.target.isDead()){
                    return
                }
                player.useCard(
                    { name: "sha", nature: trigger.card.nature },
                    trigger.target
                );
                player.getStat().card.sha--
            }
        },
      },
      paoguang2: {
        trigger: { source: "damageBefore" },
        forced: true,
        filter: function (event, player) {
          return event.card.name == "sha" && event.target != player;
        },
        content: function () {
          "step 0";
          player.judge(function (result) {
            if (get.suit(result) === 'heart') return 2;
            return -1;
          }).judge2 = function (result) {
            return result.bool;
          };
          "step 1";
          if (!result.bool) {
            trigger.num = 0;
          }
        },
      },

      zixia:{
        trigger: { player: "damageEnd" },
        content: function () {
          "step 0";
          player.judge(function (result) {
            if (get.suit(result) === 'heart' || get.suit(result) === 'diamond') return 2;
            return -1;
          }).judge2 = function (result) {
            return result.bool;
          };
          "step 1";
          if (result.bool) {
            player.recover(1)
          }else{
            player.gain(trigger.cards,'gain2');
          }
        },
        ai:{
					maixie:true,
					maixie_hp:true,
					effect:{
						target:function(card,player,target){
							if(player.hasSkillTag('jueqing',false,target)) return [1,-1];
							if(get.tag(card,'damage')) return [1,0.55];
						}
					}
				}
      },

      zigong:{
        skillAnimation: true,
        animationColor: "red",
        enable:"phaseUse",
        init:function(player){
          player.storage.zigong = false
        },
        filter:function(event,player){
          return !player.storage.zigong
        },
        content:function(){
          "step 0"
          player.loseMaxHp();
          player.hp = 1
          player.sex = 'fmale'
          "step 1"
          player.storage.zigong = true
          game.log(player, '获得技能', '【' + get.translation('pixie') + '】');
          player.addSkill('pixie')
        },
        ai:{
          result:{
            order:9,
            result:{
              player:function(player){
                if(player.countCards('h') > 3 && player.hp<3) return 1;
                return -1;
              }
            }
          }
        }
      },

      pixie:{
        mod:{
          cardUsable:function (card,player,num){
						if(card.name=='sha') return num + 1;
					},
          selectTarget:function(card,player,range){
						if(card.name=='sha'&&range[1]!=-1) range[1]++
					}
        },
        ai:{
          result:{
            target:function(){
              return -1
            },
            player:function(){
              return 1
            }
          }
        }
      },

      shane:{
        init:function(player){
          player.storage['chou'] = 0
        },
        mod:{
          maxHandcard:function(player,num){
						return num+player.storage['chou'];
					}
        },
        group: ["shane_shan","shane_e","chou"]
      },
      chou:{
        intro: {
          //标记介绍
          name2: "仇",
          content:'已有#个仇',
        },
      },
      shane_shan:{
        forced:true,
        trigger:{player:"damageBefore"},
        filter:function(event,player){
          return player.storage['chou'] < 4
        },
        content:function(){
          "step 0"
          if(player.countCards('h')){
            player.chooseCard('选择'+trigger.num+'张手牌交给'+get.translation(trigger.source),true,trigger.num).ai=function(card){
              if(get.attitude(player,trigger.player)>0){
                return 9-get.value(card);
              }
              if(player.countCards('h',{name:'shan'})) return -1;
              return 7-get.value(card);
            }
          }
          "step 1"
          if(result.bool){
            trigger.source.gain(result.cards,player);
          }
          player.addMark('chou',trigger.num)
          player.gainMaxHp(trigger.num)
        }
      },

      shane_e:{
        forced:true,
        trigger:{player:"damageBefore"},
        filter:function(event,player){
          return player.storage['chou'] >= 4
        },
        content:function(){
          "step 0"
          if(trigger.source.countCards('h')){
            trigger.source.chooseToDiscard(true,trigger.num,'h');
          }
          "step 1"
          player.addMark('chou')
          if(player.maxHp > 1){
            player.loseMaxHp(trigger.num)
            trigger.cancel();
          }
        }
      },

      xianchou1: {
        skillAnimation: true,
        animationColor: "black",
        unique: true,
        juexingji: true,
        trigger: { player: "phaseZhunbeiBegin" },
        forced: true,
        init:function(player){
          player.storage.xianchou1 = false
        },
        filter: function (event, player) {
          return player.storage['chou'] >= 4 && !player.storage.xianchou1;
        },
        content: function () {
          player.draw(3)
          player.addSkill("pixie");
          game.log(player, '获得技能', '【' + get.translation('pixie') + '】');
          player.sex = "fmale"
          player.storage.xianchou1 = true
        },
      },

      yuyan1:{
        enable:"phaseUse",
        usable:1,
        filterTarget:function(card, player, target){
          if(target==player) return false;
          if(!ui.selected.targets.length) return target.countCards('h')>0;
          return false
        },
        selectTarget:1,
        check:function(event,player){
          return get.attitude(event.player) < 0 ;
        },
        content:function(){
          const list =[ 
          '基本牌',
          '装备牌',
          '锦囊牌'
        ]
          "step 0"
          player.chooseControl().set('prompt','请预测'+get.translation(targets[0])+'手里有那种牌型').set('choiceList',list).set('ai',function(){
						var player=_status.event.player;
						if(!player.hasSha()||!player.hasShan()||player.hp==1) return 0;
            const rand = Math.random()
            if(rand > 0.5){
              return 0
            }else if(rand < 0.2){
              return 1
            }else{
              return 2
            }
					});
          "step 1"
          if(result.control === "选项一"){
            ui.create.dialog(get.translation(player) + "预言了基本牌");
            if(targets[0].countCards('h',{type:'basic'}) >0){
              player.viewHandcards(targets[0])
              targets[0].chooseCard(function(card,player){
                var name=get.name(card,player);
                return get.type(name)=='basic';
              },'h','请交给'+get.translation(player)+
              '一张基本牌',true).set('ai',function(card){
                return get.attitude(target,_status.event.sourcex)>=0?1:-1;
              })
          }else{
            var str = get.translation(player) + "预言失败";
            ui.create.dialog(str);
          }    
        }

        if(result.control === "选项二"){
          ui.create.dialog(get.translation(player) + "预言了装备牌");
          if(targets[0].countCards('h',{type:'equip'}) >0){
            player.viewHandcards(targets[0])
            targets[0].chooseCard(function(card,player){
              var name=get.name(card,player);
              return get.type(name)=='equip';
            },'h','请交给'+get.translation(player)+
            '一张装备牌',true).set('ai',function(card){
              return get.attitude(target,_status.event.sourcex)>=0?1:-1;
            })
          }else{
            var str = get.translation(player) + "预言失败";
            ui.create.dialog(str);
          }   
        }

        if(result.control === "选项三"){
          ui.create.dialog(get.translation(player) + "预言了锦囊牌");
          if(targets[0].countCards('h',{type:['trick','delay']})>0){
            player.viewHandcards(targets[0])
            targets[0].chooseCard(function(card,player){
              var name=get.name(card,player);
              return get.type(name)=='trick' || get.type(name)=='delay';
            },'h','请交给'+get.translation(player)+
            '一张锦囊牌',true).set('ai',function(card){
              return get.attitude(target,_status.event.sourcex)>=0?1:-1;
            })
          }else{
            var str = get.translation(player) + "预言失败";
            ui.create.dialog(str);
          }   
        }
        "step 2"
        if(result.bool){
          player.gain(result.cards,target,'giveAuto');
        }
      },
      ai:{
        order:6,
        result:{
          player:1,
          target:-1
        }
      }
    },
    duanyan1:{
      trigger:{target:'shaBefore'},
      forced: true,
      filter:function(event,player){
        return event.card.name=='sha'
      },
      content:function(){
        const list =[ 
          '♠️',
          '♥️',
          '♣️',
          '♦️'
        ]
        "step 0"
        player.chooseControl().set('prompt','请预测牌堆顶一张牌的花色').set('choiceList',list).set('ai',function(){
          const rand = Math.random()
          if(rand >= 0.75){
            return 0
          }

          if(rand < 0.75 && rand >= 0.5){
            return 1
          }

          if(rand < 0.5 && rand >= 0.25){
            return 2
          }

          return 3
        });
        "step 1"
        const card=get.cards()[0];
        player.showCards(card,get.translation(player)+'开始预测');
        var suit=get.suit(card);
        if(result.control === "选项一"){
          ui.create.dialog(get.translation(player) + "预言了♠️");
          if(suit === "spade"){
          trigger.cancel()
          player.gain(card,target,'giveAuto');
          var str = get.translation(player) + "预言成功";
          ui.create.dialog(str);
        }else{
          var str = get.translation(player) + "预言失败";
          ui.create.dialog(str);
        }    
      }

      if(result.control === "选项二"){
        ui.create.dialog(get.translation(player) + "预言了♥️");
        if(suit === "heart"){
          trigger.cancel()
          player.gain(card,target,'giveAuto');
          var str = get.translation(player) + "预言成功";
          ui.create.dialog(str);
        }else{
          var str = get.translation(player) + "预言失败";
          ui.create.dialog(str);
        }   
      }

      if(result.control === "选项三"){
        ui.create.dialog(get.translation(player) + "预言了♣️");
        if(suit === "club"){
          trigger.cancel()
          player.gain(card,target,'giveAuto');
          var str = get.translation(player) + "预言成功";
          ui.create.dialog(str);
        }else{
          var str = get.translation(player) + "预言失败";
          ui.create.dialog(str);
        }   
      }

      if(result.control === "选项四"){
        if(suit === "diamond"){
          ui.create.dialog(get.translation(player) + "预言了♦️");
          trigger.cancel()
          player.gain(card,target,'giveAuto');
          var str = get.translation(player) + "预言成功";
          ui.create.dialog(str);
        }else{
          var str = get.translation(player) + "预言失败";
          ui.create.dialog(str);
        }   
      }

      }
    }
  },
    translate: {
      yuwentai: "宇文泰",
      wuzhuang: "武装",
      wuzhuang3: "躲避",
      woquan0: "武",
      woquan: "握权",
      wuzhuang_info:
        "锁定技。当你装备区有武器时，你的杀伤害+1;当你装备有防具时，若你没有护甲，你获得一点护甲;当你装备区有马时，你成为杀的目标可以进行一次判定，若有防御马,则你判断为♠️时，目标取消，若有进攻马,判定为♣️时,目标取消;当你装备区宝物时，回合开始阶段你摸一张牌。",
      woquan_info:
        "觉醒技。当你装备过3种不同类型的装备牌时。你装备区内的牌不能被其他角色弃置",
      chengyaojin: "程咬金",
      rexue1: "热血",
      rexue1_info:
        "锁定技。你的回合结束时，若你的体力值小于3，则你回复一点体力值，若你的体力值大于3则你失去一点体力值",
      jifen: "激奋",
      jifen_info:
        "锁定技。当你受伤时，你使用杀造成的伤害为x（x为你已损失的体力值）",
      shierkaite: "史尔特尔",
      huanghun: "黄昏",
      huanghun_info:
        "限定技，出牌阶段，你可以将体力值回满并加5点体力上限。若如此做，之后你使用杀无距离限制且无视防具，且你的基本牌均视为杀，每次回合结束阶段，失去x点体力。（x为你使用该技能后的回合数）",
      yujin1: "余烬",
      yujin12: "余烬",
      yujin11: "余",
      yujin1_info:
        "锁定技，当你进入频死状态后，你的体力值一直至少为1，有玩家回合结束后，你获得一个【余】标记，当【余】标记数为8时,你死亡。",
      baibianguai: "百变怪",
      baibian: "百变",
      baibian_info: "回合开始前和回合结束后，你随机变身为场上存活的一个角色。",
      hanxin: "韩信",
      juejin: "绝境",
      juejin_info:
        "主动技，出牌阶段限一次，当你只剩下一张手牌或只剩下一点体力值时，你可以选择一个目标进行拼点，若你赢，你获得其所有手牌；若你没赢，其对你造成一点伤害",
      xianzhen1: "陷阵",
      xianzhen1_info:
        "当你受到伤害时，你可以选择发动此技能，视为向伤害来源使用一张火杀。",
      nengtianshi: "能天使",
      guozai: "过载",
      guozai_info: "锁定技，当你使用杀指定目标后，你可令此牌效果执行五次",
      paoguang2: "抛光",
      paoguang2_info:
        "锁定技，当你的杀造成伤害时，你需要进行一次判定，若结果不为红桃，则取消本次伤害",
      yuebuqun:"岳不群",
      zixia:"紫霞",
      zixia_info:"当你受到伤害后，你可以进行一次判定，所谓♥️ 或♦️ ，你回复一点血量;若为♠️ 或♣️ ，你过得造成伤害的牌。",
      zigong:"自宫",
      zigong_info:"限定技。你的回合内，你可以发动此技能。你降低一点体力上限，体力值扣除至一点，然后你的性别修改为太监，然后你获得辟邪技能。",
      pixie:"辟邪",
      pixie_info:"锁定技。你使用杀次数+1;你使用杀的目标+1。",
      linpingzhi:"林平之",
      shane:"善恶",
      shane_info:"锁定技。当你的【仇】标记小于4时，你受到伤害前，若你有手牌，你必须给伤害来源y张(y为伤害数)手牌，然后获得y个【仇】标记并加一点体力上限;当你【仇】标记大于4时，你受到伤害前，若你的体力上限大于y，你改为失去y点体力上限，若伤害源有手牌，你令其弃置y张手牌，并获得y个【仇】标记。你的手牌上限数+x（x为【仇】标记的数量）。",
      xianchou1_info:"觉醒技。准备阶段，若你的【仇】标记不小于4，你摸三张牌，性别变为太监，并获得【辟邪】技能。",
      xianchou1:"陷仇",
      chou:"仇",
      yuyanjia:"预言家",
      yuyan1:"预言",
      yuyan1_info:"每回合限一次，你的回合内，选择一个有手牌的其他角色，然后预测其手牌里，有哪种牌型（基本、装备、锦囊），然后其展示手牌于你。若预测成功，其选择一张该类型手牌给你。",
      duanyan1:"断言",
      duanyan1_info:"当你成为杀的目标时，你可以预测牌堆顶一张牌牌的花色，并展示之，若预测成功，取消此目标并获得此牌。"
    },
  }
});

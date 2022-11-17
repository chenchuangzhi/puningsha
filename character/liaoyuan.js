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
            trigger.num = player.maxHp - player.hp;
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
        ai: {
          unequip: true,
          result: {
            player: function (player) {
              if (player.hp < 3) {
                return 1;
              }
              return 0;
            },
          },
        },
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
        content: function () {
          "step 0";
          if (player.skills && player.skills.length > 1) {
            let s = player.skills.slice(1);
            player.removeSkill(s);
          }
          "step 1";
          const pl = game.players.filter((item) => item !== player);
          let i = Math.floor(Math.random() * pl.length);
          let p = pl[i];
          var createDialog = function (player) {
            if (_status.connectMode) lib.configOL.choose_timeout = "2";
            var str = get.translation(player) + "变身成了" + get.translation(p);
            ui.create.dialog(str);
          };
          game.broadcastAll(createDialog, player);
          player.addSkill(p.skills);
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
      zigong_info:"你的回合内，你可以发动此技能。你降低一点体力上限，体力值扣除至一点，然后你的性别修改为太监，然后你获得辟邪技能。",
      pixie:"辟邪",
      pixie_info:"你使用杀次数+1;你使用杀的目标+1。"
    },
  };
});

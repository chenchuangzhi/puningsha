'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        //strategy and battle, "sb" in short
        name: 'sb',
        connect: true,
        character: {
            sb_yujin: ['male', 'wei', 4, ['sbxiayuan', 'sbjieyue']],
            sb_huaxiong: ['male', 'qun', '3/4/1', ['new_reyaowu', 'sbyangwei']],
            liucheng: ['female', 'qun', 3, ['splveying', 'spyingwu']],
            sp_yangwan: ['female', 'shu', 3, ['spmingxuan', 'spxianchou']],
            sb_huangzhong: ['male', 'shu', 4, ['sbliegong']],
            xushimin: ['male', 'daba', 4, ['sbliegong', 'biyue']],
            sb_pangtong: ['male', 'shu', 3, ['sbwuxin', 'sbniepan']],
			chenshuai:['male','daba',4,['feigong','jianyu']],
            dachu:['male','liaoyuan2',4,['dunai','douguaishiming']],
            mushuihan:['male','daba',4,['guaishuai','guaichu','guaimin']],
            gaohuan:['male','qun',4,['yanji','xunhua']],
            huanshi:['male','qun',4,['huanxie','yaowan']],
        },
        skill: {
            //于禁
            sbxiayuan: {
                audio: 2,
                trigger: { global: 'damageEnd' },
                direct: true,
                filter: function (event, player) {
                    return event.hujia && !event.player.hujia && event.player.isIn() && player.countCards('h') > 1 && !player.hasSkill('sbxiayuan_round', null, false, false);
                },
                content: function () {
                    'step 0'
                    player.addTempSkill('sbxiayuan_round', 'roundStart');
                    player.chooseToDiscard(2, 'h', get.prompt('sbxiayuan', trigger.player), '弃置两张手牌，令其获得' + get.cnNumber(trigger.hujia) + '点护甲').set('goon', get.attitude(player, trigger.player) > 0).set('ai', function (card) {
                        if (!_status.event.goon) return 0;
                        return 5 - get.value(card);
                    }).logSkill = ['sbxiayuan', trigger.player];
                    'step 1'
                    if (result.bool) {
                        var target = trigger.player;
                        player.logSkill('sbxiayuan', target);
                        target.changeHujia(trigger.hujia);
                        game.delayx();
                    }
                    else player.removeSkill('sbxiayuan_round');
                },
                subSkill: { round: { charlotte: true } },
                ai: { expose: 0.2 },
            },
            sbjieyue: {
                audio: 2,
                trigger: { player: 'phaseJieshuBegin' },
                direct: true,
                content: function () {
                    'step 0'
                    player.chooseTarget(lib.filter.notMe, get.prompt('sbjieyue'), '令一名其他角色获得1点护甲，然后该角色可以交给你一张牌。').set('ai', function (target) {
                        return get.attitude(_status.event.player, target) / Math.sqrt(Math.min(1, target.hp + target.hujia));
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        event.target = target;
                        player.logSkill('sbjieyue', target);
                        target.changeHujia(1);
                        target.chooseCard('he', '是否交给' + get.translation(player) + '一张牌？').set('ai', (card) => 0.1 - get.value(card));
                    }
                    else event.finish();
                    'step 2'
                    if (result.bool) {
                        player.gain(result.cards, target, 'giveAuto');
                    }
                },
                ai: {
                    threaten: 2.7,
                    expose: 0.2,
                },
            },
            //华雄
            sbyangwei: {
                audio: 2,
                enable: 'phaseUse',
                filter: function (event, player) {
                    return !player.hasSkill('sbyangwei_counter', null, null, false);
                },
                content: function () {
                    player.draw(2);
                    player.addTempSkill('sbyangwei_effect');
                    player.addSkill('sbyangwei_counter');
                },
                ai: {
                    order: 9,
                    result: { player: 1 },
                },
                subSkill: {
                    effect: {
                        audio: 'sbyangwei',
                        equipSkill: false,
                        inherit: 'qinggang_skill',
                        charlotte: true,
                        nopop: true,
                        mod: {
                            targetInRange: function (card) {
                                if (card.name == 'sha') return true;
                            },
                            cardUsable: function (card, player, num) {
                                if (card.name == 'sha') return num + 1;
                            },
                        },
                        mark: true,
                        marktext: '威',
                        intro: { content: '使用【杀】的次数上限+1且无距离限制且无视防具' },
                    },
                    counter: {
                        trigger: { player: 'phaseJieshu' },
                        silent: true,
                        popup: false,
                        forced: true,
                        charlotte: true,
                        onremove: true,
                        content: function () {
                            if (!player.storage.sbyangwei_counter) player.storage.sbyangwei_counter = true;
                            else player.removeSkill('sbyangwei_counter');
                        },
                    },
                },
            },
            //黄忠
            sbliegong: {
                audio: 2,
                mod: {
                    cardnature: function (card, player) {
                        if (!player.getEquip(1) && get.name(card, player) == 'sha') return false;
                    },
                },
                trigger: { player: 'useCardToPlayered' },
                filter: function (event, player) {
                    return !event.getParent()._sbliegong_player && event.targets.length == 1 && event.card.name == 'sha' && player.getStorage('sbliegong').length > 0;
                },
                prompt2: function (event, player) {
                    var str = '', storage = player.getStorage('sbliegong');
                    if (storage.length > 1) {
                        str += ('展示牌堆顶的' + get.cnNumber(storage.length - 1) + '张牌并增加伤害；且');
                    }
                    str += ('令' + get.translation(event.target) + '不能使用花色为');
                    for (var i = 0; i < storage.length; i++) {
                        str += get.translation(storage[i]);
                    }
                    str += ('的牌响应' + get.translation(event.card));
                    return str;
                },
                logTarget: 'target',
                check: function (event, player) {
                    var target = event.target;
                    if (get.attitude(player, target) > 0) return false;
                    if (target.hasSkillTag('filterDamage', null, {
                        player: player,
                        card: event.card,
                    })) return false;
                    var storage = player.getStorage('sbliegong');
                    if (storage.length >= 4) return true;
                    if (storage.length < 3) return false;
                    if (target.hasShan()) return storage.contains('heart') && storage.contains('diamond');
                    return true;
                },
                content: function () {
                    var storage = player.getStorage('sbliegong').slice(0);
                    var num = storage.length - 1;
                    var evt = trigger.getParent();
                    if (num > 0) {
                        if (typeof evt.baseDamage != 'number') evt.baseDamage = 1;
                        var cards = get.cards(num);
                        player.showCards(cards.slice(0), get.translation(player) + '发动了【烈弓】');
                        while (cards.length > 0) {
                            var card = cards.pop();
                            if (storage.contains(get.suit(card, false))) evt.baseDamage++;
                            ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
                        }
                        game.updateRoundNumber();
                    }
                    evt._sbliegong_player = player;
                    player.addTempSkill('sbliegong_clear');
                    var target = trigger.target;
                    target.addTempSkill('sbliegong_block');
                    if (!target.storage.sbliegong_block) target.storage.sbliegong_block = [];
                    target.storage.sbliegong_block.push([evt.card, storage]);
                    lib.skill.sbliegong.updateBlocker(target);
                },
                updateBlocker: function (player) {
                    var list = [], storage = player.storage.sbliegong_block;
                    if (storage && storage.length) {
                        for (var i of storage) list.addArray(i[1]);
                    }
                    player.storage.sbliegong_blocker = list;
                },
                ai: {
                    threaten: 3.5,
                    directHit_ai: true,
                    halfneg: true,
                    skillTagFilter: function (player, tag, arg) {
                        if (arg && arg.card && arg.card.name == 'sha') {
                            var storage = player.getStorage('sbliegong');
                            if (storage.length < 3 || !storage.contains('heart') || !storage.contains('diamond')) return false;
                            var target = arg.target;
                            if (target.hasSkill('bagua_skill') || target.hasSkill('bazhen') || target.hasSkill('rw_bagua_skill')) return false;
                            return true;
                        }
                        return false;
                    },
                },
                intro: {
                    content: '已记录花色：$',
                    onunmark: true,
                },
                group: 'sbliegong_count',
                subSkill: {
                    clear: {
                        trigger: { player: 'useCardAfter' },
                        forced: true,
                        charlotte: true,
                        popup: false,
                        filter: function (event, player) {
                            return event._sbliegong_player == player;
                        },
                        content: function () {
                            player.unmarkSkill('sbliegong');
                        },
                    },
                    block: {
                        mod: {
                            cardEnabled: function (card, player) {
                                if (!player.storage.sbliegong_blocker) return;
                                var suit = get.suit(card);
                                if (suit == 'none') return;
                                var evt = _status.event;
                                if (evt.name != 'chooseToUse') evt = evt.getParent('chooseToUse');
                                if (!evt || !evt.respondTo || evt.respondTo[1].name != 'sha') return;
                                if (player.storage.sbliegong_blocker.contains(suit)) return false;
                            },
                        },
                        trigger: {
                            player: ['damageBefore', 'damageCancelled', 'damageZero'],
                            target: ['shaMiss', 'useCardToExcluded', 'useCardToEnd'],
                            global: ['useCardEnd'],
                        },
                        forced: true,
                        firstDo: true,
                        charlotte: true,
                        onremove: function (player) {
                            delete player.storage.sbliegong_block;
                            delete player.storage.sbliegong_blocker;
                        },
                        filter: function (event, player) {
                            if (!event.card || !player.storage.sbliegong_block) return false;
                            for (var i of player.storage.sbliegong_block) {
                                if (i[0] == event.card) return true;
                            }
                            return false;
                        },
                        content: function () {
                            var storage = player.storage.sbliegong_block;
                            for (var i = 0; i < storage.length; i++) {
                                if (storage[i][0] == trigger.card) {
                                    storage.splice(i--, 1);
                                }
                            }
                            if (!storage.length) player.removeSkill('sbliegong_block');
                            else lib.skill.sbliegong.updateBlocker(target);
                        },
                    },
                    count: {
                        trigger: {
                            player: 'useCard',
                            target: 'useCardToTargeted',
                        },
                        forced: true,
                        filter: function (event, player, name) {
                            if (name != 'useCard' && player == event.player) return false;
                            var suit = get.suit(event.card);
                            if (!lib.suit.contains(suit)) return false;
                            if (player.storage.sbliegong && player.storage.sbliegong.contains(suit)) return false;
                            return true;
                        },
                        content: function () {
                            player.markAuto('sbliegong', [get.suit(trigger.card)]);
                        },
                    },
                },
            },
            // 市民闭月
            biyue: {
                audio: 2,
                trigger: { player: 'phaseJieshuBegin' },
                frequent: true,
                preHidden: true,
                content: function () {
                    player.draw();
                },
            },
            //刘赪
            splveying: {
                audio: 2,
                trigger: { player: 'useCardAfter' },
                forced: true,
                filter: function (event, player) {
                    return event.card.name == 'sha' && player.countMark('splveying') > 1;
                },
                logTarget: 'targets',
                content: function () {
                    player.removeMark('splveying', 2);
                    for (var i of trigger.targets) player.discardPlayerCard(i, true, 'he');
                },
                marktext: '椎',
                intro: {
                    name: '椎(掠影/莺舞)',
                    name2: '椎',
                    content: 'mark',
                },
                group: 'splveying_add',
                subSkill: {
                    add: {
                        trigger: { player: 'useCardToPlayered' },
                        forced: true,
                        usable: 2,
                        filter: function (event, player) {
                            return event.card.name == 'sha' && player.isPhaseUsing();
                        },
                        content: function () {
                            player.addMark('splveying', 1);
                        },
                    },
                },
            },
            spyingwu: {
                group: 'spyingwu_add',
                audio: 2,
                trigger: { player: 'useCardAfter' },
                forced: true,
                locked: false,
                filter: function (event, player) {
                    return player.hasSkill('splveying') && (get.type(event.card) == 'trick' && !get.tag(event.card, 'damage')) && player.countMark('splveying') > 1;
                },
                content: function () {
                    player.removeMark('splveying', 2);
                    player.chooseUseTarget('sha', false);
                },
                ai: { combo: 'splveying' },
                subSkill: {
                    add: {
                        trigger: { player: 'useCardToPlayered' },
                        forced: true,
                        locked: false,
                        usable: 2,
                        filter: function (event, player) {
                            return player.hasSkill('splveying') && (get.type(event.card) == 'trick' && !get.tag(event.card, 'damage')) && player.isPhaseUsing();
                        },
                        content: function () {
                            player.addMark('splveying', 1);
                        },
                    },
                },
            },
            //手杀杨婉
            spmingxuan: {
                audio: 2,
                trigger: { player: 'phaseUseBegin' },
                forced: true,
                filter: function (event, player) {
                    var list = player.getStorage('spmingxuan');
                    return player.countCards('h') > 0 && game.hasPlayer(function (current) {
                        return current != player && !list.contains(current);
                    });
                },
                content: function () {
                    'step 0'
                    var suits = [], hs = player.getCards('h');
                    for (var i of hs) suits.add(get.suit(i, player));
                    var list = player.getStorage('spmingxuan'), num = Math.min(suits.length, game.countPlayer(function (current) {
                        return current != player && !list.contains(current);
                    }));
                    player.chooseCard('h', true, [1, num], '瞑昡：请选择至多' + get.cnNumber(num) + '张花色各不相同的手牌', function (card, player) {
                        if (!ui.selected.cards.length) return true;
                        var suit = get.suit(card);
                        for (var i of ui.selected.cards) {
                            if (get.suit(i, player) == suit) return false;
                        }
                        return true;
                    }).set('complexCard', true).set('ai', (card) => 6 - get.value(card));
                    'step 1'
                    if (result.bool) {
                        var list = player.getStorage('spmingxuan'), cards = result.cards.randomSort();
                        var targets = game.filterPlayer((current) => (current != player && !list.contains(current))).randomGets(cards.length).sortBySeat();
                        player.line(targets, 'green');
                        for (var i = 0; i < targets.length; i++) {
                            targets[i].gain(cards[i], player);
                            player.$giveAuto(cards[i], targets[i]);
                        }
                        event.targets = targets;
                        event.num = 0;
                    }
                    else event.finish();
                    'step 2'
                    game.delayx();
                    'step 3'
                    if (num < targets.length) {
                        var target = targets[num];
                        event.num++;
                        if (target.isIn()) {
                            event.target = target;
                            target.chooseToUse(function (card, player, event) {
                                if (get.name(card) != 'sha') return false;
                                return lib.filter.filterCard.apply(this, arguments);
                            }, '对' + get.translation(player) + '使用一张杀，否则交给其一张牌，且其摸一张牌').set('targetRequired', true).set('complexSelect', true).set('filterTarget', function (card, player, target) {
                                if (target != _status.event.sourcex && !ui.selected.targets.contains(_status.event.sourcex)) return false;
                                return lib.filter.targetEnabled.apply(this, arguments);
                            }).set('sourcex', player).set('addCount', false);
                        }
                        else {
                            if (event.num < targets.length) event.redo();
                            else event.finish();
                        }
                    }
                    'step 4'
                    if (result.bool) {
                        player.markAuto('spmingxuan', [target]);
                        if (event.num < targets.length) event.goto(3);
                        else event.finish();
                    }
                    else {
                        var he = target.getCards('he');
                        if (he.length) {
                            if (he.length == 1) event._result = { bool: true, cards: he };
                            else target.chooseCard('he', true, '交给' + get.translation(player) + '一张牌')
                        }
                        else {
                            if (event.num < targets.length) event.goto(3);
                            else event.finish();
                        }
                    }
                    'step 5'
                    if (result.bool) {
                        player.gain(result.cards, target, 'giveAuto');
                        player.draw();
                    }
                    if (event.num < targets.length) event.goto(3);
                },
                intro: { content: '已被$使用过杀' },
            },
            spxianchou: {
                audio: 2,
                trigger: { player: 'damageEnd' },
                direct: true,
                filter: function (event, player) {
                    return event.source && event.source.isIn() && game.hasPlayer(function (current) {
                        return current != player && current != event.source;
                    });
                },
                content: function () {
                    'step 0'
                    player.chooseTarget(get.prompt2('spxianchou'), function (card, player, target) {
                        return target != player && target != _status.event.getTrigger().source;
                    }).set('ai', function (target) {
                        return get.attitude(target, _status.event.player) * Math.sqrt(target.countCards('he'));
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        event.target = target;
                        player.logSkill('spxianchou', target);
                        player.line2([target, trigger.source]);
                        target.chooseToDiscard('he', '是否弃置一张牌，视为对' + get.translation(trigger.source) + '使用一张【杀】？').set('ai', function (card) {
                            if (_status.event.goon) return 8 - get.value(card);
                            return 0;
                        }).set('goon', ((target.canUse('sha', trigger.source, false) ? get.effect(trigger.source, { name: 'sha', isCard: true }, target, target) : 0) + get.recoverEffect(player, target, target)) > 0);
                    }
                    else event.finish();
                    'step 2'
                    if (result.bool) {
                        if (target.canUse('sha', trigger.source, false)) target.useCard({ name: 'sha', isCard: true }, trigger.source, false);
                        else event.finish();
                    }
                    else event.finish();
                    'step 3'
                    if (target.hasHistory('sourceDamage', function (evt) {
                        var card = evt.card;
                        if (!card || card.name != 'sha') return false;
                        var evtx = evt.getParent('useCard');
                        return evtx.card == card && evtx.getParent() == event;
                    })) {
                        target.draw();
                        player.recover();
                    }
                },
            },
            sbwuxin: {
                audio: ['xinlianhuan', 1],
                audioname: ['ol_pangtong'],
                enable: 'chooseToUse',
                filter: function (event, player) {
                    return player.countCards('hs', { suit: 'heart' }) > 0;
                },
                filterCard: { suit: 'heart' },
                viewAs: { name: 'wuzhong' },
                prompt: '你可以将一张红桃牌当作无中生有使用',
                check: function (card) { return 7 - get.value(card) },
            },
            sbniepan: {
                audio: 'niepan',
                skillAnimation: true,
                animationStr: '涅盘',
                round: 1,
                animationColor: 'orange',
                enable: 'chooseToUse',
                init: function (player) {
                    player.storage.sbniepan = false;
                },
                filter: function (event, player) {
                    if (player.storage.sbniepan) return false;
                    if (event.type != 'dying') return false;
                    if (player != event.dying) return false;
                    return true;
                },
                content: function (event, player) {
                    'step 0'
                    player.discard(player.getCards('hej'));
                    player.storage.sbniepan = true;
                    'step 1'
                    player.link(false);
                    'step 2'
                    player.turnOver(false);
                    'step 3'
                    player.draw(5);
                    'step 4'
                    if (player.hp < 5 && player.countCards('h', { suit: "heart" }) > 0) {
                        player.recover(player.countCards('h', { suit: "heart" }))
                        player.storage.sbniepan = false
                    }
                },
                ai: {
                    order: 1,
                    save: true,
                    result: {
                        player: function (player) {
                            if (player.hp <= 0) return 10;
                            return 0;
                        }
                    },
                    threaten: function (player, target) {
                        if (!target.storage.sbniepan) return 0.6;
                    }
                },
            },
			feigong:{
                animationStr: '非攻',
				trigger: {  source:'damageBefore' },
				content: function () {
                    'step 0'
						player.chooseTarget(1,function(card,player,trigger){
							return trigger.hp !== trigger.maxHp
						})
					'step 1'
					if(result.bool){
						var r = result.targets[0]
						trigger.cancel();
						r.recover(Math.min(r.getDamagedHp(),trigger.num))
					}
                },
				ai:{
					effect:{
						threaten:1.1,
						player:function(card,player,target ){
							if(player.hp < player.maxHp -1) return 1.5
						},
						target:function(card,player,target){
							if(target.hp === 1) return 1.0
						}
					}
				}
			},
			jianyu:{
                animationStr: '箭雨',
				trigger: {  player:'phaseUseBegin' },
				direct:true,
                filter:function(event,player){
                    let r
                    let s = player.stat
                    for (let i = s.length - 2;i > 0;i--) {
                        if(s[i].isMe){
                            r = s[i]
                            break
                        }
                    }
                    if(!r){
                        return true
                    }
                    if(!r.damage){
                        return true
                    }
                    return  r.damage < 1
                },
				content:function(){
					player.chooseUseTarget({name:'wanjian',isCard:true},get.prompt('jianyu'),'视为使用一张【万箭齐发】').logSkill='jianyu';
				},
			},
            dunai:{
                animationStr: '毒奶',
                intro:{//标记介绍
                    name2:'毒奶',
                    content:'已有#层毒'
                },
                trigger: {  player:['phaseZhunbeiBegin','phaseJieshuBegin'] },  //回合开始阶段或回合结束阶段
                filter:function(event,player){
                    return player.countCards('h') > 0 // 手牌大于0才能发动
                },
                content:function(){//技能内容:
                    "step 0"
                    player.chooseToDiscard('h') // 选择弃置一张手牌
                    "step 1"
                    if(result.bool){ // 有没有弃置手牌
                        player.chooseTarget(true).set('ai', function (target) {
                            var att = get.attitude(_status.event.player, target);
                            if (att > 0) return att + 1;
                            if (att == 0) return Math.random();
                            return att;
                        }) // 选择目标
                    }
                    "step 2"
                    if(result.bool && result.targets && result.targets.length > 0){ // 是否选择了目标
                        let r = result.targets // 选择的目标数组
                        // trigger是选择的目标
                        r[0].addMark('dunai') // 给该角色加上一层毒奶标记
                    }
                },
                group:'dunai_duor', // 技能组，可以理解为有标记的人会触发的技能
                ai:{
                    effect:{
                        target:function(){
                            return -1
                        },
                        player:function(){
                            return 2
                        }
                    }
                }
            },
            dunai_duor:{
                    trigger:{//时机:
                        global:"phaseZhunbeiBegin",//准备阶段
                      },
                    forced:true,//锁定技
                    filter:function(event,player){ // 限定技能发动函数
                        return event.player&&event.player.hasMark('dunai')&& event.player.countMark('dunai') > 0; // 有毒奶才会发动这个技能
                    },
                    content:function(){// 技能内容
                        "step 0"
                        if(trigger.player.countMark('dunai') % 2 === 0){ // 毒奶标记为偶数
                            trigger.player.recover(trigger.player.countMark('dunai')) // 回复毒奶印记血量
                        }else{ // 毒奶标记为奇数
                            trigger.player.damage(trigger.player.countMark('dunai')) // 扣除毒奶印记血量
                        }
                        "step 1"
                        trigger.player.removeMark('dunai') // 毒奶标记减一
                        if(trigger.player.countMark('dunai') === 0){ // 毒奶标记为0
                            trigger.player.unmarkSkill('dunai') //移除毒奶标记
                        }
                    }
                },
                douguaishiming:{
                    forced:true,  //锁定技
                    trigger: {  player:['damageEnd'] },  //受到伤害时
                    filter:function(event,player){//发动限制条件
                        
                        return event.num > 1
                      },
                    content:function(){//技能内容:
                        "step 0"
                            player.chooseTarget(true).set('ai', function (target) {
                                var att = get.attitude(_status.event.player, target);
                                if (att > 0) return att + 1;
                                if (att == 0) return Math.random();
                                return att;
                            })
                        "step 1"
                            let r = result.targets // 选择的目标数组
                            r[0].addMark('dunai') // 给该角色加上一层毒奶标记
                    },
                    group:'dunai_duor', // 技能组，可以理解为有标记的人会触发的技能
                },
            guaishuai:{
                forced:true, 
                trigger:{global:'useCardToPlayered'},// 使用卡盘指定别人
                filter:function(event,player,game){
                    if(!event.isFirstTarget) return false;   //指定第一个目标时才发动，防止一个万剑摸14牌
                    //if(get.type(event.card)!='trick') return false;  //如果是锦囊牌
                    if(get.info(event.card).multitarget) return false;  //牌是多目标的牌
                    if(!event.targets.includes(player)) return false;  //目标有自己
                    if(event.targets.length<2) return false;   //目标数大于1
                    return player.hp>0;
                },
                content:function(){
                     player.draw(2);
                },
            },
            guaichu:{
                forced:true, 
                trigger:{player:'damageEnd'},// 受到伤害时
                filter:function(event,player,game){
                    if(_status.currentPhase!==player){ // 必须在自己回合内受到伤害才会触发
                        return false
                    }
                    return true
                },
                content:function(){
                     player.draw(2);
                },
            },
            guaimin: {
                forced: true,
                trigger:{global:'phaseDiscardAfter'},
                filter: function (event, player,) {
                    return event.player!=player; //不包含自己,则其他角色
                },
                content:function(){
                    player.addTempSkill('guaimin2','phaseBefore'); // 添加临时技能，直到回合结束
                },
            },
            guaimin2:{
                forced: true,
                trigger:{global:'drawAfter'},
                filter: function (event, player,) {
                    return event.player!=player; //不包含自己,则其他角色
                },
                content:function(){
                    player.draw(2);
                },
            },
            yanji:{
                enable:"phaseUse",//出牌阶段发动
                selectCard:1,//弃置一张
                position:'e',
                filterCard:function(card,player){
					return card==player.getEquip(3) || card==player.getEquip(4);  // 选择+马或-马
				},
                filter:function(event,player){
                    return player.getEquip(3) || player.getEquip(4)
                },
                filterTarget:function(card,player,target){
					return target!=player;
				},
				selectCard:1,
				selectTarget:-1,
                content:function(){//内容:
                    'step 0'
                    target.chooseCard(true,'he').set("prompt",'选择一张牌交给'+get.translation(player))
                    'step 1'
					if(result){
						player.gain(result.cards,target,'giveAuto');
					}
                },
                ai:{
                    basic:{
                        order:20
                    },
                    result:{//收益(只有主动技可以写)
                        player:1
                    },
                }
            },
            xunhua:{
				mod:{
					globalFrom:function(from,to,distance){
						return distance-game.countPlayer(function(current){
							return current.countCards('h') > 0;
						});
					},
				}
			},
            huanxie: {
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
                },
                ai:{
                    basic:{
                        order:20
                    },
                    player:function(player){
                        if(player.countCards('he','zhuge')) return 1
                        if(player.hp < 2) return 1
                        return -1
                    }
                }
            },
            yaowan: {
                forced: true,
                trigger:{player:'phaseJieshuBegin'},
                filter: function (event, player,) {
                    return !player.hasSkill('huanxie'); //不包含自己,则其他角色
                },
                content:function(){
                    player.die(); // 添加临时技能，直到回合结束
                },
            },
        },
        translate: {
            sp_yangwan: '手杀杨婉',
            spmingxuan: '瞑昡',
            spmingxuan_info: '锁定技。出牌阶段开始时，你须选择至多X张花色各不相同的手牌（X为未选择过选项一的角色），将这些牌随机交给这些角色中的等量角色。然后这些角色依次选择一项：⒈对你使用一张【杀】。⒉交给你一张牌，然后你摸一张牌。',
            spxianchou: '陷仇',
            spxianchou_info: '当你受到有来源的伤害后，你可选择一名不为伤害来源的其他角色。该角色可以弃置一张牌，然后视为对伤害来源使用一张【杀】（无距离限制）。若其因此【杀】造成了伤害，则其摸一张牌，你回复1点体力。',
            liucheng: '刘赪',
            splveying: '掠影',
            splveying_info: '锁定技。①每回合限两次，当你使用【杀】指定目标后，你获得一个“椎”。②当你使用的【杀】结算结束后，若你的“椎”数大于1，则你弃置两个“椎”，然后弃置所有目标角色的各一张手牌。',
            spyingwu: '莺舞',
            spyingwu_info: '若你拥有〖掠影〗，则：①每回合限两次，当你使用非伤害类普通锦囊牌指定目标后，你获得一个“椎”。②当你使用的非伤害类普通锦囊牌结算结束后，若你的“椎”数大于1，则你弃置两个“椎”，然后可以视为使用一张【杀】。',
            sb_huangzhong: '谋黄忠',
            sb_pangtong: '谋庞统',
            sbwuxin: "无心",
            sbwuxin_info: '你可以将一张红桃牌当作〖无中生有〗使用',
            sbniepan: "涅槃",
            sbniepan_info: "〖每轮限一次〗当你处于濒死阶段，你可以摸5张牌，若牌中有红桃牌，则你回复对应红桃牌数的血量",
            xushimin: '许市民',
			chenshuai:'陈帅',
			feigong:'非攻',
			feigong_info:'每当你对其他角色造成伤害后，你可以阻止该伤害，并令一名非满血玩家回复对应伤害的血量（若玩家损失血量小于对应伤害，则目标玩家回复至满血）',
			jianyu:'箭雨',
			jianyu_info:'若你的上一回合没有造成伤害，则出牌阶段开始时，你可以选择发动该技能，视为你使用一张【万箭齐发】',
            dachu:'大厨',
            dunai:'毒奶',
            dunai_info:'回合开始阶段或回合结束，你可以弃置一张手牌，然后指定一名角色，该角色获得一个“毒奶”标记。一名角色的回合开始阶段，若该角色有“毒奶”标记，当标记数为奇数时，对其造成标记数量的伤害；当标记数为偶数时，其回复标记数量的生命值，然后失去一个标记',
            douguaishiming:'都怪市民',
            douguaishiming_info:'【锁定技】当你受到大于1的伤害后，你需要指定一名角色，该角色获得一个“毒奶”标记。',
            mushuihan:"沐水涵",
            guaichu:"怪厨",
            guaichu_info:"你的回合内，你每受到一点伤害，你摸两张手牌",
            guaishuai:"怪帅",
            guaishuai_info:"当你成为牌目标时，若此牌目标大于1，你摸两张牌",
            guaimin:"怪民",
            guaimin_info:"当有其他角色在回合结束阶段摸牌时，你摸两张牌",
            biyue: "闭月",
            sbliegong: '烈弓',
            sbliegong_info: '①若你的装备区内没有武器牌，则你手牌区内所有【杀】的属性视为无属性。②当你使用牌时，或成为其他角色使用牌的目标后，你记录此牌的花色。③当你使用【杀】指定唯一目标后，若你〖烈弓②〗的记录不为空，则你可亮出牌堆顶的X张牌（X为你〖烈弓②〗记录过的花色数-1），令此【杀】的伤害值基数+Y（Y为亮出牌中被〖烈弓②〗记录过花色的牌的数量），且目标角色不能使用〖烈弓②〗记录过花色的牌响应此【杀】。此【杀】使用结算结束后，你清除〖烈弓②〗的记录。',
            sb_huaxiong: '谋华雄',
            sbyangwei: '扬威',
            sbyangwei_info: '出牌阶段，你可以摸两张牌，令此技能于你的下下个结束阶段前失效，且你获得如下效果直到回合结束：使用【杀】无距离限制，次数上限+1且无视防具。',
            sb_yujin: '谋于禁',
            sbxiayuan: '狭援',
            sbxiayuan_info: '每轮限一次。其他角色受到伤害后，若其因此伤害触发过护甲效果且其没有护甲，则你可弃置两张手牌，令其获得X点护甲（X为其因此伤害触发护甲效果而失去的护甲数量）。',
            sbjieyue: '节钺',
            sbjieyue_info: '结束阶段，你可以令一名其他角色获得1点护甲。然后其可以交给你一张牌。',
            gaohuan:'高欢',
            yanji:'严纪',
            yanji_info:'出牌阶段，你可以发动此技能，选择弃置一张装备牌里的马，然后让场上其他角色选择一张牌给你。',
            xunhua:'驯化',
            xunhua_info:'锁定技，你计算与其他角色的距离时-X。（X为场上拥有手牌数的玩家）',
            huanshi:'幻始',
            huanxie:'幻屑',
            huanxie_info:'【限定技】出牌阶段，你可以摸五张牌，然后弃置其他所有角色的所有牌',
            yaowan:'药丸',
            yaowan_info:'回合结束阶段，若你没有"幻屑技能"，则你死亡',
        },
    };
});

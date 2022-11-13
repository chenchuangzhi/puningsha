'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        //strategy and battle, "sb" in short
        name: 'daba',
        connect: true,
        character: {
            wuzhaoxiang: ['female', 'daba', 4, ['wufanghun', 'wufuhan']],
            weizhaoxiang: ['female', 'daba', 4, ['wufanghun', 'weifuhan']],
            fengdi: ["female", "daba", 4, ["ark_pojun", "ark_bitang"]],
            huafalin: ["female", "daba", 3, ["buwen2", "bangneng2", "shenji2"]],
            helage:["male","daba",3,["xianyue","qiusheng","tashijiangjun"]],
        },
        skill: {
            //赵襄
            wufuhan: {
                audio: 'fuhan',
                trigger: { player: 'phaseZhunbeiBegin' },
                unique: true,
                limited: true,
                skillAnimation: true,
                animationColor: 'orange',
                forceunique: true,
                filter: function (event, player) {
                    return player.countMark('fanghun') > 0;
                },
                content: function () {
                    'step 0'
                    if (player.storage.fanghun) player.draw(player.storage.fanghun);
                    player.removeMark('fanghun', player.storage.fanghun);
                    player.awakenSkill('wufuhan');
                    'step 1'
                    var list;
                    if (_status.characterlist) {
                        list = [];
                        for (var i = 0; i < _status.characterlist.length; i++) {
                            var name = _status.characterlist[i];
                            if (lib.character[name][1] == 'wu') list.push(name);
                        }
                    }
                    else if (_status.connectMode) {
                        list = get.charactersOL(function (i) {
                            return lib.character[i][1] != 'wu';
                        });
                    }
                    else {
                        list = get.gainableCharacters(function (info) {
                            return info[1] == 'wu';
                        });
                    }
                    var players = game.players.concat(game.dead);
                    for (var i = 0; i < players.length; i++) {
                        list.remove(players[i].name);
                        list.remove(players[i].name1);
                        list.remove(players[i].name2);
                    }
                    list.remove('zhaoyun');
                    list.remove('re_zhaoyun');
                    list.remove('ol_zhaoyun');
                    list = list.randomGets(Math.max(4, game.countPlayer()));
                    var skills = [];
                    for (var i of list) {
                        skills.addArray((lib.character[i][3] || []).filter(function (skill) {
                            var info = get.info(skill);
                            return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill;
                        }));
                    }
                    if (!list.length || !skills.length) { event.finish(); return; }
                    if (player.isUnderControl()) {
                        game.swapPlayerAuto(player);
                    }
                    var switchToAuto = function () {
                        _status.imchoosing = false;
                        event._result = {
                            bool: true,
                            skills: skills.randomGets(2),
                        };
                        if (event.dialog) event.dialog.close();
                        if (event.control) event.control.close();
                    };
                    var chooseButton = function (list, skills) {
                        var event = _status.event;
                        if (!event._result) event._result = {};
                        event._result.skills = [];
                        var rSkill = event._result.skills;
                        var dialog = ui.create.dialog('请选择获得至多两个技能', [list, 'character'], 'hidden');
                        event.dialog = dialog;
                        var table = document.createElement('div');
                        table.classList.add('add-setting');
                        table.style.margin = '0';
                        table.style.width = '100%';
                        table.style.position = 'relative';
                        for (var i = 0; i < skills.length; i++) {
                            var td = ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
                            td.link = skills[i];
                            table.appendChild(td);
                            td.innerHTML = '<span>' + get.translation(skills[i]) + '</span>';
                            td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                                if (_status.dragged) return;
                                if (_status.justdragged) return;
                                _status.tempNoButton = true;
                                setTimeout(function () {
                                    _status.tempNoButton = false;
                                }, 500);
                                var link = this.link;
                                if (!this.classList.contains('bluebg')) {
                                    if (rSkill.length >= 2) return;
                                    rSkill.add(link);
                                    this.classList.add('bluebg');
                                }
                                else {
                                    this.classList.remove('bluebg');
                                    rSkill.remove(link);
                                }
                            });
                        }
                        dialog.content.appendChild(table);
                        dialog.add('　　');
                        dialog.open();

                        event.switchToAuto = function () {
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing = false;
                        };
                        event.control = ui.create.control('ok', function (link) {
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing = false;
                        });
                        for (var i = 0; i < event.dialog.buttons.length; i++) {
                            event.dialog.buttons[i].classList.add('selectable');
                        }
                        game.pause();
                        game.countChoose();
                    };
                    if (event.isMine()) {
                        chooseButton(list, skills);
                    }
                    else if (event.isOnline()) {
                        event.player.send(chooseButton, list, skills);
                        event.player.wait();
                        game.pause();
                    }
                    else {
                        switchToAuto();
                    }
                    'step 2'
                    var map = event.result || result;
                    if (map && map.skills && map.skills.length) {
                        for (var i of map.skills) player.addSkillLog(i);
                    }
                    game.broadcastAll(function (list) {
                        game.expandSkills(list);
                        for (var i of list) {
                            var info = lib.skill[i];
                            if (!info) continue;
                            if (!info.audioname2) info.audioname2 = {};
                            info.audioname2.old_yuanshu = 'weidi';
                        }
                    }, map.skills);
                    'step 3'
                    if (player.isMinHp()) player.recover();
                },
            },
            weifuhan: {
                audio: 'fuhan',
                trigger: { player: 'phaseZhunbeiBegin' },
                unique: true,
                limited: true,
                skillAnimation: true,
                animationColor: 'orange',
                forceunique: true,
                filter: function (event, player) {
                    return player.countMark('fanghun') > 0;
                },
                content: function () {
                    'step 0'
                    if (player.storage.fanghun) player.draw(player.storage.fanghun);
                    player.removeMark('fanghun', player.storage.fanghun);
                    player.awakenSkill('weifuhan');
                    'step 1'
                    var list;
                    if (_status.characterlist) {
                        list = [];
                        for (var i = 0; i < _status.characterlist.length; i++) {
                            var name = _status.characterlist[i];
                            if (lib.character[name][1] == 'wei') list.push(name);
                        }
                    }
                    else if (_status.connectMode) {
                        list = get.charactersOL(function (i) {
                            return lib.character[i][1] != 'wei';
                        });
                    }
                    else {
                        list = get.gainableCharacters(function (info) {
                            return info[1] == 'wei';
                        });
                    }
                    var players = game.players.concat(game.dead);
                    for (var i = 0; i < players.length; i++) {
                        list.remove(players[i].name);
                        list.remove(players[i].name1);
                        list.remove(players[i].name2);
                    }
                    list.remove('zhaoyun');
                    list.remove('re_zhaoyun');
                    list.remove('ol_zhaoyun');
                    list = list.randomGets(Math.max(4, game.countPlayer()));
                    var skills = [];
                    for (var i of list) {
                        skills.addArray((lib.character[i][3] || []).filter(function (skill) {
                            var info = get.info(skill);
                            return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill;
                        }));
                    }
                    if (!list.length || !skills.length) { event.finish(); return; }
                    if (player.isUnderControl()) {
                        game.swapPlayerAuto(player);
                    }
                    var switchToAuto = function () {
                        _status.imchoosing = false;
                        event._result = {
                            bool: true,
                            skills: skills.randomGets(2),
                        };
                        if (event.dialog) event.dialog.close();
                        if (event.control) event.control.close();
                    };
                    var chooseButton = function (list, skills) {
                        var event = _status.event;
                        if (!event._result) event._result = {};
                        event._result.skills = [];
                        var rSkill = event._result.skills;
                        var dialog = ui.create.dialog('请选择获得至多两个技能', [list, 'character'], 'hidden');
                        event.dialog = dialog;
                        var table = document.createElement('div');
                        table.classList.add('add-setting');
                        table.style.margin = '0';
                        table.style.width = '100%';
                        table.style.position = 'relative';
                        for (var i = 0; i < skills.length; i++) {
                            var td = ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
                            td.link = skills[i];
                            table.appendChild(td);
                            td.innerHTML = '<span>' + get.translation(skills[i]) + '</span>';
                            td.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                                if (_status.dragged) return;
                                if (_status.justdragged) return;
                                _status.tempNoButton = true;
                                setTimeout(function () {
                                    _status.tempNoButton = false;
                                }, 500);
                                var link = this.link;
                                if (!this.classList.contains('bluebg')) {
                                    if (rSkill.length >= 2) return;
                                    rSkill.add(link);
                                    this.classList.add('bluebg');
                                }
                                else {
                                    this.classList.remove('bluebg');
                                    rSkill.remove(link);
                                }
                            });
                        }
                        dialog.content.appendChild(table);
                        dialog.add('　　');
                        dialog.open();

                        event.switchToAuto = function () {
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing = false;
                        };
                        event.control = ui.create.control('ok', function (link) {
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing = false;
                        });
                        for (var i = 0; i < event.dialog.buttons.length; i++) {
                            event.dialog.buttons[i].classList.add('selectable');
                        }
                        game.pause();
                        game.countChoose();
                    };
                    if (event.isMine()) {
                        chooseButton(list, skills);
                    }
                    else if (event.isOnline()) {
                        event.player.send(chooseButton, list, skills);
                        event.player.wait();
                        game.pause();
                    }
                    else {
                        switchToAuto();
                    }
                    'step 2'
                    var map = event.result || result;
                    if (map && map.skills && map.skills.length) {
                        for (var i of map.skills) player.addSkillLog(i);
                    }
                    game.broadcastAll(function (list) {
                        game.expandSkills(list);
                        for (var i of list) {
                            var info = lib.skill[i];
                            if (!info) continue;
                            if (!info.audioname2) info.audioname2 = {};
                            info.audioname2.old_yuanshu = 'weidi';
                        }
                    }, map.skills);
                    'step 3'
                    if (player.isMinHp()) player.recover();
                },
            },
            wufanghun: {
                mod: {
                    aiValue: function (player, card, num) {
                        if (card.name != 'sha' && card.name != 'shan') return;
                        var geti = function () {
                            var cards = player.getCards('hs', function (card) {
                                return card.name == 'sha' || card.name == 'shan';
                            });
                            if (cards.contains(card)) {
                                return cards.indexOf(card);
                            }
                            return cards.length;
                        };
                        return Math.max(num, [7, 5, 5, 3][Math.min(geti(), 3)]);
                    },
                },
                locked: false,
                audio: 'fanghun',
                inherit: 'fanghun',
                trigger: {
                    player: 'useCard',
                    target: 'useCardToTargeted',
                },
            },
            //风笛
            "ark_pojun": {
                trigger: { player: "useCardToBegin" },
                logTarget: "target",
                filter: function (evt) {
                    return evt.target && evt.card && evt.card.name == "sha" && evt.target.countCards('h');
                },
                check: function (evt, me) {
                    var noh = evt.target.hasSkillTag("noh", false, {
                        target: me,
                        cards: evt.target.get("h"),
                    }, true), att = get.attitude(me, evt.target);
                    if (att > 0 && noh === true) return true;
                    if (att < 0 && noh === true) return evt.target.countCards("h") / 2 > evt.target.hp;
                    if (att <= 0 && noh !== true) return true;
                    return false;
                },
                content: function () {
                    "step 0"
                    var hs = trigger.target.getCards('h');
                    hs.sort(function (a, b) {
                        return get.value(b, player) - get.value(a, player);
                    });
                    trigger.target.chooseCard([1, hs.length], "请分配你的手牌(选择的卡牌为第一份，未选择的为第二份)").set('ai', function (card) {
                        var rand = _status.event.rand;
                        var list = _status.event.list;
                        if (_status.event.att) {
                            if (ui.selected.cards.length >= Math.ceil(list.length / 2)) return 0;
                            var value = get.value(card);
                            return 9 - value;
                        }
                        if (ui.selected.cards.length >= Math.floor(list.length / 2)) return 0;
                        return (list.indexOf(card) % 2 == rand) ? 1 : 0;
                    }).set('rand', (Math.random() < 0.6) ? 1 : 0).set('list', hs).set('att', get.attitude(trigger.target, player) > 0);
                    "step 1"
                    event.cards1 = result.cards || [];
                    event.cards2 = trigger.target.getCards('h', function (card) {
                        return !event.cards1.contains(card);
                    });
                    "step 2"
                    var num1 = event.cards1.length, num2 = event.cards2.length;
                    event.videoId = lib.status.videoId++;
                    var d = function (id, event) {
                        var dialog = ui.create.dialog("【" + get.translation(event.name) + "】", 'forcebutton');
                        dialog.addText('要弃置哪份牌？');
                        var table = ui.create.div({
                            margin: '2%',
                            width: '80%',
                            height: "120px",
                            textAlign: 'center',
                            position: 'relative',
                            background: "rgba(0,0,0,0.3)",
                            boxShadow: "rgba(0, 0, 0, 0.4) 0 0 0 1px",
                            borderRadius: "6px",
                            transition: "all 0.3s",
                            overflow: "auto",
                            whiteSpace: "nowrap"
                        });
                        table.classList.add('add-setting');
                        table.addEventListener("wheel", function (e) {
                            e.preventDefault();
                            table.scrollLeft += e.deltaY;
                        });
                        Object.assign(dialog.style, {
                            background: "rgba(0,0,0,0.2)",
                            boxShadow: "rgba(0, 0, 0, 0.3) 0 0 0 1px",
                            borderRadius: "6px",
                        });
                        table.innerHTML = "<span style=position:fixed;left:35%;>第一份牌(共" + get.cnNumber(event.cards1.length) + "张)</span><br>";
                        var table2 = table.cloneNode(true);
                        table2.innerHTML = "<span style=position:fixed;left:35%;>第二份牌(共" + get.cnNumber(event.cards2.length) + "张)</span><br>";
                        dialog.add(table);
                        dialog.add(table2);
                        for (var i of event.cards1) ui.create.button(null, "blank", table);
                        for (var i of event.cards2) ui.create.button(null, "blank", table2);
                        dialog.videoId = id;
                    };
                    if (player.isOnline()) player.send(d, event.videoId, event);
                    if (event.isMine()) d(event.videoId, event);
                    player.chooseControl("第一份", "第二份").set('choice', num1 > num2 ? 0 : 1);
                    "step 3"
                    if (result.index > -1) trigger.target.discard(event["cards" + (result.index + 1)] || []);
                    game.broadcastAll('closeDialog', event.videoId);
                }
            },

            "ark_bitang": {
                subSkill: {
                    sha: {
                        mod: {
                            cardUsable: function (card) {
                                if (card.name == 'sha') return Infinity;
                            },
                        },
                        mark: true,
                        intro: {
                            content: "使用【杀】无次数限制",
                        },
                        sub: true,
                    },
                    a: { sub: true },
                },
                trigger: {
                    player: "useCard",
                },
                forced: true,
                filter: function (event, player, _, skill) {
                    return !player.hasSkill(skill + '_a') && event.card.name == 'sha' && player.isPhaseUsing();
                },
                content: function () {
                    'step 0'
                    if (!player.hasSkill('ark_bitang_sha')) {
                        player.addTempSkill('ark_bitang_sha');
                        event.finish();
                    };
                    'step 1'
                    player.chooseToDiscard('he', { subtype: 'equip1' }, '请弃置一张武器牌或失去一点体力').set('ai', function (card) {
                        var player = get.player();
                        return player.hasSha() ? 8 - get.value(card) : player.hp > 2 ? 0 : 100 - get.value(card);
                    });
                    'step 2'
                    if (!result.cards) {
                        player.loseHp();
                        player.addTempSkill(event.name + '_a');
                        player.removeSkill(event.name + '_sha', true);
                    };
                },
                ai: {
                    effect: {
                        player: function (card, player, target) {
                            if (get.name(card) == 'sha' && player.hp < 3 && player.hasSkill('ark_bitang_sha') && !player.getEquip(1)) return [0, -1, 0, -1];
                        },
                    },
                },
            },
            //华法琳
            buwen2: {
                group: ['manjia1', 'manjia2']
            },
            manjia1: {
                trigger: { target: ['useCardToBefore', 'shaBegin'] },
                forced: true,
                priority: 6,
                filter: function (event, player, name) {
                    if (name == 'shaBegin') return lib.skill.tengjia3.filter(event, player);
                    return lib.skill.tengjia1.filter(event, player);
                },
                content: function () {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target: function (card, player, target, current) {

                            return lib.skill.tengjia1.ai.effect.target.apply(this, arguments);
                        }
                    }
                }
            },
            manjia2: {
                trigger: { player: 'damageBegin3' },
                filter: function (event, player) {

                    if (event.nature == 'fire') return true;
                },
                forced: true,
                check: function () {
                    return false;
                },
                content: function () {
                    trigger.num++;
                },
                ai: {
                    effect: {
                        target: function (card, player, target, current) {

                            return lib.skill.tengjia2.ai.effect.target.apply(this, arguments);
                        }
                    }
                }
            },
            bangneng2: {
                trigger: { global: 'useCard' },
                filter: function (event, player) {
                    return event.card.name == 'sha' && event.player != player &&
                        player.countCards('h') > 0;
                },
                content: function () {
                    'step 0'
                    player.chooseCard('选择一张牌置于牌堆顶','he',true);
                    'step 1'
                    player.lose(result.cards,ui.cardPile,'insert');
                    player.draw(1, 'bottom');
                },
            },
            shenji2: {
                enable: "phaseUse",
                usable: 1,
                filter: function (event, player) {
                    return player.countCards('h') > 0;
                },
                content: function () {
                    "step 0"
                    player.chooseToDiscard('h') // 选择弃置一张手牌
                    "step 1"
                    if(result.bool){ // 有没有弃置手牌
                        player.chooseTarget(true) // 选择目标
                    }
                    "step 2"
                    if(result.bool && result.targets && result.targets.length > 0){ // 是否选择了目标
                        let r = result.targets // 选择的目标数组
                        // trigger是选择的目标
                        r[0].addSkill("wusheng") // 给该角色增加神技
                    }
                },
            },

            xianyue: {
                mod: {
                    globalFrom: function (player, target, distance) {
                        if (!player.getEquip(1)) return distance - 2;
                    },
                },
                trigger: {
                    source: "damageSource",
                },
                forced: true,
                filter: function (event, player) {
                    return player.isDamaged() && event.card && event.card.name == 'sha';
                },
                content: function () {
                    player.recover(trigger.num);
                },
            },
            qiusheng: {
                mod: {
                    cardUsable: function (card, player, num) {
                        if (card.name == 'sha') {
                            return num + player.getDamagedHp();
                        }
                    },
                },
                trigger: {
                    player: "dying",
                },
                usable: 1,
                forced: true,
                content: function () {
                    'step 0'
                    player.draw(4);
                    var stat = player.getStat();
                    stat.card = {};
                    for (var i in stat.skill) {
                        var bool = false;
                        var info = lib.skill[i];
                        if (info.enable != undefined) {
                            if (typeof info.enable == 'string' && info.enable == 'phaseUse') bool = true;
                            else if (typeof info.enable == 'object' && info.enable.contains('phaseUse')) bool = true;
                        }
                        if (bool) stat.skill[i] = 0;
                    }
                    'step 1'
                    player.phaseUse();
                },
            },
            tashijiangjun: {
                trigger: {
                    player: "recoverBegin",
                },
                forced: true,
                filter: function (event, player) {
                    if (event.getParent(2).skill == 'xianyue') return false;
                    return true;
                },
                content: function () {
                    trigger.cancel();
                },
                ai:{
                    hpUnRe:true,
                },
            },

        },
        translate: {
            wuzhaoxiang: '吴赵襄',
            weizhaoxiang: '魏赵襄',
            wufanghun: '芳魂',
            wufanghun_info: '当你使用【杀】或成为【杀】的目标后，你获得1个“梅影”标记；你可以移去1个“梅影”标记来发动〖龙胆〗并摸一张牌。',
            wufuhan: '扶汉',
            wufuhan_info: '限定技，回合开始时，你可以移去所有"梅影"标记并摸等量的牌，然后从X张吴势力武将牌中选择并获得至多两个技能（限定技、觉醒技、隐匿技、使命技、主公技除外）。若此时你是体力值最低的角色，你回复1点体力（X为场上角色数，且X∈[4,+∞)）。',
            weifuhan: '扶汉',
            weifuhan_info: '限定技，回合开始时，你可以移去所有"梅影"标记并摸等量的牌，然后从X张魏势力武将牌中选择并获得至多两个技能（限定技、觉醒技、隐匿技、使命技、主公技除外）。若此时你是体力值最低的角色，你回复1点体力（X为场上角色数，且X∈[4,+∞)）。',
            fengdi: '风笛',
            "ark_pojun": "破军",
            "ark_pojun_info": "当你使用【杀】指定一个目标后，你可以令其将手牌分为两份，然后你弃置其中的一份。",
            "ark_bitang": "闭膛",
            "ark_bitang_info": "锁定技，你使用【杀】无次数限制，然后当你在出牌阶段使用超过一张杀后，须在该【杀】结算后选择一项：①弃置一张武器牌；②失去1点体力，且本回合此技能失效。",
            huafalin: '华法琳',
            buwen2: '不稳定血浆',
            buwen2_info: '锁定技，你视为装备着藤甲',
            bangneng2: '帮能',
            bangneng2_info: '当其他角色使用杀时，你可以将一张牌置于牌堆顶，然后从牌堆底摸一张牌',
            shenji2: '神技',
            shenji2_info: '出牌阶段限一次，你可以弃置一张牌，并指定一名角色，该角色获取将红牌当杀的神技',
            helage:'赫拉格',
            xianyue: "弦月",
            xianyue_info: "锁定技，你造成伤害时回复1点体力。当你的体力不以此法回复时，防止之。",
            qiusheng: "求生",
            qiushengi_info: "全名求生剑法，锁定技，出牌阶段，你可额外使用X张【杀】（X为你已损体力值）。你进入濒死状态时摸四张牌，并开始一个独立的出牌阶段。",
            tashijiangjun: "他是将军！",
            tashijiangjun_info: "",
        },
    };
});

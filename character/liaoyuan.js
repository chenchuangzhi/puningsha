'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        name: 'liaoyuan',
        connect: true,
        character: {
            huanshi3:['male','liaoyuan2',4,['huanxie3','yaowan3']],
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
        },
        translate: {
            huanshi3:'幻始3',
            huanxie3:'幻屑',
            huanxie3_info:'【限定技】出牌阶段，你可以摸五张牌，然后弃置所有角色的所有手牌和装备牌',
            yaowan3:'药丸',
            yaowan3_info:'回合结束阶段，若你没有"幻屑技能"，则你死亡',
        },
    };
});

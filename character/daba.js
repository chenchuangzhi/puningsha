'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        //strategy and battle, "sb" in short
        name: 'daba',
        connect: true,
        character: {
            huanshi2:['male','daba',4,['huanxie2','yaowan2']],
        },
        skill: {
            huanxie2: {
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
            yaowan2: {
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
            huanshi2:'幻始2',
            huanxie2:'幻屑',
            huanxie2_info:'【限定技】出牌阶段，你可以摸五张牌，然后弃置所有角色的所有手牌和装备牌',
            yaowan2:'药丸',
            yaowan2_info:'回合结束阶段，若你没有"幻屑技能"，则你死亡',
        },
    };
});

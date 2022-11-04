'use strict';
game.import('character', function (lib, game, ui, get, ai, _status) {
    return {
        //strategy and battle, "sb" in short
        name: 'daba',
        connect: true,
        character: {
            wuzhaoxiang:['female','daba',4,['refanghun','wufuhan']],
        },
        skill: {
            wufuhan:{
                audio:'fuhan',
                trigger:{player:'phaseZhunbeiBegin'},
                unique:true,
                limited:true,
                skillAnimation:true,
                animationColor:'orange',
                forceunique:true,
                filter:function(event,player){
                    return player.countMark('fanghun')>0;
                },
                content:function(){
                    'step 0'
                    if(player.storage.fanghun) player.draw(player.storage.fanghun);
                    player.removeMark('fanghun',player.storage.fanghun);
                    player.awakenSkill('wufuhan');
                    'step 1'
                    var list;
                    if(_status.characterlist){
                        list=[];
                        for(var i=0;i<_status.characterlist.length;i++){
                            var name=_status.characterlist[i];
                            if(lib.character[name][1]=='wu') list.push(name);
                        }
                    }
                    else if(_status.connectMode){
                        list=get.charactersOL(function(i){
                            return lib.character[i][1]!='wu';
                        });
                    }
                    else{
                        list=get.gainableCharacters(function(info){
                            return info[1]=='wu';
                        });
                    }
                    var players=game.players.concat(game.dead);
                    for(var i=0;i<players.length;i++){
                        list.remove(players[i].name);
                        list.remove(players[i].name1);
                        list.remove(players[i].name2);
                    }
                    list.remove('zhaoyun');
                    list.remove('re_zhaoyun');
                    list.remove('ol_zhaoyun');
                    list=list.randomGets(Math.max(4,game.countPlayer()));
                    var skills=[];
                    for(var i of list){
                        skills.addArray((lib.character[i][3]||[]).filter(function(skill){
                            var info=get.info(skill);
                            return info&&!info.zhuSkill&&!info.limited&&!info.juexingji&&!info.hiddenSkill&&!info.charlotte&&!info.dutySkill;
                        }));
                    }
                    if(!list.length||!skills.length){event.finish();return;}
                    if(player.isUnderControl()){
                        game.swapPlayerAuto(player);
                    }
                    var switchToAuto=function(){
                        _status.imchoosing=false;
                        event._result={
                            bool:true,
                            skills:skills.randomGets(2),
                        };
                        if(event.dialog) event.dialog.close();
                        if(event.control) event.control.close();
                    };
                    var chooseButton=function(list,skills){
                        var event=_status.event;
                        if(!event._result) event._result={};
                        event._result.skills=[];
                        var rSkill=event._result.skills;
                        var dialog=ui.create.dialog('请选择获得至多两个技能',[list,'character'],'hidden');
                        event.dialog=dialog;
                        var table=document.createElement('div');
                        table.classList.add('add-setting');
                        table.style.margin='0';
                        table.style.width='100%';
                        table.style.position='relative';
                        for(var i=0;i<skills.length;i++){
                            var td=ui.create.div('.shadowed.reduce_radius.pointerdiv.tdnode');
                            td.link=skills[i];
                            table.appendChild(td);
                            td.innerHTML='<span>'+get.translation(skills[i])+'</span>';
                            td.addEventListener(lib.config.touchscreen?'touchend':'click',function(){
                                if(_status.dragged) return;
                                if(_status.justdragged) return;
                                _status.tempNoButton=true;
                                setTimeout(function(){
                                    _status.tempNoButton=false;
                                },500);
                                var link=this.link;
                                if(!this.classList.contains('bluebg')){
                                    if(rSkill.length>=2) return;
                                    rSkill.add(link);
                                    this.classList.add('bluebg');
                                }
                                else{
                                    this.classList.remove('bluebg');
                                    rSkill.remove(link);
                                }
                            });
                        }
                        dialog.content.appendChild(table);
                        dialog.add('　　');
                        dialog.open();

                        event.switchToAuto=function(){
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing=false;
                        };
                        event.control=ui.create.control('ok',function(link){
                            event.dialog.close();
                            event.control.close();
                            game.resume();
                            _status.imchoosing=false;
                        });
                        for(var i=0;i<event.dialog.buttons.length;i++){
                            event.dialog.buttons[i].classList.add('selectable');
                        }
                        game.pause();
                        game.countChoose();
                    };
                    if(event.isMine()){
                        chooseButton(list,skills);
                    }
                    else if(event.isOnline()){
                        event.player.send(chooseButton,list,skills);
                        event.player.wait();
                        game.pause();
                    }
                    else{
                        switchToAuto();
                    }
                    'step 2'
                    var map=event.result||result;
                    if(map&&map.skills&&map.skills.length){
                        for(var i of map.skills) player.addSkillLog(i);
                    }
                    game.broadcastAll(function(list){
                        game.expandSkills(list);
                        for(var i of list){
                            var info=lib.skill[i];
                            if(!info) continue;
                            if(!info.audioname2) info.audioname2={};
                            info.audioname2.old_yuanshu='weidi';
                        }
                    },map.skills);
                    'step 3'
                    if(player.isMinHp()) player.recover();
                },
            },
            refanghun:{
                mod:{
                    aiValue:function(player,card,num){
                        if(card.name!='sha'&&card.name!='shan') return;
                        var geti=function(){
                            var cards=player.getCards('hs',function(card){
                                return card.name=='sha'||card.name=='shan';
                            });
                            if(cards.contains(card)){
                                return cards.indexOf(card);
                            }
                            return cards.length;
                        };
                        return Math.max(num,[7,5,5,3][Math.min(geti(),3)]);
                    },
                },
                locked:false,
                trigger:{
                    player:'useCard',
                    target:'useCardToTargeted',
                },
            },
        },
        translate: {
            wuzhaoxiang: '吴赵襄',
            refanghun:'芳魂',
            refanghun_info:'当你使用【杀】或成为【杀】的目标后，你获得1个“梅影”标记；你可以移去1个“梅影”标记来发动〖龙胆〗并摸一张牌。',
            wufuhan:'扶汉',
            wufuhan_info:'限定技，回合开始时，你可以移去所有"梅影"标记并摸等量的牌，然后从X张吴势力武将牌中选择并获得至多两个技能（限定技、觉醒技、隐匿技、使命技、主公技除外）。若此时你是体力值最低的角色，你回复1点体力（X为场上角色数，且X∈[4,+∞)）。',
        },
    };
});

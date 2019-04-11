// ==UserScript==
// @name         Unipus Answer Viewer
// @name:zh-CN   Unipus视听说答案显示
// @namespace    askar882
// @version      0.1
// @description  Automatically adds a view containing answers to the questions.
// @description:zh-CN   在练习页面添加一个包含答案的悬浮窗，适用于西北工业大学视听说平台。
// @author       askar882
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/askar882/Unipus/master/Unipus%20Answer%20Viewer.user.js
// @compatible   Chrome
// @match        *://10.81.0.88/book/book182/app_index.php?unit=*
// @run-at       url_change
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener('hashchange', showAnswer, false);
    showAnswer();

    function showAnswer() {
        try {
            var param = document.location.toString().split('?')[1];
            var unitId = param.match(/=(\d+)#/)[1];
            var sectionId = param.match(/S(\d+)_/)[1];
            var sisterId = param.match(/_(\d+)/)[1];
            $.ajax({
                type: "post",
                url: "initPage.php",
                dataType: "json",
                data: {
                    UnitID: unitId,
                    SectionID: sectionId,
                    SisterID: sisterId
                },
                error: function(e) {
                    if(typeof e !== 'string') {
                        console.log('Request error: '+JSON.stringify(e, null, 2));
                    }
                    else {
                        console.log('Request error: '+e);
                    }
                },
                success: function(d) {
                    /*alert(JSON.stringify(d, null, 2));*/
                    var rdiv = document.createElement('div');
                    var draggable = document.createElement('div');
                    rdiv.id = 'rdiv';
                    rdiv.setAttribute('style', 'top: 50%; left: 50%; padding: not(:first-child) 24px; margin: 0 auto; border-radius: 4px; box-shadow: 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12); position: absolute; background: #fff; text-align: center; width: 250px; max-width: 100%; min-height: 200px;');
                    draggable.setAttribute('style', 'background: inherit; width: 100%; height: 25px; cursor: move; margin-top: 10px; font-size: x-large');
                    draggable.innerText = 'Answer';
                    var p = document.createElement('p');
                    p.setAttribute('style', 'margin: 10px 0 10px 0;');
                    var ans = '';
                    var key = d.key.split('^');window.key=key;
                    console.log('d='+JSON.stringify(d)+'\nkey='+key+'('+typeof(key)+')');
                    var body = document.getElementsByTagName('body')[0];
                    if($('#rdiv').length){
                        rdiv.style.top = $('#rdiv').offset().top + 'px';
                        rdiv.style.left = $('#rdiv').offset(). left + 'px';
                        $('#rdiv').remove();
                    }
                    if(typeof(key) === 'undefined' || key == null || key == '') {
                        return;
                    }
                    for(var i = 0; i < key.length; i++) {
                        //ans += (i+1) + '.' + key[i] + '<br>';
                        ans += String.fromCharCode(9312+i) + ' ' + key[i] + '<br>';
                    }
                    p.innerHTML = ans;
                    rdiv.appendChild(draggable);
                    rdiv.appendChild(p);

                    //@Reference: http://jsrun.net/pmkKp/edit
                    var _drag = {};
                    _drag.top = 0; //拖动过的位置距离上边
                    _drag.left = 0; //拖动过的位置距离左边
                    //_drag.maxLeft; //距离左边最大的距离
                    //_drag.maxTop; //距离上边最大的距离
                    _drag.dragging = false; //是否拖动标志
                    //拖动函数
                    var winWidth = $(window).width(),//浏览器可视窗口的宽度
                        winHeight = $(window).height(),//浏览器可视窗口的高度
                        objWidth = $(rdiv).outerWidth(),//元素的宽(包含width+padding+border)
                        objHeight = $(rdiv).outerHeight();
                    //_drag.maxLeft = winWidth - objWidth;
                    //_drag.maxTop = winHeight - objHeight;
                    var els = rdiv.style,
                        x = 0,
                        y = 0;
                    var objTop = $(rdiv).offset().top,
                        objLeft = $(rdiv).offset().left;
                    $(draggable).mousedown(function(e) {
                        rdiv.style.position = 'absolute';
                        _drag.dragging = true;
                        _drag.isDragged = true;
                        x = e.clientX - rdiv.offsetLeft;
                        y = e.clientY - rdiv.offsetTop;
                        draggable.setCapture && draggable.setCapture();//捕获鼠标
                        $(document).bind('mousemove', mouseMove).bind('mouseup', mouseUp);
                        return false;
                    });
                    function mouseMove(e) {
                        e = e || window.event;
                        if(_drag.dragging) {
                            _drag.top = e.clientY - y;
                            _drag.left = e.clientX - x;
                            //_drag.top = _drag.top > _drag.maxTop ? _drag.maxTop : _drag.top;
                            //_drag.left = _drag.left > _drag.maxLeft ? _drag.maxLeft : _drag.left;
                            _drag.top = _drag.top < 0 ? 0 : _drag.top;
                            _drag.left = _drag.left < 0 ? 0 : _drag.left;
                            els.top = _drag.top + 'px';
                            els.left = _drag.left + 'px';
                            return false;
                        }
                    }

                    function mouseUp(e) {
                        _drag.dragging = false;
                        draggable.releaseCapture && draggable.releaseCapture();
                        e.cancelBubble = true;
                        $(document).unbind('mousemove', mouseMove).unbind('mouseup', mouseUp);
                    }
                    $(window).resize(function() {
                        var winWidth = $(window).width(),
                            winHeight = $(window).height(),
                            el = $(rdiv),
                            elWidth = el.outerWidth(),
                            elHeight = el.outerHeight(),
                            elLeft = parseFloat(el.css('left')),
                            elTop = parseFloat(el.css('top'));
                        _drag.maxLeft = winWidth - elWidth;
                        _drag.maxTop = winHeight - elHeight;
                        _drag.top = _drag.maxTop < elTop ? _drag.maxTop : elTop;
                        _drag.left = _drag.maxLeft < elLeft ? _drag.maxLeft : elLeft;
                        el.css({
                            top: _drag.top,
                            left: _drag.left
                        })
                    })
                    $(window).scroll(function() {
                        rdiv.style.position = 'fixed';
                    })

                    body.appendChild(rdiv);
                }
            });
        } catch(e) {
            if(typeof e !== 'string') {
                console.log('Error: '+JSON.stringify(e, null, 2));
            }
            else {
                console.log('Error: '+e);
            }
        }
    }
})();

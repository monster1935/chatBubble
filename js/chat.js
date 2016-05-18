(function(){



	//util
	var EventUtil={
		//获取DOM对象
		get:function(selector){
			return document.getElementById(selector);	
		},
	   	addHandler:function(obj, type, handler, scope){
	   		function fn(event) { 
				var evt = event ? event : window.event; 
				evt.target = event.target || event.srcElement; 
				return handler.apply(scope || this,arguments); 
			} 
			//这里为需要注册事件处理程序的对象定义一个保存事件的hash对象，并把事件处理程序和作用域保存在该事件类型的队列里面 
			obj.eventHash = obj.eventHash || {};
			(obj.eventHash [type] = obj.eventHash [type] || []).push({ "name": type, "handler": handler, "fn": fn, "scope": scope }); 
			if (obj.addEventListener) { 
				obj.addEventListener(type, fn, false); 
			} else if (obj.attachEvent) { 
				obj.attachEvent("on" + type, fn); 
			} else { 
				obj["on" + type] = fn; 
			} 
	   	},
	   	removeHandler:function(obj, type, handler, scope){
	   		obj.eventHash = obj.eventHash || {}; 
			var evtList = obj.eventHash [type] || [], len = evtList.length; 
			if (len > 0) { 
				for (; len--; ) { 
					var curEvtObj = evtList[len]; 
					if (curEvtObj.name == type && curEvtObj.handler === handler && curEvtObj.scope === scope) { 
						if (obj.removeEventListener) { 
							obj.removeEventListener(type, curEvtObj.fn, false); 
						} else if (obj.detachEvent) { 
							obj.detachEvent("on" + type, curEvtObj.fn); 
						} else { 
							obj["on" + type] = null; 
						} 
						evtList.splice(len, 1); 
						break; 
					} 
				} 
			} 
	   	},
	   	getTime:function(fmt){
		    var date=new Date();
		    var o = {
		        "M+": date.getMonth() + 1,
		        // 月份
		        "d+": date.getDate(),
		        // 日
		        "h+": date.getHours(),
		        // 小时
		        "m+": date.getMinutes(),
		        // 分
		        "s+": date.getSeconds(),
		        // 秒
		        "q+": Math.floor((date.getMonth() + 3) / 3),
		        // 季度
		        "S": date.getMilliseconds()
		        // 毫秒
		    };
		    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		    for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		    return fmt;
		},
		random:function(start,end){
			return Math.floor(Math.random()*(end-start+1)+start);
		}


	};
	//日志输出
	window.log=function(){
		var args=Array.prototype.slice.call(arguments);
	    args.unshift("%c[webchat]: ","color:green");
	    console.log.apply(console,args);
	};

	//模拟聊天逻辑实现
	var chatMsg=[
		"你好，干嘛呢？",
		"是吗，我的天那。",
		"你怎么知道的？",
		"你是做什么的，多大了？",
		"我叫不知道，嘿嘿"

	];
	//绑定界面动作
	var emojiWrapper=EventUtil.get('emoji');
	EventUtil.addHandler(emoji,'click',onEmojiClick,this);

	var messageInput=EventUtil.get('messageInput');
	EventUtil.addHandler(messageInput,'keydown',onMessageKeyDown,this);

	var sendBtn=EventUtil.get('sendBtn');
	EventUtil.addHandler(sendBtn,'click',onSendClick,this);

	var sendImage=EventUtil.get('sendImage');
	EventUtil.addHandler(sendImage,'change',onSendImageChange,this);

	var sendFile=EventUtil.get('sendFile');
	EventUtil.addHandler(sendFile,'change',onSendFileChange,this);

	var clearBtn=EventUtil.get('clearBtn');
    EventUtil.addHandler(clearBtn,'click',onClearClick,this);


    var body=document.body;
    EventUtil.addHandler(body,'click',onBodyClick,this);

    var emojiWrapper=EventUtil.get('emojiWrapper');
    EventUtil.addHandler(emojiWrapper,'click',onEmojiWrapperClick,this);


    //初始化表情
    _initialEmoji();




	//事件处理函数
	function onEmojiClick(e){
		var emojiWrapper=EventUtil.get('emojiWrapper');
        emojiWrapper.style.display='block';
        e.stopPropagation();
	}
	function onMessageKeyDown(e){
		//判断是否是enter键被按下
		if(e.keyCode==13&& e.ctrlKey){
            messageInput.innerHTML+="<br/>";
        }else if(e.keyCode==13){
            e.preventDefault();
            onSendClick();
            
        }
	}
	function onSendClick(){
		//获取输入框中的内容
		var msg=messageInput.innerHTML;
		if(msg!="" || msg.length!=0){

			//相关发送逻辑
			
			//展示相关内容
			_displayNewMsg(msg,"send");
			setTimeout(function(){
				_displayNewMsg(chatMsg[EventUtil.random(0,chatMsg.length-1)],"receive");
			},1000);
			//清除发送框中的内容。
			messageInput.innerHTML="";
		}else{
			_showWarning();
		}
	}
	function onSendImageChange(){}
	function onSendFileChange(){}
	function onClearClick(){
		EventUtil.get('history').innerHTML="";
	}
	//点击窗口其他地方的时候，隐藏表情区域
	function onBodyClick(e){
		var emojiWrapper=EventUtil.get('emojiWrapper');
        target=e.target||e.srcElement;
        if(e.target!==emojiWrapper){
            emojiWrapper.style.display="none";
        }
	}
	function onEmojiWrapperClick(e){
		var target=e.target||e.srcElement;
		if(target.nodeName.toLowerCase()=="img"){
		    var msgInput=EventUtil.get('messageInput');
		    msgInput.focus();
		    var msg=_showEmoji(msgInput.innerHTML+"[emoji:"+target.title+"]");
		    msgInput.innerHTML=msg;
		    
		}
	}

	//辅助函数
	

	function _displayNewMsg(msg,flag){
		//添加事件显示
		_displayTime();

		var rol=(flag=="send");
		
		//展示在右边
		var container=EventUtil.get('history');
		//添加头像
		var img =document.createElement('div');

		img.className=rol ? "imgRight" :"imgLeft";
		container.appendChild(img);
		//添加小箭头
		var arrowRight=document.createElement('div');
		arrowRight.className=rol ? "arrowRight" : "arrowLeft";
		container.appendChild(arrowRight);
		//添加内容区域
		var content=document.createElement('div');
		content.className= rol ? 'send' : "receive";
		msg = _showEmoji(msg);
		content.innerHTML=msg;
		container.appendChild(content);
		//添加清除浮动
		var clearfloat=document.createElement('div');
		clearfloat.className='clearfloat';
		container.appendChild(clearfloat);
		container.scrollTop = container.scrollHeight;
		

	}
	function _displayTime(){
		//创建一个div用来展示时间
		var container=EventUtil.get('history');
		var time=document.createElement('div');
		time.className='time';
		time.innerHTML=EventUtil.getTime("hh:mm:ss");
		container.appendChild(time);

	}
	//初始化表情
	function _initialEmoji(){
		var emojiContainer = EventUtil.get('emojiWrapper'),
		docFragment = document.createDocumentFragment();
		for (var i = 75; i > 0; i--) {
		    var emojiItem = document.createElement('img');
		    emojiItem.src = './images/emoji/' + i + '.gif';
		    emojiItem.title = i;
		    docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	}
	function _showEmoji(msg){
		var match, result = msg,
		reg = /\[emoji:\d+\]/g,
		emojiIndex, totalEmojiNum = EventUtil.get('emojiWrapper').children.length;
		while (match = reg.exec(msg)) {
		    emojiIndex = match[0].slice(7, -1);
		    if (emojiIndex > totalEmojiNum) {
		        result = result.replace(match[0], '[X]');
		    } else {
		        result = result.replace(match[0], '<img class="emojiShow" src="./images/emoji/' + emojiIndex + '.gif" />'); // todo:fix this in
		    };
		};
		return result;
	}
	function _showWarning(){
		//弹出消息框，提示发送的消息不能为空
		var warning = document.getElementById('warning');
		warning.style.display = 'block';
		setTimeout("warning.style.display = 'none';",'1500');
	}














	
	

})();

//定义一些对象的键
//数组，存放resolve之前then中的回调，
const ResolveThens='resolveThens';
//数组，存放reject之前then中的回调，
const RejectThens='rejectThens';
//任意值，存放resolve的value或者reject的reason
const ResolvedValue='resolveValue';
//0 | +1 | -1,存放当前状态，+1是resolved，-1是rejected，0是初始状态
const ResolvedStatus='resolveStatus';


var initPromiseValue = function(promise){
	promise[ResolvedStatus] = 0;
	promise[ResolveThens]=[];
	promise[RejectThens]=[];
	promise[ResolvedValue]=undefined;
}

var tryResolveIt=function(then,thisPoint,nextPromise){
	var callbacks = createCallbacksClosure(nextPromise);	
	try{
		//标准并没有对reject的reason变量的类型做限制
		then.call(thisPoint,callbacks.resolve,callbacks.reject);
	}catch(e){
		callbacks.reject(e);
	}
}

//创建一个包含promise的闭包，返回能操作这个promise的resolve和reject函数
var createCallbacksClosure = promise=>{
	
	//增加resolve的value为promise的处理逻辑
	//当resolve返回一个promise时，status状态还不能改变，所以需要用另一个变量来拦截后来进入的应答。
	var isAnswered = false;
	
	var target = promise;
	
	var updateResolveState = function(resolveStatus, resolveValue, thensKey){
		target[ResolvedStatus] = resolveStatus;		
		target[ResolvedValue] = resolveValue;
		target.enterQueue(target[thensKey]);
		
		//一旦resolve或者reject，这些存放回调的数组就没有用了，可以清空或者删除
		target[ResolveThens]=[];
		target[RejectThens]=[];	
	}
	
	return {
		resolve:value=>{
			if(isAnswered)return;
			isAnswered=true;
			
			//如果是promise则等这个promise解决。
			if(value instanceof Promise){
				tryResolveIt(value.then,value,target);
				return;
			}
			
			// target[ResolvedStatus] 肯定还是初始状态，不用判断		
			updateResolveState(+1,value,ResolveThens);

		},
		reject:reason=>{
			if(isAnswered)return;
			isAnswered=true;
			
			// target[ResolvedStatus] 肯定还是初始状态，不用判断
			updateResolveState(-1,reason,RejectThens);
		}
	}

}

//
var Promise = function(resolver){
	//初始化状态和回调列表
	initPromiseValue(this);
	
	//这里不是表示出错，表示的是一个返回一个处于初始状态的对象
	if(!resolver)return;
	
	//每个promise都是直接启动的，不需要类似start等操作去启动
	tryResolveIt(resolver,undefined,this);
	
}



Promise.prototype = {}
Promise.prototype.WHOAMI="My_Promise";

//透传给then链的下一个
var emptyResolve = value=>{return value;}
var emptyReject = reason=>{throw reason;}

Promise.prototype.then = function(onResolve,onReject){
	onResolve = onResolve?onResolve:emptyResolve;
	onReject = onReject?onReject:emptyReject;
	var promise = new Promise();
	var deferred = createCallbacksClosure(promise);
	switch(this[ResolvedStatus]){
		case 0:
			//这时候还在初始状态，则储存回调
			this[ResolveThens].push(onResolve);
			this[ResolveThens].push(deferred);
			this[RejectThens].push(onReject);
			this[RejectThens].push(deferred);
			break;
		case 1:
			//已经resolved，直接回调之
			this.enterQueue([onResolve,deferred]);
			break;
		case -1:
			//已经rejected，直接回调之
			this.enterQueue([onReject,deferred]);
			break;
	}
	
	//每次调用then都返回一个新的promise
	return promise;
	
}

//回调每一个then中的回调函数，同一个对象的then可以被调用多次，所以可以有多个回调。
//比如var A=new Promise(job);A.then(S1,F1);A.then(S2,F2);A.then(S3,F3);
Promise.prototype.enterQueue = function(queue){
	var that=this;
	process.nextTick(()=>{
		var value = that[ResolvedValue];
		for(var i=0;i<queue.length;i+=2){

			try{
				//这里是同步调用取返回值，要想多个异步串联就返回一个promise, 下一步的promise会去then等待它
				var ret=queue[i].call(undefined,value);
				//传递给then链的下一个的resolve
				queue[i+1].resolve(ret);
			}catch(e){
				//传递给then链的下一个的reject，并且吃掉error
				try{queue[i+1].reject.call(undefined,e);}catch(e){/* ignore it */}
			}		
		}
	});

}


module.exports=Promise;

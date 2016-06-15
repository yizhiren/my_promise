
//����һЩ����ļ�
//���飬���resolve֮ǰthen�еĻص���
const ResolveThens='resolveThens';
//���飬���reject֮ǰthen�еĻص���
const RejectThens='rejectThens';
//����ֵ�����resolve��value����reject��reason
const ResolvedValue='resolveValue';
//0 | +1 | -1,��ŵ�ǰ״̬��+1��resolved��-1��rejected��0�ǳ�ʼ״̬
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
		//��׼��û�ж�reject��reason����������������
		then.call(thisPoint,callbacks.resolve,callbacks.reject);
	}catch(e){
		callbacks.reject(e);
	}
}

//����һ������promise�ıհ��������ܲ������promise��resolve��reject����
var createCallbacksClosure = promise=>{
	
	//����resolve��valueΪpromise�Ĵ����߼�
	//��resolve����һ��promiseʱ��status״̬�����ܸı䣬������Ҫ����һ�����������غ��������Ӧ��
	var isAnswered = false;
	
	var target = promise;
	
	var updateResolveState = function(resolveStatus, resolveValue, thensKey){
		target[ResolvedStatus] = resolveStatus;		
		target[ResolvedValue] = resolveValue;
		target.enterQueue(target[thensKey]);
		
		//һ��resolve����reject����Щ��Żص��������û�����ˣ�������ջ���ɾ��
		target[ResolveThens]=[];
		target[RejectThens]=[];	
	}
	
	return {
		resolve:value=>{
			if(isAnswered)return;
			isAnswered=true;
			
			//�����promise������promise�����
			if(value instanceof Promise){
				tryResolveIt(value.then,value,target);
				return;
			}
			
			// target[ResolvedStatus] �϶����ǳ�ʼ״̬�������ж�		
			updateResolveState(+1,value,ResolveThens);

		},
		reject:reason=>{
			if(isAnswered)return;
			isAnswered=true;
			
			// target[ResolvedStatus] �϶����ǳ�ʼ״̬�������ж�
			updateResolveState(-1,reason,RejectThens);
		}
	}

}

//
var Promise = function(resolver){
	//��ʼ��״̬�ͻص��б�
	initPromiseValue(this);
	
	//���ﲻ�Ǳ�ʾ������ʾ����һ������һ�����ڳ�ʼ״̬�Ķ���
	if(!resolver)return;
	
	//ÿ��promise����ֱ�������ģ�����Ҫ����start�Ȳ���ȥ����
	tryResolveIt(resolver,undefined,this);
	
}



Promise.prototype = {}
Promise.prototype.WHOAMI="My_Promise";

//͸����then������һ��
var emptyResolve = value=>{return value;}
var emptyReject = reason=>{throw reason;}

Promise.prototype.then = function(onResolve,onReject){
	onResolve = onResolve?onResolve:emptyResolve;
	onReject = onReject?onReject:emptyReject;
	var promise = new Promise();
	var deferred = createCallbacksClosure(promise);
	switch(this[ResolvedStatus]){
		case 0:
			//��ʱ���ڳ�ʼ״̬���򴢴�ص�
			this[ResolveThens].push(onResolve);
			this[ResolveThens].push(deferred);
			this[RejectThens].push(onReject);
			this[RejectThens].push(deferred);
			break;
		case 1:
			//�Ѿ�resolved��ֱ�ӻص�֮
			this.enterQueue([onResolve,deferred]);
			break;
		case -1:
			//�Ѿ�rejected��ֱ�ӻص�֮
			this.enterQueue([onReject,deferred]);
			break;
	}
	
	//ÿ�ε���then������һ���µ�promise
	return promise;
	
}

//�ص�ÿһ��then�еĻص�������ͬһ�������then���Ա����ö�Σ����Կ����ж���ص���
//����var A=new Promise(job);A.then(S1,F1);A.then(S2,F2);A.then(S3,F3);
Promise.prototype.enterQueue = function(queue){
	var that=this;
	process.nextTick(()=>{
		var value = that[ResolvedValue];
		for(var i=0;i<queue.length;i+=2){

			try{
				//������ͬ������ȡ����ֵ��Ҫ�����첽�����ͷ���һ��promise, ��һ����promise��ȥthen�ȴ���
				var ret=queue[i].call(undefined,value);
				//���ݸ�then������һ����resolve
				queue[i+1].resolve(ret);
			}catch(e){
				//���ݸ�then������һ����reject�����ҳԵ�error
				try{queue[i+1].reject.call(undefined,e);}catch(e){/* ignore it */}
			}		
		}
	});

}


module.exports=Promise;

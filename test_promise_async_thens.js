/***
	test promise can Serialized promise.
	
	console log:
	C:\code\node>node test_promise_async_thens.js
	[===My_Promise===] Wed Jun 15 2016 12:45:53 GMT+0800 (中国标准时间)
	Resolv(1).1st then Wed Jun 15 2016 12:45:53 GMT+0800 (中国标准时间)
	Resolv(2).2st then Wed Jun 15 2016 12:45:53 GMT+0800 (中国标准时间)
	Resolv(3).3st then Wed Jun 15 2016 12:45:54 GMT+0800 (中国标准时间)
	Resolv(4).4st then Wed Jun 15 2016 12:45:56 GMT+0800 (中国标准时间)
	Resolv(5).5st then Wed Jun 15 2016 12:45:59 GMT+0800 (中国标准时间)

**/

var MyPromise = require('./my_promise.js')

var promise=new MyPromise((resolver,rejecter) => {
	resolver(1);	
});

var promise1=new MyPromise((resolver,rejecter) => {
	setTimeout(function(){resolver(3)},1000);
	
});

var promise2=new MyPromise((resolver,rejecter) => {
	setTimeout(function(){resolver(4)},1000+2000);
	
});

var promise3=new MyPromise((resolver,rejecter) => {
	setTimeout(function(){resolver(5)},1000+2000+3000);
	
});

console.log('[===%s===]', promise.WHOAMI,Date());

promise.then(
	function(value){console.log('Resolv(%d).1st then', value, Date()); return 2;}
).then(
	function(value){console.log('Resolv(%d).2st then', value, Date());return promise1;}
).then(
	function(value){console.log('Resolv(%d).3st then', value, Date());return promise2;}
).then(
	function(value){console.log('Resolv(%d).4st then', value, Date());return promise3;}
).then(
	function(value){console.log('Resolv(%d).5st then', value, Date());}
);





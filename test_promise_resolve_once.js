/***
	test promise can only resolve once.
	
	console log:
	C:\code\node>node test_promise_resolve_once.js
	[===My_Promise===]    Wed Jun 15 2016 12:45:12 GMT+0800 (中国标准时间)
	Resolv.first     then Wed Jun 15 2016 12:45:15 GMT+0800 (中国标准时间)
	Resolv.second    then Wed Jun 15 2016 12:45:18 GMT+0800 (中国标准时间)
	Reject.disappear then Wed Jun 15 2016 12:45:21 GMT+0800 (中国标准时间)

**/

var MyPromise = require('./my_promise.js')

var promise=new MyPromise((resolver,rejecter) => {
	setTimeout(function(){resolver(1)},3000);
	
	// already resolved , so it will not callback func in then
	setTimeout(function(){
		rejecter(2);
		console.log('Reject.disappear then', Date());
	},9000); 
	
});

console.log('[===%s===]   ', promise.WHOAMI,Date());

promise.then(
	function(value) {console.log('Resolv.first     then', Date());}
,	function(reason){console.log('Reject.first     then', Date());}
);


setTimeout(function(){
	promise.then(
		function(value) {console.log('Resolv.second    then', Date());}
	,	function(reason){console.log('Reject.second    then', Date());}
	)
},6000);





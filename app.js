(function(){
  if(window.performance === undefined){
    alert("Browser not supported");
    return;
  };

  var result = {};
  var iterations = 5;
  var iframe = document.getElementsByTagName('iframe')[0];


  for(var i = 0; i < TESTS.length; i++){
    result[TESTS[i]] = new Array();
  }

  var current;
  var queue = new Array();

  for(var i = 0; i < iterations; i++){
    for(var j = 0; j < TESTS.length; j++){
      queue.push(TESTS[j]);
    }
  }

  function test(){
    current = queue.pop();
    iframe.src = current;
  }

  function printResult(){
    console.log(result[TESTS[0]])
  }

  function testNext(value){
    result[current].push(value.data);
    if(queue[0] === undefined) printResult();
    else test();
  }

  window.addEventListener("message", testNext, false);
  test();

}())

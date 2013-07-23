(function(){
  if(window.performance === undefined){
    alert("Browser not supported");
    return;
  };

  var result = {};
  var testpages = new Array();
  var iterations = 5;
  var iframe = document.getElementsByTagName('iframe')[0];

  testpages.push('fonts/google-fonts/google-fonts-base64/index.html');
  testpages.push('fonts/google-fonts/google-fonts-cdn/index.html');
  testpages.push('fonts/google-fonts/google-fonts-local/index.html');

  for(var i = 0; i < testpages.length; i++){
    result[testpages[i]] = new Array();
  }

  var current;
  var queue = new Array();

  for(var i = 0; i < iterations; i++){
    for(var j = 0; j < testpages.length; j++){
      queue.push(testpages[j]);
    }
  }

  function test(){
    current = queue.pop();
    iframe.src = current;
  }

  function printResult(){
    console.log(result[testpages[0]])
  }

  function testNext(value){
    result[current].push(value.data);
    if(queue[0] === undefined) printResult();
    else test();
  }

  window.addEventListener("message", testNext, false);
  test();

}())

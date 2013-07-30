(function(data, iterations, iframe, window, paragraph){

  if(window.performance === undefined){
    paragraph.childNodes[0].data  = "Unfortunately, your browser does not support the Navigation Timing API";
    return;
  }
  function Runner(iframe, window, iterations){

    var result = {};
    var current;
    var queue;
    var current_category;

    var inner_window = iframe.contentWindow;

    inner_window.domain = "wja.no";

    var interval;

    function checkParameters(){
      console.log("In checkParameters");
      if(inner_window.performance.timing.loadEventEnd !== 0){
      var result = inner_window.performance.timing.loadEventStart - inner_window.performance.timing.requestStart;
      console.log("Clearing interval");
      clearInterval(interval);
      inner_window.parent.postMessage(result, "*")
      }
    }

    function pollUntilComplete(){
      interval = setInterval(checkParameters, 100);
    }


    iframe.onload = pollUntilComplete

    //We initialize a placeholder for the callee's callback-function.
    //We use an empty function so that JavaScript treats the variable as 
    //callable, although the actual function will be set later.

    var finalize = function(){};

    function testNext(){
      console.log("Calling testNext()");
      current = queue.pop();
      var currString = "./"+current_category+"/"+current+"/index.html";
      console.log("attempting to load "+currString);
      iframe.onload = pollUntilComplete
      iframe.src = currString;
    }

    function catchAndContinue(message){
      console.log(message);
      result[current] = message.data;
      if(queue.length === 0){
        finalize(result); 
      }
      else testNext();
    }

    window.addEventListener("message", catchAndContinue, false);

    //return a function that sets the final callback to the one specified
    //by the callee, builds the queue and result objects corresponding to the 
    //callees testcase, and empties the queue using functions in the enclosing
    //scope.  
    return function(tests, category, callback){

      finalize = callback;
      current_category = category;

      //For every category, the Runners' result object must be reset.
      result = {};

      //Initialize a new queue with /iterations/ test-tokens per tests.
      queue = tests;

      testNext();
    }
  }

  function process(data, runner, finish){

    var results = {};
    var queue = new Array();
    var current;

    for(var i = 0; i < iterations; i++){
      for(category in data){
        queue.push(category);
      }
    }

    function buildResult(incoming){
      if(results[current] === undefined){
        results[current] = incoming;
        for(var subcategory in results[current]){
          var array = new Array();
          array.push(incoming[subcategory]);
          results[current][subcategory] = array;
        }
      }else for(subcategory in incoming){
        console.log("pushing result")
        console.log(incoming[subcategory]);
        console.log("to results[current]subcategory] where current is");
        console.log(current);
        console.log("And subcategory is");
        console.log(subcategory);
        results[current][subcategory].push(incoming[subcategory]);
      }
    }

    function post(incoming_result){
      buildResult(incoming_result);
      if(queue[0] === undefined) finish(results);
      else {
        current = queue.pop();
        runner(data[current].concat(), current, post)
      }
    }

    console.log(queue);
    current = queue.pop();
    runner(data[current].concat(), current, post);
  }

  function buildReport(array){
    console.log(array);
    var naive_average = array.reduce(function(p, c, i, array){ return p+c })/array.length;
    return naive_average;
  }

  function present(result){
    var raw_html = "<table>";
    for(var name in result){
      raw_html += "<tr><th>"+name+"</th></tr>";
      var  category = result[name];
      for(var testname in category){
        raw_html += "<tr><td>"+testname+"</td>";
        console.log("Printing array of results from "+testname);
        raw_html += "<td>"+buildReport(category[testname])+"</td></tr>";
      }
    }
    raw_html += "</table>";
    document.body.innerHTML = raw_html;
  }

  process(data, Runner(iframe, window, iterations), present);

} (TESTRUNNER.data, 10, document.getElementsByTagName('iframe')[0], window,
   document.getElementsByTagName('p')[0]));

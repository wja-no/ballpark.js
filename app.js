(function(data, iterations, iframe, window, paragraph, button){

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

    //We initialize a placeholder for the callee's callback-function.
    //We use an empty function so that JavaScript treats the variable as 
    //callable, although the actual function will be set later.

    var finalize = function(){};

    function checkParameters(){
      var timing = inner_window.performance.timing;
      console.log("Calling checkParameters");
      if(timing.requestStart === 0) setTimeout(checkParameters, 10);
      else {
        var result = timing.loadEventStart - timing.requestStart;
        inner_window.parent.postMessage(result, "*");
      }
    }

    iframe.onload = checkParameters;

    function testNext(){
      console.log("Calling testNext()");
      current = queue.pop();
      var currString = "./"+current_category+"/"+current+"/index.html";
      console.log("attempting to load "+currString);
      iframe.src = currString;
    }

    function catchAndContinue(message){
      console.log("in catchAndContinue");
      console.log(result);
      result[current] = message.data;
      console.log("Catching result[current]");
      console.log(result[current]);
      if(queue.length === 0){
        console.log("finalizing");
        iframe.class = "hidden";
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
      console.log("buildResult called with");
      console.log(incoming);
      console.log("results-object looks like");
      console.log(results);
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
    var naive_average = array.reduce(function(p, c, i, array){ return p+c })/array.length;
    return Math.round(naive_average);
  }

  function present(result){
    console.log("calling present with");
    console.log(result);
    var raw_html = "<table>";
    for(var name in result){
      raw_html += "<tr><th>"+name+"</th></tr>";
      var  category = result[name];
      for(var testname in category){
        var url = "<a href='./"+name+"/"+testname+"/"+"'>"+testname+"</a>";
        raw_html += "<tr><td>"+url+"</td>";
        console.log("Printing array of results from "+testname);
        raw_html += "<td>"+buildReport(category[testname])+"</td></tr>";
      }
    }
    raw_html += "</table>";
    paragraph.innerHTML = raw_html;
  }

  function engage(){
  process(data, Runner(iframe, window, iterations), present);
  }

  button.onclick = engage;

} (TESTRUNNER.data, 10, document.getElementsByTagName('iframe')[0], window,
   document.getElementsByTagName('p')[1], document.getElementsByTagName('button')[0]))

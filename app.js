(function(data, iterations, iframe, window, article, button, table){

  if(window.performance === undefined){
    article.innerHTML = "Unfortunately, your browser does not support the Navigation Timing API";
    return;
  }

  function Runner(iframe, window, iterations){

    // The result object which we is returned upon completion;
    var result = {};

    // The current testname
    var current;

    // Queue of testnames
    var queue;

    // Variable that tracks the test category, ie. 'fonts'. 
    var current_category;

    // A number that tracks how many tests have been run. Reported to the user
    // during testing.
    var current_testno = 0;

    // Variable that stores the iframes own window object. We need this to
    // set domain and post messages. We prefer the parent HTML to inspect the 
    // test rather than having scripts within the tests reporting results.
    var inner_window = iframe.contentWindow;

    // In order to circumvent Security policies in the browser, we 
    // manually set the domain of the iframe to the domain of the parent html.
    inner_window.domain = document.domain; 

    //We initialize a placeholder for the callee's callback-function.
    //We use an empty function so that JavaScript treats the variable as 
    //callable, although the actual function will be set later.

    var finalize = function(){};

    function checkParameters(){
      var timing = inner_window.performance.timing;
      if(timing.requestStart === 0) setTimeout(checkParameters, 10);
      else {
        var result = timing.loadEventStart - timing.requestStart;
        inner_window.parent.postMessage(result, "*");
      }
    }

    iframe.onload = checkParameters;

    function testNext(){

      current_testno += 1;
      article.innerHTML = "<p>Running test <strong>"+current_testno+"</strong> of <strong>"+total_tests+"</strong>.</p>";
      current = queue.pop();
      var currString = "./tests/"+current_category+"/"+current+"/index.html";
      iframe.src = currString;
    }

    function catchAndContinue(message){
      result[current] = message.data;
      if(queue.length === 0){
        iframe.class = "hidden";
        finalize(result); 
      }
      else testNext();
    }

    window.addEventListener("message", catchAndContinue, false);

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
    total_tests = 0;

    for(var i = 0; i < iterations; i++){
      for(category in data){
        total_tests += data[category].length;
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

    current = queue.pop();
    runner(data[current].concat(), current, post);
  }

  function buildReport(array){
    var naive_average = array.reduce(function(p, c, i, array){ return p+c })/array.length;
    return Math.round(naive_average);
  }

  function present(result){
    console.log("in present");
    article.innerHTML = "<p>Alright! Testing completed.<p>Do take the results with a grain of salt. <p><button>One more time, please</button>";
    iframe.style.display = "none";
    var raw_html = "";
    for(var name in result){
      raw_html += "<tr><th>"+name+"</th></tr>";
      var  category = result[name];
      for(var testname in category){
        var url = "<a href='./tests/"+name+"/"+testname+"/"+"'>"+testname+"</a>";
        raw_html += "<tr><td>"+url+"</td>";
        raw_html += "<td>"+buildReport(category[testname])+"</td></tr>";
      }
    }
    table.innerHTML = raw_html;
    button = document.getElementsByTagName('button')[0];
    button.onclick = function(){
    iframe.style.display = "block";
    process(data, Runner(iframe, window, iterations), present);
    };
  }

  function engage(){
  iframe.style.display = "block";
  process(data, Runner(iframe, window, iterations), present);
  }

  button.onclick = engage;

} (TESTRUNNER.data, 10, document.getElementsByTagName('iframe')[0], window,
   document.getElementsByTagName('article')[0], document.getElementsByTagName('button')[0], document.getElementsByTagName('table')[0]))

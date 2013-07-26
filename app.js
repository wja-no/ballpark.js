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

    //We initialize a placeholder for the callee's callback-function.
    //We use an empty function so that JavaScript treats the variable as 
    //callable, although the actual function will be set later.

    var finalize = function(){};

    function testNext(){
      current = queue.pop();
      var currString = "./"+current_category+"/"+current+"/index.html";
      console.log(currString);
      iframe.src = currString;
    }

    function catchAndContinue(value){
      result[current].push(value.data);
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

      //Initialize a new queue with /iterations/ test-tokens per tests.
      queue = new Array((tests.length*iterations));

      for(var i = 0; i < tests.length; i++){

        //Create an array for the results, and name this array after the test
        result[tests[i]] = new Array();

        //Add /iterations/ of the test to the queue
        for(var j = 0; j < iterations; j++){
          queue[iterations*i + j] = tests[i];
        }
      }

      //Start the iteration
      testNext();
    }
  }

  function process(data, runner, finish){

    var results = {};
    var queue = new Array();
    var current;

    for(var category in data){
      results[category] = {};
      queue.push(category);
    }

    function post(incoming_result){
      results[current] = incoming_result;
      if(queue[0] === undefined) finish(results);
      else {
        current = queue.pop();
        runner(data[current], post)
      }
    }

    current = queue.pop();
    runner(data[current], current, post);
  }

  function buildReport(array){
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
        raw_html += "<td>"+buildReport(category[testname])+"</td></tr>";
      }
    }
    raw_html += "</table>";
    document.body.innerHTML = raw_html;
  }

  process(data, Runner(iframe, window, iterations), present);

} (TESTRUNNER.data, 10, document.getElementsByTagName('iframe')[0], window, document.getElementsByTagName('p')[0]));

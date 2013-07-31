(function(data, iterations, iframe, window, article, button, table){

  if(window.performance === undefined){
    article.innerHTML = "Unfortunately, your browser does not support the Navigation Timing API";
    return;
  }

  function createBindedRunner(iframe, window){

    var result, number_of_tests, counter, current_test, queue, finalize;

    // In order to circumvent Security policies in the browser, we 
    // manually set the domain of the iframe to the domain of the parent html.
    var inner_window = iframe.contentWindow;
    inner_window.domain = document.domain; 

    function reportTestNumber(){
      counter += 1;
      article.innerHTML = "<p>Running test <strong>"+counter+"</strong> of <strong>"+number_of_tests+"</strong>.</p>";
    }

    function testNext(){
      reportTestNumber();
      current_test = queue.shift();
      iframe.src = "./tests/"+current_test[0]+"/"+current_test[1]+"/index.html";
    }

    function initializeIfEmpty(){
      if(result[current_test[0]] === undefined)
        result[current_test[0]] = {};

      if(result[current_test[0]][current_test[1]] === undefined)
          result[current_test[0]][current_test[1]] = [];
    }

    function iterate(){
      if(queue.length !== 0) testNext();
      else finalize(result);
    }

    function catchMessage(message){
      initializeIfEmpty();
      result[current_test[0]][current_test[1]].push(message.data);
      iterate();
    }

    window.addEventListener("message", catchMessage, false);

    function postIfSet(){
      var timing = inner_window.performance.timing;
      if(timing.requestStart === 0) setTimeout(checkParameters, 10);
      else {
        var result = timing.loadEventStart - timing.requestStart;
        inner_window.parent.postMessage(result, "*");
      }
    }

    iframe.onload = postIfSet;

    return function(tests, callback){
      number_of_tests = tests.length;
      queue = tests;
      counter = 0;
      finalize = callback;
      result = {};
      testNext();
    }
  }

  function buildQueue(data){
    var queue = [];
    for(var i = 0; i < iterations; i++){
      for(var category in data){
        data[category].forEach(function(member){ queue.push([category, member]); });
      }
    }
    return queue;
  }


  function findAverage(array){
    var naive_average = array.reduce(function(p, c, i, array){ return p+c })/array.length;
    return Math.round(naive_average);
  }

  function createTable(result){
    iframe.style.display = "none";
    var raw_html = "";
    for(var name in result){
      raw_html += "<tr><th>"+name+"</th></tr>";
      var  category = result[name];
      for(var testname in category){
        var url = "<a href='./tests/"+name+"/"+testname+"/"+"'>"+testname+"</a>";
        raw_html += "<tr><td>"+url+"</td>";
        raw_html += "<td>"+findAverage(category[testname])+" ms"+"</td></tr>";
      }
    }
    table.innerHTML = raw_html;
  }

  function present(result){
    article.firstChild.textContent = "Alright! Testing completed.";
    var second_paragraph = document.createElement('p');
    second_paragraph.textContent = "Do take the results with a grain of salt.";
    article.insertBefore(second_paragraph, article.children[1]);
    button.textContent = "One more time, please";
    article.appendChild(button);
    createTable(result);
  };

  var runner = createBindedRunner(iframe, window);

  function engage(){
    table.innerHTML = "";
    iframe.style.display = "block";
    runner(buildQueue(data), present);
  }

  button.onclick = engage;

}(TESTRUNNER.data, 10, document.getElementsByTagName('iframe')[0], window,
  document.getElementsByTagName('article')[0], document.getElementsByTagName('button')[0],document.getElementsByTagName('table')[0]))

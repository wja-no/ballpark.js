(function (data, iterations, iframe, document, window, article, button, table) {

    "use strict";

    // First, we check if the Navigation Timing API is supported by the
    // browser. If not, the script informs the user and returns. 

    if (window.performance === undefined) {
        article.innerHTML = "<p>Unfortunately, your browser does not " +
            "support the <a href='http://caniuse.com/#search=" + 
            "navigation%20timing%20api'> Navigation Timing API</a>.</p>";
        return;
    }

    // This function servers as a closure for the actual runner returned to
    // the caller. Helper functions are defined, and an eventlistener is 
    // binded to the iframe. 

    function createBindedRunner(iframe, window) {

        var counter;
        var current_test;
        var finalize;
        var number_of_tests;
        var queue;
        var result;
        var inner_window = iframe.contentWindow;

        // In order to circumvent Security policies in the browser, we 
        // manually set the domain of the iframe to the domain of the
        // parent html.

        inner_window.domain = document.domain; 

        function reportTestNumber() {
            counter += 1;
            article.innerHTML = "<p>Running test <strong>" + counter +
                "</strong> of <strong>" + number_of_tests + "</strong>.</p>";
        }

        function testNext() {
            reportTestNumber();
            current_test = queue.shift();
            iframe.src = "./tests/" + current_test[0]+ "/" + current_test[1] +
                "/index.html";
        }

        function iterate() {
            if (queue.length !== 0) testNext();
            else finalize(result);
        }

        function initializeIfEmpty() {
            if (result[current_test[0]] === undefined)
                result[current_test[0]] = {};

            if (result[current_test[0]][current_test[1]] === undefined)
                result[current_test[0]][current_test[1]] = [];
        }

        function catchMessage(message) {
            initializeIfEmpty();
            result[current_test[0]][current_test[1]].push(message.data);
            iterate();
        }

        window.addEventListener("message", catchMessage, false);

        function postResult(inner_window) {
            var timing = inner_window.performance.timing;
            var result = timing.loadEventEnd - timing.requestStart;
            inner_window.parent.postMessage(result, "*");
        }

        function postIfSet() {
            var timing = inner_window.performance.timing;
            if (timing.loadEventEnd === 0) setTimeout(postIfSet, 10);
            else postResult(inner_window);
        }


        iframe.onload = postIfSet;

        return function(tests, callback) {
            number_of_tests = tests.length;
            queue = tests;
            counter = 0;
            finalize = callback;
            result = {};
            testNext();
        };
    }


    // This function builds the queue from the provided tests-object.

    function buildQueue (data, iterations) {
        var queue = [];

        function wrapCategory(category){
            return function(member){
                queue.push([category, member]);
            };
        }

        for(var i = 0; i < iterations; i++){
            for(var category in data){
                data[category].forEach(wrapCategory(category));
            }
        }
        return queue;
    }

    // Data presentation methods

    function sum (array) {
        return array.reduce(function(previous, current, index, array) {
            return previous+current;
        });
    }

    function findMinMax (array) {
        var max = -Number.MAX_VALUE;
        var min = Number.MAX_VALUE;
        array.forEach(function(element) {
            if (element >= max) max = element;
            if (element <= min) min = element;
        });
        return [min, max];
    }

    function makeFilter (smallest, largest) {
        var removals = 0;
        return function (value, index, array) {
            if (value !== smallest && value !== largest) return true;
            else {
                removals += 1;
                if (removals <= 2) return false;
                else return true;
            }
        };
    }

    function findFinalNumber (array) {
        var trimmed_array = array.filter(makeFilter.apply(null, findMinMax(array)));
        var naive_average = sum(trimmed_array)/trimmed_array.length;
        return Math.round(naive_average);
    }

    function createTable (result) {
        iframe.style.display = "none";
        var raw_html = "";
        for(var name in result){
            raw_html += "<tr><th>" + name + "</th></tr>";
            var  category = result[name];
            for(var testname in category){
                var url = "<a href='./tests/" + name + 
                    "/" + testname + "/" + "'>" + testname + "</a>";
                raw_html += "<tr><td>" + url + "</td>";
                raw_html += "<td>" + findFinalNumber(category[testname]) +
                    " ms" + "</td></tr>";
            }
        }
        table.innerHTML = raw_html;
    }

    function reset () {
        button.textContent = "One more time, please";
        article.appendChild(button);
    }

    function present (result) {
        article.firstChild.textContent = "Alright! Testing completed.";
        var second_paragraph = document.createElement('p');
        second_paragraph.textContent = "Do take the results with a grain of salt.";
        article.insertBefore(second_paragraph, article.children[1]);
        createTable(result);
        reset();
    }

    var runner = createBindedRunner(iframe, window);

    function engage () {
        table.innerHTML = "";
        iframe.style.display = "block";
        runner(buildQueue(data, iterations), present);
    }

    button.onclick = engage;

}(TESTRUNNER.data, 5, document.getElementsByTagName('iframe')[0], document, window,
  document.getElementsByTagName('article')[0], document.getElementsByTagName('button')[0],document.getElementsByTagName('table')[0]));

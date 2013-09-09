/*jslint browser: true, devel: true, es5: true, plusplus: false, unparam: true, vars: false */

(function (data, iterations, iframe, document, window, article, button, table) {

    "use strict";

    window.onload = function () {

        if (location.hash !== "") {
            present (json.parse(String.prototype.slice.call(location.hash, 1)));
        }
    }
    

    // This is a placeholder for the testrunner after it has  binded an
    // eventlistener to the iframe window.
    var testqueue, runner; 
    
    // Return if incompatible with Navigation Timing API
    
    if(window.performance === undefined) {
        (document.getElementsByTagName('body')[0]).innerHTML = "<p>Unfortunately," +
            "  your browser does not support the " + "<a href=" + 
            "'http://caniuse.com/#search=navigation'>Navigation Timing API</a>.</p>"; 
        return;
    }

    // DOM Methods
    
    function text(string) {
        return document.createTextNode(string);
    }

    function paragraph() {
        var p = document.createElement('p'), i;
        for (i = 0; i < arguments.length; i += 1) {
            if (typeof arguments[i] === "string") {
                p.appendChild(text(arguments[i]));
            }
            else { 
                p.appendChild(arguments[i]);
            }
        }
        return p;
    }

    function makeParent(child, typeString) {
        var element = document.createElement(typeString);
        element.appendChild(child);
        return element;
    }

    function appendChildren(element) {
        var i;
        if (arguments.length <= 1) { 
            return;
        }

        for (i = 1; i < arguments.length; i += 1) {
            element.appendChild(arguments[i]);
        }

        return element;
    }

    function nodeListToArray(list) {
        var array = [], i;
        for (i = 0; i < list.length; i += 1) {
            array[i] = list[i];
        }
        return array;
    }

    // IE9 does not support forEach, so we define it here.
    // Kudos to StackOverflow user bobince for the standatds-compliant implementation
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fun, that){
            var i, n;
            for (i = 0, n = this.length; i < n; i+= 1) {
                if (this[i] !== undefined) {
                    fun.call(that, this[i], i, this);
                }
            }
        };
    }

    function updateArticle(new_pars){
        var old_pars = nodeListToArray(article.getElementsByTagName('p'));
        old_pars.forEach(function(par){ article.removeChild(par); });
        new_pars.forEach(function(par){ article.appendChild(par); });
    }

    // This function servers as a closure for the actual runner returned to
    // the caller. Helper functions are defined, and an eventlistener is 
    // binded to the iframe. 

    function createBoundRunner(iframe, window) {

        var counter, // This stores current test number.
            current_test, // This stores the currently running test category (string).
            inner_window = iframe.contentWindow, // Make it easier to access  the iframe's DOM
            finalize, // A placeholder for callback function to be called when testing is complete.
            number_of_tests, // Stores total number of tests
            queue, // The queue of tests
            reporter, // A placeholder for the function(X) used to report 'currently running test X of total' 
            result; // A placeholder for the result

        // In order to circumvent Security policies in the browser, we 
        // manually set the domain of the iframe to the domain of the
        // parent html.

        inner_window.domain = document.domain; 

        // In order to avoid redrawing the article for every iteration,
        // we wrap the article element in a closure and return a function
        // that only replaces the counter text for each iteration.
        
        function createReport(total_tests){
            var intro = "Running test ",
                countptr = text(""), //A pointer to the text node where we set the currently runing testnumber
                fat_count = makeParent(countptr, 'strong'),
                copula = " of ",
                total = makeParent(text(total_tests), 'strong'),
                period = text("."),
                par = paragraph(intro, fat_count, copula, total, period);

            updateArticle([par]);

            return function(){
                counter += 1;
                countptr.textContent = counter;
            };
        }

        function testNext() {
            reporter();
            current_test = queue.shift();
            iframe.src = "./tests/" + current_test[0]+ "/" + current_test[1] +
                "/index.html";
        }

        function iterate() {
            if (queue.length !== 0) {
                testNext();
            }
            else {
                window.removeEventListener("message", catchMessage, false)
                finalize(result);
            }
        }

        function initializeResultIfEmpty() {


            if (result[current_test[0]] === undefined){
                result[current_test[0]] = {};
            }

            if (result[current_test[0]][current_test[1]] === undefined){
                result[current_test[0]][current_test[1]] = [];
            }
        }

        function catchMessage(message) {
            initializeResultIfEmpty();
            result[current_test[0]][current_test[1]].push(message.data);
            iterate();
        }

        window.addEventListener("message", catchMessage, false);

        function postResult(inner_window) {
            var timing = inner_window.performance.timing,
                difference = timing.loadEventEnd - timing.requestStart;
            inner_window.parent.postMessage(difference, "*");
        }

        function postIfSet() {
            var timing = inner_window.performance.timing;
            if (timing.loadEventEnd === 0){
                setTimeout(postIfSet, 10);
            }
            else {
                postResult(inner_window);
            }
        }

        iframe.onload = postIfSet;

        return function(tests, callback) {
            number_of_tests = tests.length;
            queue = tests;
            counter = 0;
            finalize = callback;
            result = {};
            reporter = createReport(number_of_tests);
            testNext();
        };
    }

    function buildQueueFromProvidedTestObject (data, iterations) {
        var queue = [], i, category;

        function wrapCategory(category){
            return function(member){
                queue.push([category, member]);
            };
        }

        for(i = 0; i < iterations; i+= 1){
            for(category in data){
                if(data.hasOwnProperty(category)) { 
                    data[category].forEach(wrapCategory(category));
                }
            }
        }
        return queue;
    }

    function makeResultsObject(data){
        var category_name, category, i, 
            results = {};

        for(category_name in data){
            results[category_name] = {};
            category = data[category_name];
            for(i = 0; i < category.length; i += 1){
                results[category_name][category[i]] = [];
            }
        }
        return results;
    }

    // Data presentation methods

    function sum (array) {
        var result = 0, i;
        for(i = 0; i < array.length; i += 1){
            result += (+array[i]); //If the elements are strings, we coerce them to numbers
        }
        return result;
    }

    function findMinMax (array) {
        var max = -Number.MAX_VALUE,
            min = Number.MAX_VALUE;
        array.forEach(function(element) {
            if (element >= max) {
                max = element;
            }
            if (element <= min) {
                min = element;
            }
        });
        return [min, max];
    }

    function makeFilter (smallest, largest) {
        var removals = 0;
        return function (value, index, array) {
            if (value !== smallest && value !== largest) {
                return true;
            }
                removals += 1;
                if (removals <= 2) {
                    return false;
                }
                return true;
            
        };
    }

    function findFinalNumber (array) {

        var trimmed_array = array.filter(makeFilter.apply(null, findMinMax(array))),
            naive_average = sum(trimmed_array)/trimmed_array.length;
        return Math.round(naive_average);
    }


    function createTestURL(category, test){
        var url = document.createElement('a');
        url.href= './tests/' + category + "/" + test + "/";
        url.appendChild(document.createTextNode(test));
        return url;
    }


    function createTable (result) {

        var category, category_array, final_number, header, result_string,
        results, row, tblbody = document.createElement('tbody'), testname,
        urlfield; 

        for(category in result){
            if(result.hasOwnProperty(category)){

            category_array = result[category];
            header = makeParent(text(category), 'th');
            tblbody.appendChild(makeParent(header, 'tr'));

            for(testname in category_array){
                if(category_array.hasOwnProperty(testname)) {
                row = document.createElement('tr');
                urlfield = createTestURL(category, testname);

                results = result[category][testname];
                final_number = findFinalNumber(results);
                result_string = text(final_number+' ms');

                appendChildren(row, makeParent(urlfield, 'td'), 
                               makeParent(result_string, 'td'));

                tblbody.appendChild(row);
            }
            }
        }
        }

        table.appendChild(tblbody);
    }

    function finalMessage() {
        var p1 = paragraph('Alright! Testing completed.'),
            p2 = paragraph('Do take the results with a grain of salt.'),
            p3 = paragraph(button);

        button.textContent = "One more time, please";

        return [p1, p2, p3];
    }

    function pushResultToHistory(result){
        window.location.hash = JSON.stringify(result);
        present(result);
    }

    function present (result) {
        iframe.style.display = "none";
        updateArticle(finalMessage());
        createTable(result);
    }

    function resetTableIfSet(){
        if(table.childNodes.length !== 0) {
            table.removeChild(table.childNodes[0]);
        }
    }

    testqueue = buildQueueFromProvidedTestObject(data, iterations);

    function engage () {
        resetTableIfSet();
        iframe.style.display = "block";
        createBoundRunner(iframe, window)(testqueue.slice(), pushResultToHistory);
    }

    button.onclick = engage;

}(TESTRUNNER.data, 12, document.getElementsByTagName('iframe')[0], document, window,
        document.getElementsByTagName('article')[0], document.getElementsByTagName('button')[0],document.getElementsByTagName('table')[0]));

(function (data, iterations, iframe, document, window, article, button, table) {

    "use strict";

    // Return if incompatible with Navigation Timing API
    if(window.performance === undefined) {
        var html = document.getElementsByTagName('html')[0];
        var body = html.getElementsByTagName('body')[0];
        body.innerHTML = "<p>Unfortunately, your browser does not support the " + 
    "<a href='http://caniuse.com/#search=navigation'>Navigation Timing API</a>.</p>";
return;
    }

    // DOM Methods
    
    function text(string){
        return document.createTextNode(string);
    }

    function paragraph(){
        var p = document.createElement('p');
        for(var i = 0; i < arguments.length; i++){
            if(typeof arguments[i] === "string")
                p.appendChild(text(arguments[i]));
            else p.appendChild(arguments[i]);
        }
        return p;
    }

    function anchor(href, title){
        var a = document.createElement('a');
        a.href = href;
        if(text !== undefined) a.appendChild(text(title));
        return a;
    }

    function makeParent(child, typeString){
        var element = document.createElement(typeString);
        element.appendChild(child);
        return element;
    }

    function appendChildren(element){
        if(arguments.length <= 1) return;

        for(var i = 1; i < arguments.length; i++)
            element.appendChild(arguments[i]);

        return element;
    }

    function nodeListToArray(list){
        var array = [];
        for(var i = 0; i < list.length; i++) array[i] = list[i];
        return array;
    }

    // IE9 does not support forEach, so we define it here.
    // Kudos to StackOverflow user bobince for the standatds-compliant implementation
    if(!Array.prototype.forEach) {
        Array.prototype.forEach = function (fun, that){
            for(var i = 0, n = this.length; i < n; i++){
                if(i in this)
                    fun.call(that, this[i], i, this);
            }
        }
    }

    function updateArticle(new_pars){
        var old_pars = nodeListToArray(article.getElementsByTagName('p'));
        old_pars.forEach(function(par){ article.removeChild(par) });
        new_pars.forEach(function(par){ article.appendChild(par) });
    }

    // First, we check if the Navigation Timing API is supported by the
    // browser. If not, the script informs the user and returns. 


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

        function createReport(total_tests){
            var intro = "Running test ";
            var countptr = text("");
            var fat_count = makeParent(countptr, 'strong');
            var copula = " of ";
            var total = makeParent(text(total_tests), 'strong');
            var period = text(".");
            var par = paragraph(intro, fat_count, copula, total, period);
            updateArticle([par]);

            return function(){
                counter += 1;
                countptr.replaceWholeText(counter);
            }
        }

        var reporter;

        function testNext() {
            reporter();
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
            reporter = createReport(number_of_tests);
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
        var sum = 0;
        for(var i = 0; i < array.length; i++){
            sum += (+array[i]); //If the elements are strings, we coerce them to numbers
        }
        return sum;
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


    function createTestURL(category, test){
        var url = document.createElement('a');
        url.href= './tests/' + category + "/" + test + "/";
        url.appendChild(document.createTextNode(test));
        return url;
    }


    function createTable (result) {

        var tblbody = document.createElement('tbody');

        for(var category in result){
            var category_array = result[category];
            var header = makeParent(text(category), 'th');
            tblbody.appendChild(makeParent(header, 'tr'));

            for(var testname in category_array){
                var row = document.createElement('tr');
                var urlfield = createTestURL(category, testname);
                var atomic_result = result[category][testname];
                var testresult = findFinalNumber(atomic_result);
                var packed_result = text(testresult+' ms');
                appendChildren(row, makeParent(urlfield, 'td'), makeParent(packed_result, 'td'));
                tblbody.appendChild(row);
            }
        }

        table.appendChild(tblbody);
    }

    function finalMessage(){
        var p1 = paragraph(text('Alright! Testing completed.'));
        var p2 = paragraph(text('Do take the results with a grain of salt.'));
        button.textContent = "One more time, please";
        var p3 = paragraph(button);
        return [p1, p2, p3];
    }

    function present (result) {
        iframe.style.display = "none";
        updateArticle(finalMessage());
        createTable(result);
    }

    var runner = createBindedRunner(iframe, window);

    function resetTableIfSet(){
        console.log("In resetTableIfSet");
        if(table.childNodes.length !== 0)
            table.removeChild(table.childNodes[0]);
    }

    function engage () {
        console.log("In engage");
        resetTableIfSet();
        iframe.style.display = "block";
        runner(buildQueue(data, iterations), present);
    }

    button.onclick = engage;

}(TESTRUNNER.data, 5, document.getElementsByTagName('iframe')[0], document, window,
        document.getElementsByTagName('article')[0], document.getElementsByTagName('button')[0],document.getElementsByTagName('table')[0]));

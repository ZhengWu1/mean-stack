'use strict';

    //We assume these symbols will be globally defined by the user. These var statements
    //will assign undefined to the symbol if it isn't global already.

    var cs142FormatTime;
    var Cs142TemplateProcessor;

(function() {

    /*
     * This file tests the CS142 Project #2 JavaScript assignment problems. It prints what
     * it finds to the console log and updates the text being displayed in the window with a
     * summary of the results.
     */

    // Result message for Problems 1-4
    var p1Message = 'SUCCESS';
    var p2Message = 'SUCCESS';
    var p3Message = 'SUCCESS';
    var p4Message = 'SUCCESS';

    // Keep track of all the var statements
    var varDeclared = ['varDeclared', 'p1Message', 'p2Message', 'p3Message', 'p4Message'];


    // ********************* Test cs142FormatTime

    if (typeof cs142FormatTime !== 'function') {
        console.error('cs142FormatTime is not a function', typeof cs142FormatTime);
        p1Message = 'FAILURE';
    } else {
        [
            {
                date: new Date(2015, 11, 30, 9, 10),
                expect: 'Wednesday, December 30, 2015 09:10 AM'
            },
            {
                date: new Date(2014, 0, 1, 13, 20),
                expect: 'Wednesday, January 1, 2014 01:20 PM'
            },
            {
                date: new Date(2013, 2, 26, 15, 1),
                expect: 'Tuesday, March 26, 2013 03:01 PM'
            },
            {
                date: new Date(2016, 7, 3, 0, 1),
                expect: 'Wednesday, August 3, 2016 12:01 AM'
            }
        ].forEach(function (test) {
                var got = cs142FormatTime(test.date);
                if (got !== test.expect) {
                    console.error('cs142FormatTime returned', got, 'instead of ', test.expect);
                    p1Message = 'FAILURE';
                }
            });
        varDeclared.push('got');
    }

    console.log('Test cs142FormatTime:', p1Message);

    // ********************* Test cs142filter

    if (typeof [].cs142filter !== 'function') {
        console.error('cs142filter is not a function', typeof [].cs142filter);
        p2Message = 'FAILURE';
    } else {

        var result = [1, 2, 3, 4, 5, 6].cs142filter(2, function (modVal, elm) {
            return ((elm % modVal) === 0);
        });

        if (!Array.isArray(result)) {
            console.error('cs142filter didn\'t return an array', result);
            p2Message = 'FAILURE';
        } else {
            var matchingArray = function matchingArray(a1, a2) {
                if (a1.length !== a2.length) {
                    return false;
                }
                for (var i = 0; i < a1.length; i++) {
                    if (a1[i] !== a2[i]) {
                        return false;
                    }
                }
                return true;
            };

            if (!matchingArray(result, [2, 4, 6])) {
                console.error('cs142filter didn\'t work on even test', result);
                p2Message = 'FAILURE';
            }
        }
        varDeclared.push('result');
        varDeclared.push('i');
    }
    console.log('Test cs142filter:', p2Message);

    // ********************* Test Cs142TemplateProcessor

    if (typeof Cs142TemplateProcessor !== 'function') {
        console.error('Cs142TemplateProcessor is not a function', Cs142TemplateProcessor);
        p3Message = 'FAILURE';
    } else {

        var template = 'My favorite month is {{month}} but not the day {{day}} or the year {{year}}';
        var dateTemplate = new Cs142TemplateProcessor(template);

        var dictionary = {month: 'July', day: '1', year: '2016'};
        var str = dateTemplate.fillIn(dictionary);

        if (str !== 'My favorite month is July but not the day 1 or the year 2016') {
            console.error('Cs142TemplateProcessor didn\'t work');
            p3Message = 'FAILURE';
        }
        varDeclared.push('template');
        varDeclared.push('dateTemplate');
        varDeclared.push('dictionary');
        varDeclared.push('str');
    }
    console.log('Test Cs142TemplateProcessor:', p3Message);

    // ********************* Test to see if the symbols we defined are in the global address space

    varDeclared.forEach(function (sym) {

        if (window[sym] !== undefined) {
            console.error('Found my symbol', sym, 'in DOM');
            p4Message = 'FAILURE';
        }
    });

    // Store the result back into the global space under the object name cs142Project2Results
    window.cs142Project2Results = {
        p1Message: p1Message,
        p2Message: p2Message,
        p3Message: p3Message,
        p4Message: p4Message
    };

    // Once the browser loads our companion HTML in cs142-test-project2.html we
    // update it with the results of our testing. This code will make more
    // sense after the next project.
    window.onload = function () {
        document.getElementById("cs142p1").innerText = p1Message;
        document.getElementById("cs142p2").innerText = p2Message;
        document.getElementById("cs142p3").innerText = p3Message;
        document.getElementById("cs142p4").innerText = p4Message;
    };
})();

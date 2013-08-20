/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global $, WebSocket */

(function () {
    "use strict";
    
    var ws = null;

    function displayState(state) {
        $("#state").text(state);
    }
    
    function writeToLog(message, className) {
        var $li = $("<li>");
        var $log = $("#log");
        $li.addClass(className);
        $li.text(message); // escapes HTML entities like & and <
        $log.append($li);
        $log.scrollTop($log.prop('scrollHeight')); // scroll to bottom
    }
    
    function receiveMessage(message) {
        writeToLog("received: " + message.data, "received");
    }
    
    function sendMessage(message) {
        var success = false;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(message);
                success = true;
            } catch (e) {
                console.error("Error sending message", e);
            }
        }
        
        if (success) {
            writeToLog("sent: " + message, "sent");
        } else {
            writeToLog("failed to send: " + message, "error");
        }
        
    }
    
    function createWebSocketConnection() {
        var wsUrl;
        // "wss" is for secure conenctions over https, "ws" is for regular
        if (window.location.protocol === "https:") {
            wsUrl = "wss://127.0.0.1:3000/";
        } else {
            wsUrl = "ws://127.0.0.1:3000/";
        }
        
        // create the websocket and immediately bind handlers
        ws = new WebSocket(wsUrl);
        displayState("created");
        ws.onopen = function () { displayState("open"); };
        ws.onmessage = receiveMessage;
        ws.onclose = function () { displayState("closed"); };
    }
    
    function handleFormSubmission() {
        var message = $("#textOutgoing").val();
        sendMessage(message);
        
        // clear the input box
        $("#textOutgoing").val("");
        return false; // don't actually submit the form
    }
    
    function init() {
        // open the websocket connection
        createWebSocketConnection();
        
        // register form submission handler (used for entering messages)
        $("#formOutgoing").on("submit", handleFormSubmission);
        
        // focus the input box
        $("#textOutgoing").focus();
        
    }
    
    // register init() to be called after page is loaded
    $(init);
    
}());
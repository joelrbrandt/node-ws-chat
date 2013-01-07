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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */
/*global */

(function () {
    "use strict";
    
    var http            = require('http'),
        connect         = require('connect'),
        WebSocketServer = require('ws').Server;
    
    var connections = [];
    var connectionCount = 1;
    
    function handleWebSocketConnection(conn) {
        // Give the connection a unique ID and add it to
        // the connection array
        conn.connectionID = connectionCount++;
        connections.push(conn);
        
        // Set up handlers for events that happen on this connection
        
        conn.on('close', function () {
            console.log('connection %d closed', conn.connectionID);
            var i = connections.indexOf(conn);
            if (i >= 0) {
                connections.splice(i, 1);
            }
        });
        
        conn.on('message', function (message) {
            console.log('received from %d: %s', conn.connectionID, message);
            // send message to all other connections
            connections.forEach(function (otherConn) {
                if (otherConn !== conn) {
                    try {
                        otherConn.send(message);
                    } catch (e) {
                        console.error("couldn't send to %d: %s",
                                      otherConn.connectionID,
                                      e.message);
                    }
                }
            });
        });
    }
    
    //
    // Setup and start the http and websocket server
    //
    
    // create the http server that serves static files from the
    // "public" directory
    var app = connect()
        .use(connect.favicon())
        .use(connect.logger('dev'))
        .use(connect['static']('public'));
    var server = http.createServer(app);
    
    // Create the WebSocket server and attach it to the http server
    var wss = new WebSocketServer({server: server});
    
    // Register websocket connection handler
    wss.on('connection', handleWebSocketConnection);
    
    // Start the whole server listening on a randomly assigned port
    server.listen(0, '127.0.0.1', function () {
        var address = server.address();
        console.log("Listening on http://" +
                    address.address + ":" + address.port);
    });
    
}());

Server Code Organization
===
The server is comprised of two main parts: the server.js file and the server_utils directory.

# server.js

This file is the main entry-point to the server. It makes use of Express server in order to serve static files as well as handle REST calls.

## Serving Static Files

Static files such as html, CSS, and javascript are sent to the client via the `express.static()` middleware function.

## REST Calls
### Authentication Middleware
Before a REST call can be reached, requests must go through an authentication middleware. This middleware checks to see if the request has a username and password associated with it, or if it has a JWT. In the case of a username and password, the `authenticationUtils.js` file is used to authenticate the user.

### Invoking Rscript
REST calls are handled mainly via the `app.post` function. 

Almost all REST calls require calling an R script to perform some kind of computation or data retrieval. Communicating with R occurs via the node.js `child_process.exec()` function. This spawns a shell that will execute an R script via the `Rscript` program. 

Arguments are passed in JSON format, and the R scripts all make use of the `jsonlite` package in order to parse the arguments.

---

# server_utils

This directory contains many javascript files that assist are used in `server.js` in order to reduce the amount of code in the file. 

Here is the directory structure:




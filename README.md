# EpiStroma-webapp 

A tool to analyze bi-partite and non-bipartite biological networks.

## Prerequisites

The app has several dependencies that cannot be obtained via bower or npm.
The server side code depends heavily on R scripts. Here are the R libraries needed for the server-side code:
* [data.table]
* [jsonlite]
* [Matrix]

### Installation

EpiStroma-webapp requires [node.js](https://nodejs.org/) v4+ to run.

EpiStroma-webapp requires [bower](https://bower.io) to install and update javascript dependencies.

Install the dependencies:

```sh
$ cd EpiStroma-webapp
$ npm install
$ bower install
```

### Running the app

The following needs to be run from the main EpiStroma-webapp directory which contains the server.js file.

```sh
$ node server.js
```

This starts the server on port 5000. To use the app, simply naviagate to http://localhost:5000/app/

### Main Directory Structure
```
.
├── app
├── node_modules
├── R_Scripts
├── server-utils
├── user_creation
├── .bowercc
├── .gitignore
├── bower.json
├── package.json
├── README.md
└── server.js
```

### Code Description
To see how the app works, click one of the following links:
* [Server](docs/server.md)
* [Client](docs/client.md)
* [R](docs/r.md)


   [data.table]: <https://cran.r-project.org/web/packages/data.table/index.html>
   [jsonlite]: <https://cran.r-project.org/web/packages/jsonlite/index.html>
   [Matrix]: <https://cran.r-project.org/web/packages/Matrix/index.html>
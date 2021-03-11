This web application is a modern take on information sharing for command and 
control in the continental United States.

The project is divided into several sections.

## Requirements

- [NPM/NodeJS](https://www.npmjs.com/get-npm)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
- [GoLang](https://golang.org/dl/)
- [Make](https://opensource.com/article/18/8/what-how-makefile#:~:text=The%20make%20utility%20requires%20a,be%20installed%20using%20make%20install%20)

## bmc2portal

This is the frontend website that a user will see. It is constructed using 
React (Javascript) Components and CSS styling. External communication is
handled via a REST API to the server in 'components/utils/backend.js'.

NOTE: If the REACT_APP_SERVER_BASE_URL environment variable is set to "development", 
the backend will mock all of the data returns for rapid testing and 
frontend only development.

## bmc2server

This is the backend server (written in GoLang) that provides the endpoints
for bmc2portal to retrieve information from the Database. It is an 
abstraction layer from actual DB queries.

Bottom line, it exposes the REST API to send/receive from the database via
http/https.

## bmc2db (TODO)

TODO - Setup and configuration files for the database (under construction).

## Developers & Contributors Notes

## Frontend-Only Development

- Primary: Run `make frontend-dev` (first time), subsequently `make frontend-dev-ni` to skip npm install.

- See [bmc2portal README](https://github.com/jemccarthy13/BMC2Portal/tree/master/bmc2portal) for 
additional react scripts and details on the frontend.

## Partial Integration Development

- Primary: Run `make server-mock` (first time), subsequently `make server-mock-ni` to skip npm install. This will also skip go get.

- See [bmc2portal README](https://github.com/jemccarthy13/BMC2Portal/tree/master/bmc2portal) for
additional react scripts and details on the frontend, and [bmc2server README](https://github.com/jemccarthy13/BMC2Portal/tree/master/bmc2server) for API references.

## Fully Integrated Development -- Not Available

1. TBD - establish a DBMS solution and write instructions to integrate full stack.
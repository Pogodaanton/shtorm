# Shtorm - The semi-automatic scriptable wiki bot

Shtorm executes javascript files with [Nodemw](https://github.com/macbre/nodemw). A front-end client is connected with the server, so that the user can answer specific requests from the script. The system is built on a task-based approach, so that multiple users can make use of a single script.


# Requirements
* Node.js
* yarn (optional; preferred)

# Installation
Download Shtorm
```bash
$ git clone https://github.com/Pogodaanton/shtorm.git && cd shtorm
```
Install dependencies
```bash
$ yarn
$ cd packages/shtorm-client && yarn
$ cd ../shtorm-server && yarn
$ cd ../../
```
Build client and deploy
```bash
$ yarn build
```
Or start development system
```bash
$ yarn start
```

# License
GPL-3.0
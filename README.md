## IOT Web Application

This is my IOT web application built with HTML, CSS and JavaScript for Front-end side. For the server side, I use NodeJS with Express framework and MySQL.

## Installation

Download this repo, extract and open it in Visual Studio Code. Open the terminal and type:

```bash
npm install
```

After that, it will install all the packages you need to run this application.

## Database Configuration

You need create database called "iot" and 2 tables: "action_history" (id, device_name, status, created_at) and "data_sensor" (id, temperature, humidity, light, created_at).

After that, you must connect your server with database, go into "server.js" file, change your database configuration:

```JavaScript
const db = mysql.createConnection({
  host: "<your host>",
  user: "<your user>",
  password: "<your password>",
  database: "iot",
});
```

## MQTT Configuration

You also need to config your mqtt client, change your option in mqtt connect function:

```JavaScript
const client = mqtt.connect("mqtt://<your mqtt host>:<your mqtt port number>/", {
  username: "<your mqtt username>",
  password: "<your mqtt password>",
});
```

## API Documentations

<a href="https://documenter.getpostman.com/view/24287979/2sA35BbjDb" target="_blank">Introduction</a>

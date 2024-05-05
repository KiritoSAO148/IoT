const app = require("./app");
const mqtt = require("mqtt");
const mysql = require("mysql");

const port = 3000;

const client = mqtt.connect("mqtt://192.188.12.104:2000/", {
  username: "buiquochuy",
  password: "buiqhuy148",
});

// client.on("message", (topic, message) => {
//   console.log(`Received MQTT message on topic ${topic}: ${message}`);
// });

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("huy/sensor");
  client.subscribe("devices/status");
});

client.on("reconnect", (error) => {
  console.error("reconnect failed", error);
});

client.on("error", (error) => {
  console.error("connection failed", error);
});

let currentLedState = 0;
let currentFanState = 0;
let currentAirconditionState = 0;

client.on("message", (topic, message) => {
  if (topic === "huy/sensor") {
    const sensorData = JSON.parse(message);
    const { temperature, humidity, light } = sensorData;

    const sql =
      "INSERT INTO data_sensor (temperature, humidity, light, created_at) VALUES (?, ?, ?, NOW())";

    db.query(sql, [temperature, humidity, light], (err, result) => {
      if (err) {
        console.error("Error inserting into data_sensor:", err);
      } else {
        // console.log("Sensor data inserted into the database");
      }
    });
  }
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Huy2582002",
  database: "iot_demo",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

let ledState = 0;
let fanState = 0;
let airconditionState = 0;

app.post("/api/v1/devices-control", (req, res) => {
  const { device_name, status } = req.body;

  if (device_name === "led") {
    ledState = status === "1" ? 1 : 0;
  } else if (device_name === "fan") {
    fanState = status === "1" ? 1 : 0;
  } else if (device_name === "aircondition") {
    airconditionState = status === "1" ? 1 : 0;
  }

  try {
    client.publish(
      "devices/control",
      JSON.stringify({
        led: `${ledState ? "on" : "off"}`,
        fan: `${fanState ? "on" : "off"}`,
        aircondition: `${airconditionState ? "on" : "off"}`,
      })
    );

    const messageListener = (topic, message) => {
      if (topic === "devices/status") {
        const { led, fan, aircondition } = JSON.parse(message);
        currentLedState = led === "on" ? 1 : 0;
        currentFanState = fan === "on" ? 1 : 0;
        currentAirconditionState = aircondition === "on" ? 1 : 0;

        // console.log(currentLedState, currentFanState);

        res.status(200).json({
          ledState: currentLedState,
          fanState: currentFanState,
          airconditionState: currentAirconditionState,
        });

        client.removeListener("message", messageListener);
      }
    };

    client.on("message", messageListener);

    // console.log("Published to MQTT:", {
    //   led: `${ledState ? "on" : "off"}`,
    //   fan: `${fanState ? "on" : "off"}`,
    // });
  } catch (err) {
    console.error("Error publishing to MQTT:", err.message);
    res.status(500).send("Internal Server Error");
  }

  const sql =
    "INSERT INTO action_history (device_name, status, created_at) VALUES (?, ?, NOW())";

  db.query(sql, [device_name, status], (err, result) => {
    if (err) {
      console.error("Error inserting into action_history:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // console.log("Record inserted into action_history");
      // res.status(200).json({ ledState: currentLedState });
    }
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get("/api/v1/sensor", (req, res) => {
  const sql = "SELECT * FROM data_sensor ORDER BY created_at DESC LIMIT 10";

  res.setHeader("Cache-Control", "no-store");

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching latest sensor data:", err);
      res.status(500).send("Internal Server Error");
    } else {
      result.reverse();
      res.json(result);
    }
  });
});

app.get("/api/v1/history-sensor", (req, res) => {
  const perPage = parseInt(req.query.pageSize) || 10;
  const page = parseInt(req.query.page) || 1;
  const sortField = req.query.sortField || "id";
  const sortBy = req.query.sortBy || "ASC";
  const keyword = req.query.keyword || "";
  const searchField = req.query.searchField || "all";

  let searchCondition = "";
  let searchValues = [];

  if (searchField !== "all" && keyword.trim() !== "") {
    searchCondition = ` WHERE ${searchField} LIKE ?`;
    searchValues = [`%${keyword.trim()}%`];
  } else if (searchField === "all" && keyword.trim() !== "") {
    const columns = ["id", "temperature", "humidity", "light", "created_at"];
    const conditions = columns.map((column) => `${column} LIKE ?`).join(" OR ");
    searchCondition = ` WHERE ${conditions}`;
    searchValues = columns.map(() => `%${keyword.trim()}%`);
  }

  const sql = `SELECT COUNT(*) AS total FROM data_sensor ${searchCondition}`;
  db.query(sql, searchValues, (err, result) => {
    if (err) {
      console.error("Error counting total records:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const totalRecords = result[0].total;
    const totalPages = Math.ceil(totalRecords / perPage);

    const offset = (page - 1) * perPage;

    let dataSql = `SELECT * FROM data_sensor ${searchCondition} ORDER BY ${sortField} ${sortBy} LIMIT ?, ?`;
    let dataValues = [...searchValues, offset, perPage];

    db.query(dataSql, dataValues, (err, result) => {
      if (err) {
        console.error("Error fetching sensor data:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.json({
        data: result,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    });
  });
});

app.get("/api/v1/history-action", (req, res) => {
  const perPage = parseInt(req.query.pageSize) || 10;
  const page = parseInt(req.query.page) || 1;
  const sortField = req.query.sortField || "id";
  const sortBy = req.query.sortBy || "ASC";
  const keyword = req.query.keyword || "";
  const searchField = req.query.searchField || "all";

  let searchCondition = "";
  let searchValues = [];

  if (searchField !== "all" && keyword.trim() !== "") {
    if (searchField === "created_at" && keyword.trim() !== "") {
      searchCondition = ` WHERE created_at LIKE ?`;
      searchValues = [`%${keyword.trim()}%`];
    } else if (
      searchField === "status" &&
      (keyword.trim().toLowerCase() === "on" ||
        keyword.trim().toLowerCase() === "off")
    ) {
      const statusValue = keyword.trim().toLowerCase() === "on" ? "1" : "0";
      searchCondition = ` WHERE ${searchField} = ?`;
      searchValues = [statusValue];
    } else {
      searchCondition = ` WHERE ${searchField} LIKE ?`;
      searchValues = [`%${keyword.trim()}%`];
    }
  } else if (searchField === "all" && keyword.trim() !== "") {
    const columns = ["id", "device_name", "status", "created_at"];
    const conditions = columns
      .map((column) => {
        if (column === "status") {
          return `CASE ${column} WHEN '1' THEN 'ON' WHEN '0' THEN 'OFF' END LIKE ?`;
        } else {
          return `${column} LIKE ?`;
        }
      })
      .join(" OR ");
    searchCondition = ` WHERE ${conditions}`;
    searchValues = columns.map(() => `%${keyword.trim()}%`);
  }

  const sql = `SELECT COUNT(*) AS total FROM action_history ${searchCondition}`;
  db.query(sql, searchValues, (err, result) => {
    if (err) {
      console.error("Error counting total records:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const totalRecords = result[0].total;
    const totalPages = Math.ceil(totalRecords / perPage);

    const offset = (page - 1) * perPage;

    let dataSql = `SELECT * FROM action_history ${searchCondition} ORDER BY ${sortField} ${sortBy} LIMIT ?, ?`;
    let dataValues = [...searchValues, offset, perPage];

    db.query(dataSql, dataValues, (err, result) => {
      if (err) {
        console.error("Error fetching sensor data:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.json({
        data: result,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    });
  });
});

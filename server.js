const app = require("./app");
const mqtt = require("mqtt");
const mysql = require("mysql");

const port = 3000;

const client = mqtt.connect("mqtt://172.20.10.3:2000/", {
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
  database: "iot",
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

app.post("/api/v1/led", (req, res) => {
  const { status } = req.body;
  // console.log(status);
  const device_name = "led";

  ledState = status === "1" ? 1 : 0;

  // console.log("Led State: ", ledState);
  // console.log("Fan State: ", fanState);

  try {
    client.publish(
      "devices/control",
      JSON.stringify({
        led: `${ledState ? "on" : "off"}`,
        fan: `${fanState ? "on" : "off"}`,
      })
    );

    const messageListener = (topic, message) => {
      if (topic === "devices/status") {
        const { led } = JSON.parse(message);
        currentLedState = led === "on" ? 1 : 0;

        res.status(200).json({ ledState: currentLedState });

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

app.post("/api/v1/fan", (req, res) => {
  const { status } = req.body;
  // console.log(status);
  const device_name = "fan";

  fanState = status === "1" ? 1 : 0;

  // console.log("Led State: ", ledState);
  // console.log("Fan State: ", fanState);

  try {
    client.publish(
      "devices/control",
      JSON.stringify({
        led: `${ledState ? "on" : "off"}`,
        fan: `${fanState ? "on" : "off"}`,
      })
    );

    const messageListener = (topic, message) => {
      if (topic === "devices/status") {
        const { fan } = JSON.parse(message);
        currentFanState = fan === "on" ? 1 : 0;

        res.status(200).json({ fanState: currentFanState });

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
      // console.error("Error inserting into action_history:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // console.log("Record inserted into action_history");
      // res.status(200).json({ fanState: currentFanState });
    }
  });
});

app.post("/api/v1/sensor", (req, res) => {
  const { temperature, humidity, light } = req.body;

  const sql =
    "INSERT INTO data_sensor (temperature, humidity, light, created_at) VALUES (?, ?, ?, NOW())";
  db.query(sql, [temperature, humidity, light], (err, result) => {
    if (err) {
      console.error("Error inserting into data_sensor:", err);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Sensor data inserted into the database");
      res.status(200).send("OK");
    }
  });
});

app.get("/api/v1/sensor", (req, res) => {
  const sql = "SELECT * FROM data_sensor ORDER BY created_at DESC LIMIT 10";

  res.setHeader("Cache-Control", "no-store");

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching latest sensor data:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(result);
    }
  });
});

app.get("/api/v1/history-devices", (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const query =
    "SELECT id, device_name, status, created_at FROM action_history";

  db.query(query, (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Chuyển đổi định dạng của created_at và thêm vào mảng data
    const formattedData = results.map((result) => {
      const createdAt = new Date(result.created_at);
      return {
        id: result.id,
        device: result.device_name,
        action: result.status,
        date: createdAt.toISOString().split("T")[0], // Lấy ngày
        time: createdAt.toLocaleTimeString(), // Lấy giờ
      };
    });

    res.json(formattedData);
  });
});

app.get("/api/v1/history-sensor", (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const query =
    "SELECT id, temperature, humidity, light, created_at FROM data_sensor";

  db.query(query, (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Chuyển đổi định dạng của created_at và thêm vào mảng data
    const formattedData = results.map((result) => {
      const createdAt = new Date(result.created_at);
      return {
        id: result.id,
        temperature: result.temperature,
        humidity: result.humidity,
        light: result.light,
        date: createdAt.toISOString().split("T")[0], // Lấy ngày
        time: createdAt.toLocaleTimeString(), // Lấy giờ
      };
    });

    res.json(formattedData);
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

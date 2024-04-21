const mqtt = require("async-mqtt");

const client = mqtt.connect("mqtt://192.188.12.108:1883/", {
  username: "buiquochuy",
  password: "buiqhuy148",
});

const topic = "location/gps/vehicle1";

client.on("connect", async () => {
  console.log("Connected to your MQTT Broker!");

  try {
    const messageToSend = "Hello, HiveMQ!";

    await client.publish(topic, messageToSend);

    console.log("Published to topic successfully");
  } catch (error) {
    console.error("Error publishing message:", error);
  }
});

client.on("connect", async () => {
  try {
    await client.subscribe("huy/sensor");

    console.log("Subscribed to topic successfully");
  } catch (err) {
    console.error("Error subscribing message:", error);
  }
});

client.on("message", (receivedTopic, payload) => {
  if (receivedTopic === "huy/sensor") {
    console.log("Received Message:", receivedTopic, payload.toString());
  }
});

client.on("error", (err) => {
  console.error("Error connecting to MQTT broker:", err);
});

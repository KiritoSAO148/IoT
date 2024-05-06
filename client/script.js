const lightImage = document.querySelector(".myLight");
const fanImage = document.querySelector(".myFan");
const btnLightOn = document.querySelector(".btnLightOn");
const btnLightOff = document.querySelector(".btnLightOff");
const btnFanOn = document.querySelector(".btnFanOn");
const btnFanOff = document.querySelector(".btnFanOff");
const tempValue = document.getElementById("tempValue");
const humidValue = document.getElementById("humidValue");
const lightValue = document.getElementById("lightValue");
const informationTempBox = document.querySelector(".informationTempBox");
const informationHumidBox = document.querySelector(".informationHumidBox");
const informationLightBox = document.querySelector(".informationLightBox");
const textLightOn = document.querySelector(".text-light-on");
const textLightOff = document.querySelector(".text-light-off");
const textFanOn = document.querySelector(".text-fan-on");
const textFanOff = document.querySelector(".text-fan-off");

let ledState = 0;
let fanState = 0;

function init() {
  if (ledState === 0) {
    btnLightOff.style.backgroundColor = "rgb(221, 62, 51)";
    btnLightOn.style.backgroundColor = "rgb(19, 125, 18)";
    textLightOff.style.color = "white";
  }
  if (fanState === 0) {
    btnFanOn.style.backgroundColor = "rgb(19, 125, 18)";
    btnFanOff.style.backgroundColor = "rgb(221, 62, 51)";
    textFanOff.style.color = "white";
  }
}

init();

function turnOnLight() {
  if (ledState === 0) {
    if (confirm("Turn the light on?")) {
      fetch("http://localhost:3000/api/v1/devices-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_name: "led",
          status: "1",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const currentLedState = data.ledState;
          console.log(data.ledState);

          if (data.ledState === 1) {
            lightImage.src = "./public/lighton.png";
            btnLightOn.style.backgroundColor = "rgb(44, 173, 39)";
            btnLightOff.style.backgroundColor = "rgb(161, 55, 34)";
            textLightOn.style.color = "white";
            textLightOff.style.color = "black";
            ledState = 1;
          }
        });
    }
  }
}

function turnOffLight() {
  if (ledState === 1) {
    if (confirm("Turn the light off?")) {
      fetch("http://localhost:3000/api/v1/devices-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_name: "led",
          status: "0",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const currentLedState = data.ledState;
          console.log(data.ledState);

          if (data.ledState === 0) {
            lightImage.src = "./public/lightoff.png";
            btnLightOn.style.backgroundColor = "rgb(19, 125, 18)";
            btnLightOff.style.backgroundColor = "rgb(221, 62, 51)";
            textLightOff.style.color = "white";
            textLightOn.style.color = "black";
            ledState = 0;
          }
        });
    }
  }
}

let rotationAngle = 0;

function rotateImage() {
  rotationAngle += 5;
  fanImage.style.transform = `rotate(${rotationAngle}deg)`;
}

// const rotationInterval = setInterval(rotateImage, 50);

// setTimeout(() => {
//   clearInterval(rotationInterval);
// }, 5000);

let rotationInterval = 0;
let initialRotationAngle = 0;

function turnOnFan() {
  if (fanState === 0) {
    if (confirm("Turn the fan on?")) {
      fetch("http://localhost:3000/api/v1/devices-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_name: "fan", status: "1" }),
      })
        .then((res) => res.json())
        .then((data) => {
          const currentFanState = data.fanState;
          console.log(data.fanState);

          if (data.fanState === 1) {
            rotationInterval = setInterval(rotateImage, 5);
            btnFanOn.style.backgroundColor = "rgb(44, 173, 39)";
            btnFanOff.style.backgroundColor = "rgb(161, 55, 34)";
            textFanOn.style.color = "white";
            textFanOff.style.color = "black";
            fanState = 1;
          }
        });
    }
  }
}

function turnOffFan() {
  if (fanState === 1) {
    if (confirm("Turn the fan off?")) {
      fetch("http://localhost:3000/api/v1/devices-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_name: "fan", status: "0" }),
      })
        .then((res) => res.json())
        .then((data) => {
          const currentFanState = data.fanState;
          console.log(data.fanState);

          if (data.fanState === 0) {
            clearInterval(rotationInterval);
            fanImage.style.transform = `rotate(${initialRotationAngle}deg)`;
            btnFanOn.style.backgroundColor = "rgb(19, 125, 18)";
            btnFanOff.style.backgroundColor = "rgb(221, 62, 51)";
            textFanOff.style.color = "white";
            textFanOn.style.color = "black";
            fanState = 0;
          }
        });
    }
  }
}

function createBlinkingAlert() {
  const alertDiv = document.querySelector(".informationBox");

  setInterval(() => {
    alertDiv.classList.toggle("blinking-alert");
  }, 1000);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeTextColor(temp, humid, light) {
  if (temp > 32) {
    informationTempBox.style.background =
      "linear-gradient(135deg, #E80505 65%, #FDD819 100%)";
  } else if (temp > 30) {
    informationTempBox.style.background = `linear-gradient(135deg, #E80505 55%, #FDD819 100%)`;
  } else if (temp > 28) {
    informationTempBox.style.background = `linear-gradient(135deg, #E80505 40%, #FDD819 100%)`;
  } else if (temp > 26) {
    informationTempBox.style.background = `linear-gradient(135deg, #E80505 30%, #FDD819 100%)`;
  } else {
    informationTempBox.style.background = `linear-gradient(135deg, #E80505 20%,  #FDD819 100%)`;
  }

  if (humid > 80) {
    informationHumidBox.style.background =
      "linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(1,85,124,1) 65%, rgba(0,212,255,1) 100%)";
  } else if (humid > 60) {
    informationHumidBox.style.background = `linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(1,85,124,1) 60%, rgba(0,212,255,1) 100%)`;
  } else if (humid > 40) {
    informationHumidBox.style.background = `linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(1,85,124,1) 55%, rgba(0,212,255,1) 100%)`;
  } else if (humid > 20) {
    informationHumidBox.style.background = `linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(1,85,124,1) 50%, rgba(0,212,255,1) 100%)`;
  } else {
    informationHumidBox.style.background = `linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(1,85,124,1) 45%, rgba(0,212,255,1) 100%)`;
  }

  if (light > 3000) {
    informationLightBox.style.background =
      "linear-gradient(315deg, rgba(2,0,36,1) 0%, rgba(190,186,89,1) 25%, rgba(255,254,121,1) 100%)";
  } else if (light > 2400) {
    informationLightBox.style.background = `linear-gradient(315deg, rgba(2,0,36,1) 0%, rgba(190,186,89,1) 30%, rgba(255,254,121,1) 100%)`;
  } else if (light > 1700) {
    informationLightBox.style.background = `linear-gradient(315deg, rgba(2,0,36,1) 0%, rgba(190,186,89,1) 35%, rgba(255,254,121,1) 100%)`;
  } else if (light > 1200) {
    informationLightBox.style.background = `linear-gradient(315deg, rgba(2,0,36,1) 0%, rgba(190,186,89,1) 40%, rgba(255,254,121,1) 100%)`;
  } else {
    informationLightBox.style.background = `linear-gradient(315deg, rgba(2,0,36,1) 0%, rgba(190,186,89,1) 60%, rgba(255,254,121,1) 100%)`;
  }
}

function updateChartWithSensorData(temperature, humidity, light, timestamp) {
  changeTextColor(temperature, humidity, light);

  document.getElementById("tempValue").innerHTML = temperature;
  document.getElementById("lightValue").innerHTML = light;
  document.getElementById("humidValue").innerHTML = humidity;

  if (chart.data.labels.length >= 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
    chart.data.datasets[2].data.shift();
  }

  chart.data.labels.push(
    `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`
  );

  chart.data.datasets[0].data.push(temperature);
  chart.data.datasets[1].data.push(humidity);
  chart.data.datasets[2].data.push(light);

  chart.update();
}

function generateRandomValue() {
  let temp = getRandomNumber(1, 100);
  let humid = getRandomNumber(1, 100);
  let light = Math.floor(Math.random() * (4000 - 1 + 1)) + 1;

  changeTextColor(temp, humid, light);

  document.getElementById("tempValue").innerHTML = temp;
  document.getElementById("lightValue").innerHTML = light;
  document.getElementById("humidValue").innerHTML = humid;

  function updateChart() {
    if (chart.data.labels.length > 10) {
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
      chart.data.datasets[2].data.shift();
      chart.data.labels.shift();
    }
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(humid);
    chart.data.datasets[2].data.push(light);
    chart.data.labels.push(
      new Date().getHours() +
        ":" +
        new Date().getMinutes() +
        ":" +
        new Date().getSeconds()
    );
    //update.data.labels.push(new Date().getSeconds());
    chart.update();
  }
  document.querySelectorAll(".informationBox").forEach((box) => {
    box.classList.remove("blinking-red");
  });
  updateChart();
}

const chart = new Chart("chartInformation", {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature",
        borderColor: "red",
        backgroundColor: "red",
        lineTension: 0,
        data: [],
        fill: false,
      },
      {
        label: "Humidity",
        borderColor: "blue",
        backgroundColor: "blue",
        lineTension: 0,
        data: [],
        fill: false,
      },
      {
        label: "Light",
        borderColor: "orange",
        backgroundColor: "orange",
        lineTension: 0,
        data: [],
        fill: false,
      },
    ],
  },
  options: {
    onClick: function (event, elements) {
      if (elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        const meta = chart.getDatasetMeta(datasetIndex);

        meta.hidden = !meta.hidden;

        chart.update();
      }
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },

    onHover(event) {
      event.target.style.cursor = "default";
    },

    // hover: {
    //     onHover: (event) => {
    //     event.target.style.cursor  = 'pointer';
    // }
    // },
  },
});
// setInterval(generateRandomValue, 1000);

// function loadLatestSensorData() {
//   fetch("http://localhost:3000/api/v1/sensor")
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.length > 0) {
//         const latestData = data[0];
//         const temperatureData = latestData.temperature;
//         const humidityData = latestData.humidity;
//         const lightData = latestData.light;

//         document.getElementById("tempValue").innerHTML = temperatureData;
//         document.getElementById("humidValue").innerHTML = humidityData;
//         document.getElementById("lightValue").innerHTML = lightData;

//         const timestamp = new Date(latestData.created_at);
//         updateChartWithSensorData(
//           temperatureData,
//           humidityData,
//           lightData,
//           timestamp
//         );
//       }
//     })
//     .catch((error) => {
//       console.error("Error loading latest sensor data:", error);
//     });
// }

// loadLatestSensorData();

function loadInitialChartData() {
  fetch("http://localhost:3000/api/v1/sensor")
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((entry) => {
          const timestamp = new Date(entry.created_at);
          chart.data.labels.push(
            `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`
          );
          chart.data.datasets[0].data.push(entry.temperature);
          chart.data.datasets[1].data.push(entry.humidity);
          chart.data.datasets[2].data.push(entry.light);
        });
        chart.update();
      }
    })
    .catch((error) => {
      console.error("Error loading initial chart data:", error);
    });
}

function updateChartWithLatestData() {
  fetch("http://localhost:3000/api/v1/sensor")
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const latestData = data[data.length - 1];

        const temperatureData = latestData.temperature;
        const humidityData = latestData.humidity;
        const lightData = latestData.light;
        const timestamp = new Date(latestData.created_at);

        document.getElementById("tempValue").innerHTML = temperatureData;
        document.getElementById("humidValue").innerHTML = humidityData;
        document.getElementById("lightValue").innerHTML = lightData;

        updateChartWithSensorData(
          temperatureData,
          humidityData,
          lightData,
          timestamp
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching latest sensor data:", error);
    });
}

loadInitialChartData();
setInterval(updateChartWithLatestData, 3000);

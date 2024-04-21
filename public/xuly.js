var socket = io("")

socket.on("server-update-data", function (data) {
    
    $("#temp-value").html(data.temp + "°C")
    $("#humi-value").html(data.humi + "%")
    $("#light-value").html(data.light+"%")

    //Warning mode
    var warningSection = document.getElementById("alertLight")
    if (data.light > 999999) {
        warningSection.classList.add("warning-mode-on")
    } else {
        warningSection.classList.remove("warning-mode-on")
    }

    var warningSection = document.getElementById("alertHumi")
    if (data.humi > 9999) {
        warningSection.classList.add("warning-mode-on")
    } else {
        warningSection.classList.remove("warning-mode-on")
    }


    //History page
    $("#id-content").append("<div class='h-para'>" + data.id + "</div>")
    $("#time-content").append("<div class='h-para'>" + data.time + "</div>")
    $("#temp-content").append("<div class='h-para'>" + data.temp + "</div>")
    $("#humi-content").append("<div class='h-para'>" + data.humi + "</div>")
   $("#light-content").append("<div class='h-para'>" + data.light + "</div>")
})

socket.on("send-full", function (data) {

    // History page
    $("#time-content").html("")
    $("#temp-content").html("")
    $("#humi-content").html("")
    $("#id-content").html("")
    $("#light-content").html("")

    //console.log(data)
    data.forEach(function (item) {
        $("#time-content").append("<div class='h-para'>" + item.time + "</div>")
        $("#temp-content").append("<div class='h-para'>" + item.temp + "</div>")
        $("#humi-content").append("<div class='h-para'>" + item.humi + "</div>")
        $("#id-content").append("<div class='h-para'>" + item.id + "</div>")
        $("#light-content").append("<div class='h-para'>" + item.light + "</div>")
    })
    //console.log("asldasdjalsdas")
})

// --------------------------------------- Control devices function ---------------------------------
var denstate = 0;
var quatstate = 0;
function denon() {
    if (denstate == 0) {
        // if (confirm('bat')) {
            document.getElementById('anhden').src = 'lighton.png';
            socket.emit("eventden", "on");
            denstate = 1;
            //document.getElementById('bgden1').style.backgroundColor = "red";              //bg color change
            //console.log("121212121212")
        // }
    }
}
function denoff() {
    if (denstate == 1) {
        document.getElementById('anhden').src = 'lightoff.png';
        socket.emit("eventden", "off");
        denstate = 0;
        //document.getElementById('bgden1').style.backgroundColor = "gray";

    }
}
function quaton() {
    if (quatstate == 0) {
        document.getElementById('anhquat').src = 'fanon.png';
        socket.emit("eventquat", "on");
        quatstate = 1;
    }
}
function quatoff() {
    if (quatstate == 1) {
        document.getElementById('anhquat').src = 'fanoff.png';
        socket.emit("eventquat", "off");
        quatstate = 0;
    }
}

//-------------------------------------------------------socket event--------------------------------------------------
socket.on("notify-den", function (data) {
    if (data == "on")
    {document.getElementById('anhden').src = 'lighton.png';
    denstate = 1;}
    //console.log("okkkkkkkkkk");
    else {document.getElementById('anhden').src = 'lightoff.png';
    denstate = 0;}
});

socket.on("notify-quat", function (data) {
    if (data == "on")
    {document.getElementById('anhquat').src = 'fanon.png';
    quatstate = 1;}
    //console.log("okkkkkkkkkk");
    else {document.getElementById('anhquat').src = 'fanoff.png';
    quatstate = 0;}
});








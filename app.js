(function() {
  var pings, interval;
  var ui = {
    inputs: {
      url: document.getElementById("url"),
      username: document.getElementById("username"),
      credential: document.getElementById("credential"),
    },

    container: document.querySelector(".container"),
    runTest: document.querySelector("button.run"),
    stopTest: document.querySelector("button.stop"),

    results: document.querySelector(".results"),

    status: document.querySelector(".results .message"),
    sent: document.querySelector(".results .sent .badge"),
    received: document.querySelector(".results .received .badge"),
    dropped: document.querySelector(".results .dropped .badge")
  }

  function updateUI(message, type) {
    var message = message || ui.status.innerHTML;
    var type = type || "info";

    ui.sent.textContent = pings.sent;
    ui.received.textContent = pings.received;
    ui.dropped.textContent = pings.dropped;
    ui.status.innerHTML = message;

    ui.results.classList.remove("alert-success");
    ui.results.classList.remove("alert-warning");
    ui.results.classList.remove("alert-info");
    ui.results.classList.remove("alert-danger");
    ui.results.classList.add("alert-" + type);
  }

  function start() {
    var config = {
      iceServers: [{
        url: ui.inputs.url.value,
        username: ui.inputs.username.value,
        credential: ui.inputs.credential.value
      }]
    };
    var peer1 = new Peer(config);
    var peer2 = new Peer(config);

    pings = {
      sent:     0,
      received: 0,
      dropped:  0
    };
    updateUI("ICE connecting: ...");

    peer1.on("offer", function(offer) {
      peer2.createAnswer(offer);
    });
    peer2.on("answer", function(answer) {
      peer1.acceptAnswer(answer);
    });

    peer1.on("ice", function(state) {
      var type = (state === "failed") ? "danger" : "info";
      var messages = {
        "connected": "waiting for datachannel connection",
        "failed": "you may want to check your server configuration"
      };
      var message = messages[state];

      if (message)
        message = "ICE " + state + ": " + message;
      updateUI(message, type);
    });

    peer1.on("connected", function() {
      interval = setInterval(function() {
        peer1.send({type: "ping", ping: pings.sent});
        pings.sent += 1;
      }, 200);

      updateUI("Datachannel connected: congratulation your server " +
               "is well configured", "success");
    });

    peer2.on("ping", function(message) {
      if (message.ping > (pings.received + pings.dropped + 1)) {
        pings.dropped += message.ping - pings.received;
      }
      pings.received += 1;
      updateUI(undefined, "success");
    });

    peer1.createOffer();
  }

  ui.runTest.addEventListener("click", function(event) {
    event.preventDefault();
    start();
    ui.container.classList.add("running");
    ui.results.classList.remove("hidden");
  });

  ui.stopTest.addEventListener("click", function(event) {
    event.preventDefault();
    clearInterval(interval);
    ui.container.classList.remove("running");
  });
}());

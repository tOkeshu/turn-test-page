var Peer = (function() {

  function getLocalIPs() {
    return ["10.249.25.61", "89.246.75.169", "0.0.0.0"];
    // return ["10.249.25.61", "89.246.75.169"];
  };

  function Peer(config) {
    var pc = new mozRTCPeerConnection(config);
    pc.oniceconnectionstatechange = this._onIceStateChange.bind(this);
    pc.onicecandidate = this._onNewIceCandidate.bind(this);

    this.pc = pc;
    this.dc = pc.createDataChannel("foo", {
      negotiated:true,
      maxRetransmits: 0, // unreliable mode
      id: 0
    });

    this.dc.onopen = this._onDatachannelOpen.bind(this);
    this.dc.onmessage = this._onDatachannelMessage.bind(this);
  }

  Peer.prototype = {
    createOffer: function() {
      this.pc.createOffer(function(offer) {
        offer = this._mangleSDP(offer);
        this.pc.setLocalDescription(offer, function() {
          this.trigger("offer", offer);
        }.bind(this));
      }.bind(this), function() {});
    },

    createAnswer: function(offer) {
      offer = new mozRTCSessionDescription(offer);
      this.pc.setRemoteDescription(offer, function() {
        this.pc.createAnswer(function(answer) {
          answer = this._mangleSDP(answer);
          this.pc.setLocalDescription(answer, function() {
            this.trigger("answer", answer);
          }.bind(this));
        }.bind(this), function() {});
      }.bind(this), function() {});
    },

    acceptAnswer: function(answer) {
      answer = new mozRTCSessionDescription(answer);
      this.pc.setRemoteDescription(answer);
    },

    send: function(data) {
      var message = JSON.stringify(data);
      this.dc.send(message);
    },

    _onNewIceCandidate: function(event) {
      this.trigger("icecandidate", event.candidate);
    },

    _onIceStateChange: function() {
      this.trigger("ice", this.pc.iceConnectionState);
    },

    _onDatachannelOpen: function() {
      this.trigger("connected");
    },

    _onDatachannelMessage: function(event) {
      var message = JSON.parse(event.data);
      this.trigger(message.type, message);
    },

    _mangleSDP: function(payload) {
      var localIPs = getLocalIPs();
      // ["1.2.3.4", "5.6.7.8"] => /1\.2\.3\.4|5\.6\.7\.8/g
      var regex = new RegExp(getLocalIPs().map(function(ip) {
        return ip.replace(/\./g, "\\.");
      }).join("|"), "g");

      payload.sdp = payload.sdp.replace(regex, "1.1.1.1");
      return payload;
    }
  };

  MicroEvent.mixin(Peer);
  Peer.prototype.on = Peer.prototype.bind;

  return Peer;
}());

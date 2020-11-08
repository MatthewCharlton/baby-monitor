import React from 'react';

class WebRTCVideoChat extends React.Component {
  constructor() {
    super();
    const conf = { iceServers: [{ urls: [] }] };
    this.pc = new RTCPeerConnection(conf);

    this.localStream = undefined;
    this.chatEnabled = undefined;
    this._fileChannel = undefined;
    this.context = undefined;
    this.source = undefined;
    this._chatChannel = undefined;
    this.context = undefined;
    this.sendFileDom = {};
    this.recFileDom = {};
    this.receiveBuffer = [];
    this.receivedSize = 0;
    this.file = undefined;
    this.bytesPrev = 0;
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        console.log('stream', stream);
        this.localStream = stream;
        this.micused.innerHTML = this.localStream.getAudioTracks()[0].label;
        this.pc.addStream(stream);
        try {
          this.local.srcObject = stream;
        } catch (error) {
          this.local.src = window.URL.createObjectURL(stream);
        }
        this.local.muted = true;
      })
      .catch(this.errHandler);

    this.pc.ondatachannel = (e) => {
      if (e.channel.label === 'fileChannel') {
        console.log('fileChannel Received -', e);
        this._fileChannel = e.channel;
        this.fileChannel(e.channel);
      }
      if (e.channel.label === 'chatChannel') {
        console.log('chatChannel Received -', e);
        this._chatChannel = e.channel;
        this.chatChannel(e.channel);
      }
    };
    this.pc.onicecandidate = (e) => {
      var cand = e.candidate;
      console.log('onicecandidate', this);

      if (!cand) {
        console.log('iceGatheringState complete', this.pc.localDescription.sdp);
        this.localOffer.value = JSON.stringify(this.pc.localDescription);
      } else {
        console.log(cand.candidate);
      }
    };
    this.pc.oniceconnectionstatechange = () => {
      console.log('iceconnectionstatechange: ', this.pc.iceConnectionState);
    };
    this.pc.onaddstream = (e) => {
      console.log('remote onaddstream', e.stream);
      try {
        this.remote.srcObject = e.stream;
      } catch (error) {
        this.remote.src = window.URL.createObjectURL(e.stream);
      }
    };
    this.pc.onconnection = (e) => {
      console.log('onconnection ', e);
    };
    this.streamAudioFile.onchange = () => {
      console.log('streamAudioFile');
      this.context = new AudioContext();
      var file = this.streamAudioFile.files[0];
      if (file) {
        if (file.type.match('audio*')) {
          var reader = new FileReader();
          reader.onload = (readEvent) => {
            this.context.decodeAudioData(readEvent.target.result, (buffer) => {
              // create an audio source and connect it to the file buffer
              this.source = this.context.createBufferSource();
              this.source.buffer = buffer;
              this.source.start(0);

              // connect the audio stream to the audio hardware
              this.source.connect(this.context.destination);

              // create a destination for the remote browser
              var remote = this.context.createMediaStreamDestination();

              // connect the remote destination to the source
              this.source.connect(remote);

              this.local.srcObject = remote.stream;
              this.local.muted = true;
              // add the stream to the peer connection
              this.pc.addStream(remote.stream);

              // create a SDP offer for the new stream
              // pc.createOffer(setLocalAndSendMessage);
            });
          };

          reader.readAsArrayBuffer(file);
        }
      }
    };
    this.fileTransfer.onchange = (e) => {
      var files = this.fileTransfer.files;
      if (files.length > 0) {
        this.file = files[0];
        this.sendFileDom.name = this.file.name;
        this.sendFileDom.size = this.file.size;
        this.sendFileDom.type = this.file.type;
        this.sendFileDom.fileInfo = 'areYouReady';
        console.log(this.sendFileDom);
      } else {
        console.log('No file selected');
      }
    };
    this.remoteOfferGot.onclick = () => {
      var _remoteOffer = new RTCSessionDescription(
        JSON.parse(this.remoteOffer.value)
      );
      console.log('remoteOffer \n', _remoteOffer);
      this.pc
        .setRemoteDescription(_remoteOffer)
        .then(() => {
          console.log('setRemoteDescription ok');
          if (_remoteOffer.type === 'offer') {
            this.pc
              .createAnswer()
              .then((description) => {
                console.log('createAnswer 200 ok \n', description);
                this.pc
                  .setLocalDescription(description)
                  .then(() => {})
                  .catch(this.errHandler);
              })
              .catch(this.errHandler);
          }
        })
        .catch(this.errHandler);
    };

    this.enableChat();
  }
  setLocalOffer = () => {
    if (this.chatEnabled) {
      this._chatChannel = this.pc.createDataChannel('chatChannel');
      this._fileChannel = this.pc.createDataChannel('fileChannel');
      // _fileChannel.binaryType = 'arraybuffer';
      this.chatChannel(this._chatChannel);
      this.fileChannel(this._fileChannel);
    }

    this.pc
      .createOffer()
      .then((des) => {
        console.log('createOffer ok ');
        this.pc
          .setLocalDescription(des)
          .then(() => {
            setTimeout(() => {
              if (this.pc.iceGatheringState === 'complete') {
                return;
              } else {
                console.log('after GetherTimeout');
                this.localOffer.value = JSON.stringify(
                  this.pc.localDescription
                );
              }
            }, 2000);
            console.log('setLocalDescription ok');
          })
          .catch(this.errHandler);
        // For chat
      })
      .catch(this.errHandler);
  };

  fileChannel = (e) => {
    this._fileChannel.onopen = (e) => {
      console.log('file channel is open', e);
    };
    this._fileChannel.onmessage = (e) => {
      // Figure out data type
      var type = Object.prototype.toString.call(e.data),
        data;
      if (type === '[object ArrayBuffer]') {
        data = e.data;
        this.receiveBuffer.push(data);
        this.receivedSize += data.byteLength;
        this.recFileProg.value = this.receivedSize;
        if (this.receivedSize === this.recFileDom.size) {
          var received = new window.Blob(this.receiveBuffer);
          this.file_download.href = URL.createObjectURL(received);
          this.file_download.innerHTML = 'download';
          this.file_download.download = this.recFileDom.name;
          // rest
          this.receiveBuffer = [];
          this.receivedSize = 0;
          // clearInterval(window.timer);
        }
      } else if (type === '[object String]') {
        data = JSON.parse(e.data);
      } else if (type === '[object Blob]') {
        data = e.data;
        this.file_download.href = URL.createObjectURL(data);
        this.file_download.innerHTML = 'download';
        this.file_download.download = this.recFileDom.name;
      }

      // Handle initial msg exchange
      if (data.fileInfo) {
        if (data.fileInfo === 'areYouReady') {
          this.recFileDom = data;
          this.recFileProg.max = data.size;
          var sendData = JSON.stringify({ fileInfo: 'readyToReceive' });
          this._fileChannel.send(sendData);
          window.timer = setInterval(() => {
            this.stats();
          }, 1000);
        } else if (data.fileInfo === 'readyToReceive') {
          this.sendFileProg.max = this.sendFileDom.size;
          this.sendFileinChannel(); // Start sending the file
        }
        console.log('_fileChannel: ', data.fileInfo);
      }
    };
    this._fileChannel.onclose = () => {
      console.log('file channel closed');
    };
  };

  stats = () => {
    this.pc.getStats(null, (stats) => {
      for (var key in stats) {
        var res = stats[key];
        console.log(res.type, res.googActiveConnection);
        if (
          res.type === 'googCandidatePair' &&
          res.googActiveConnection === 'true'
        ) {
          // calculate current bitrate
          var bytesNow = res.bytesReceived;
          console.log('bit rate', bytesNow - this.bytesPrev);
          this.bytesPrev = bytesNow;
        }
      }
    });
  };

  enableChat = () => {
    this.enable_chat.checked
      ? (this.chatEnabled = true)
      : (this.chatEnabled = false);
  };

  sendMsg = () => {
    var text = this.sendTxt.value;
    this.chat.innerHTML =
      this.chat.innerHTML + '<pre class=sent>' + text + '</pre>';
    this._chatChannel.send(text);
    this.sendTxt.value = '';
    return false;
  };

  chatChannel(e) {
    this._chatChannel.onopen = (e) => {
      console.log('chat channel is open', e);
    };
    this._chatChannel.onmessage = (e) => {
      this.chat.innerHTML = this.chat.innerHTML + '<pre>' + e.data + '</pre>';
    };
    this._chatChannel.onclose = () => {
      console.log('chat channel closed');
    };
  }

  sendFileinChannel = () => {
    var chunkSize = 16384;
    var sliceFile = (offset) => {
      var reader = new window.FileReader();
      reader.onload = (() => {
        return (e) => {
          this._fileChannel.send(e.target.result);
          if (this.file.size > offset + e.target.result.byteLength) {
            window.setTimeout(sliceFile, 0, offset + chunkSize);
          }
          this.sendFileProg.value = offset + e.target.result.byteLength;
        };
      })(this.file);
      var slice = this.file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
  };

  audioRTC = (cb) => {
    console.log('streamAudioFile');
    this.context = new AudioContext();
    var file = this.streamAudioFile.files[0];
    if (file) {
      if (file.type.match('audio*')) {
        var reader = new FileReader();
        reader.onload = (readEvent) => {
          this.context.decodeAudioData(readEvent.target.result, (buffer) => {
            // create an audio source and connect it to the file buffer
            var source = this.context.createBufferSource();
            source.buffer = buffer;
            source.start(0);

            // connect the audio stream to the audio hardware
            source.connect(this.context.destination);

            // create a destination for the remote browser
            var remote = this.context.createMediaStreamDestination();

            // connect the remote destination to the source
            source.connect(remote);
            window.localStream = remote.stream;
            cb({ status: 'success', stream: true });
          });
        };

        reader.readAsArrayBuffer(file);
      }
    }
  };

  sendFile = () => {
    if (!this.fileTransfer.value) return;
    var fileInfo = JSON.stringify(this.sendFileDom);
    this._fileChannel.send(fileInfo);
    console.log('file info sent');
  };

  errHandler = (err) => {
    console.log(err);
  };

  render() {
    return (
      <div>
        <div>
          <input
            type="checkbox"
            ref={(c) => {
              this.enable_chat = c;
            }}
            onClick={this.enableChat}
            defaultChecked
          />
          > Enable chat
          <span
            // id="micused"
            ref={(c) => {
              this.micused = c;
            }}
            style={{ right: 0, position: 'fixed' }}
          />
        </div>
        <div>
          <p>
            <video
              ref={(c) => {
                this.local = c;
              }}
              width={250}
              //   id="local"
              controls
              autoPlay
            />
            Local
            <textarea
              rows="4"
              cols="50"
              //   id="localOffer"
              ref={(c) => {
                this.localOffer = c;
              }}
            />
            <button
              //   id="localOfferSet"
              ref={(c) => {
                this.localOfferSet = c;
              }}
              onClick={this.setLocalOffer}
            >
              CreateOffer
            </button>
          </p>
        </div>
        <div>
          <h4>LocalStream</h4>
          <input
            type="checkbox"
            // id="enableAudioFile"
            ref={(c) => {
              this.enableAudioFile = c;
            }}
          />
          Audio File
          <input
            type="file"
            // id="streamAudioFile"
            ref={(c) => {
              this.streamAudioFile = c;
            }}
          />
          <br />
          <input
            type="checkbox"
            // id="enable_mic"
            ref={(c) => {
              this.enable_mic = c;
            }}
            defaultChecked
          />
          Microphone
        </div>
        <div>
          <p>
            <video
              width={250}
              //   id="remote"
              ref={(c) => {
                this.remote = c;
              }}
              controls
              autoPlay
            />
            Remote
            <textarea
              //   id="remoteOffer"
              ref={(c) => {
                this.remoteOffer = c;
              }}
              rows="4"
              cols="50"
              placeholder="Paste remote SDP"
            />
            <button
              ref={(c) => {
                this.remoteOfferGot = c;
              }}
              //   id="remoteOfferGot"
            >
              Answer
            </button>
          </p>
        </div>
        <div
          //   id="chat"
          ref={(c) => {
            this.chat = c;
          }}
          style={{ overflow: 'scroll' }}
        />
        <div>
          <br />
          <br />
          <form action="">
            <input
              //   id="sendTxt"
              ref={(c) => {
                this.sendTxt = c;
              }}
              type="text"
              name=""
              placeholder="chat here"
              size="50"
            />
            <button type="button" onClick={this.sendMsg}>
              send
            </button>
          </form>
        </div>
        <div>
          <p>File transfer:</p>
          <div>
            <progress
              value="0"
              //   id="sendFileProg"
              ref={(c) => {
                this.sendFileProg = c;
              }}
            />
            <input
              type="file"
              name=""
              //   id="fileTransfer"
              ref={(c) => {
                this.fileTransfer = c;
              }}
            />
            <button type="submit" onClick={this.sendFile}>
              send
            </button>
          </div>
          <div>
            <p>
              <progress
                value="0"
                // id="recFileProg"
                ref={(c) => {
                  this.recFileProg = c;
                }}
              />
              <button
                // id="file_download"
                ref={(c) => {
                  this.file_download = c;
                }}
              >
                File Download
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default WebRTCVideoChat;

import React from 'react';

import QRCodeScanner from './components/QRCodeScanner';
import QRCodeGenerator from './components/QRCodeGenerator';
import WebRTCVideoChat from './components/WebRTCVideoChat';

import './App.css';

class App extends React.Component {
  // componentDidMount() {
  //   require('./components/WEBRTC-demo');
  // }

  state = {
    unit: 'baby',
  };

  handleClick = ({ target }) => {
    const { unit } = target.dataset;
    this.setState({ unit });
  };

  render() {
    return (
      <div className="App">
        <div id="debug"></div>

        {this.state.unit === 'baby' ? <QRCodeGenerator /> : <QRCodeScanner />}

        <button onClick={this.handleClick} data-unit="baby">
          Baby Unit
        </button>
        <button onClick={this.handleClick} data-unit="parent">
          Parent Unit
        </button>
        <WebRTCVideoChat />

        {/* <div>
          <input
            type="checkbox"
            id="enable_chat"
            onClick="enableChat()"
            defaultChecked
          />
          > Enable chat
          <span id="micused" style={{ right: 0, position: 'fixed' }} />
        </div> */}

        {/* <div>
          <h4>LocalStream</h4>
          <input type="checkbox" id="enableAudioFile" />
          Audio File
          <input type="file" id="streamAudioFile" />
          <br />
          <!-- <input type="checkbox" id="enable_mic" defaultChecked>Microphone -->
        </div> */}
        {/* <div>
          <p>
            <video width={250} id="local" controls autoPlay />
            Local
            <textarea rows="4" cols="50" id="localOffer" />
            <button id="localOfferSet">CreateOffer</button>
          </p>
        </div> */}
        {/* <div>
          <p>
            <video width={250} id="remote" controls autoPlay />
            Remote
            <textarea
              id="remoteOffer"
              rows="4"
              cols="50"
              placeholder="Paste remote SDP"
            />
            <button id="remoteOfferGot">Answer</button>
          </p>
        </div>
        <div id="chat" style={{ overflow: 'scroll' }} />
        <div>
          <br />
          <br />
          <form action="">
            <input
              id="sendTxt"
              type="text"
              name=""
              placeholder="chat here"
              size="50"
            />
            <button type="button" onClick="sendMsg()">
              send
            </button>
          </form>
        </div>
        <div>
          <p>File transfer:</p>
          <div>
            <progress value="0" id="sendFileProg" />
            <input type="file" name="" id="fileTransfer" />
            <button type="submit" onClick="sendFile()">
              send
            </button>
          </div>
          <div>
            <p>
              <progress value="0" id="recFileProg" />
              <button id="file_download">File Download</button>
            </p>
          </div>
        </div> */}
      </div>
    );
  }
}

export default App;

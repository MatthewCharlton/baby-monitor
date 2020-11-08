import React from 'react';
import QRCodeGen from 'qrcode.react';

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

class QRCodeGenerator extends React.Component {
  state = {
    input: '',
  };

  handleChange = ({ target }) => {
    const chunks = chunkSubstr(target.value, 400);

    console.log('chunks', chunks);

    chunks.forEach((chunk, idx) => {
      setTimeout(() => this.setState({ input: chunk }), 1500 * idx);
    });
  };

  render() {
    return (
      <div style={{ margin: '20px auto' }}>
        <QRCodeGen level="L" size={400} value={this.state.input} />
        <p>
          <input onChange={this.handleChange} />
        </p>
      </div>
    );
  }
}

export default QRCodeGenerator;

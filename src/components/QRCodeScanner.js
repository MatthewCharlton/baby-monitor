import React from 'react';
import QrReader from 'react-qr-reader';

class QRCodeScanner extends React.Component {
  state = {
    result: '',
  };

  handleScan = (data) => {
    if (data) {
      this.setState(({ result }) => {
        if (!result.includes(data))
          return {
            result: result.concat(data),
          };
      });
    }
  };
  handleError = (err) => {
    console.error(err);
  };
  render() {
    return (
      <div style={{ margin: '20px auto' }}>
        <QrReader
          delay={600}
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
        />
        <p>{this.state.result}</p>
      </div>
    );
  }
}
export default QRCodeScanner;

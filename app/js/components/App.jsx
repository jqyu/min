import React, { Component } from 'react';
import { Link } from 'react-router';

class App extends Component {
  render() {
    return (
      <div>
        <h1>hallo werld</h1>
        <Link to="p/bustle/c/1">
          hallo this is link
        </Link>
        <div style={{padding: '20px'}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;

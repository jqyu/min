import React, { Component } from 'react';
import { Link } from 'react-router';

class Example extends Component {

  getInitialState() {
    return {
      output: 'output goes here'
    };
  }

  submit(e) {
    var r = new XMLHttpRequest();
    r.open("POST", "/graphql", true);
    r.setRequestHeader("Content-type", "application/json");
    r.onreadystatechange = () => {
      if (r.readyState == 4 && r.status == 200) {
        this.setState({
          output: r.responseText
        });
      } else {
        console.log("Status:", r.status);
      }
    }
    r.send(JSON.stringify({
      request: this.textInput.value
    }));
    e.preventDefault();
    return false;
  }

  render() {
    return (
      <form onSubmit={this.submit.bind(this)}>
        <textarea ref={c => this.textInput = c} rows="30" cols="30"/>
        <input type="submit" value="Hallo GraphQL" />
        <pre>
          {this.state && this.state.output}
        </pre>
      </form>
    );
  }

}

export default Example;

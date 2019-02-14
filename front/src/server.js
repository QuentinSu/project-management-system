import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom';



class Servers extends Component {
    constructor(props){
      super(props);
      this.state={
          market: [],
          trigger: true,
          open: false,
          newAuthor: null,
          newDescription: null
      }
    }
    render() {
        return (
            <div>
                <p>Servers</p>
            </div>
        );
    }
}

export default Servers;

class Server extends Component {
    constructor(props){
      super(props);
      this.state={
          market: [],
          trigger: true,
          open: false,
          newAuthor: null,
          newDescription: null
      }
    }
    render() {
        return (
            <div>
                <p>Server</p>
            </div>
        );
    }
}
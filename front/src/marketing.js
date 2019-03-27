import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Link, NavLink } from 'react-router-dom';



class Marketing extends Component {
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
        if (localStorage.getItem('isAdvanced')==='false') {
            window.location.href = '/admin'
        }
        return (
            <div>
                <p>Marketing</p>
            </div>
        );
    }
}


export default Marketing;
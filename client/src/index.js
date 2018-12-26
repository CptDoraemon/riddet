//stupid IE
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ScrollToTop from './components/scrolltotop';
import { IoIosBonfire } from "react-icons/io";

import { Frontpage } from './components/frontpage';
import { Login } from './components/forms/login';
import { Signup } from './components/forms/signup';






class Index extends React.Component {
    render() {
        const themeColor = ['rgb(149, 125, 25)', 'rgb(225, 197, 81)', 'rgb(250, 245, 224)'];
        const themeLogo = function (size) {
            return (
                <IoIosBonfire size={size}/>
            )
        };
        const themeTitle = 'g/JohnCooperWorks';
        return (
            <Router>
                <ScrollToTop>
                    <Switch>
                        <Route path="/" exact render={(props) => <Frontpage {...props} themeColor={themeColor} themeLogo={themeLogo} themeTitle={themeTitle}/>} />
                        <Route path="/login" exact render={(props) => <Login {...props} /> } />
                        <Route path="/signup" exact render={(props) => <Signup {...props} /> } />
                    </Switch>
                </ScrollToTop>
            </Router>
        )
    }


}

ReactDOM.render(<Index />, document.getElementById('root'));




//stupid IE
import "@babel/polyfill";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import ScrollToTop from './components/scrolltotop';
import { IoIosBonfire, IoIosClose } from "react-icons/io";

import { Frontpage } from './components/frontpage';
import { Login } from './components/forms/login';
import { Signup } from './components/forms/signup';
import { Createpost } from './components/createpost/createpost';

class IFrameS extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isWorking: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
    }
    handleChange() {
        const url = document.getElementById("iframe-s").contentWindow.location.href;
        console.log(url);
        if (url.slice(url.length - 5, url.length) === 'close') {
            window.location.reload();
        } else if (url === 'about:blank') {

        } else {
            this.setState({isWorking: true});
            document.body.style.overflow = 'hidden';
        }
    }
    close() {
        this.setState({
            isWorking: false
        });
        document.body.style.overflow = 'auto';
    }
    render() {
        return(
            <div className={this.state.isWorking ? 'iframe-wrapper' : 'iframe-wrapper-hidden'}>
                <div className='iframe-close-icon pointer' onClick={this.close}>
                    <IoIosClose size='50px'/>
                </div>
                <iframe title='iframe-s' id='iframe-s' name='iframe-s' onLoad={this.handleChange}> </iframe>
            </div>
        )
    }
}

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            user: {
                username: null,
            }
        };
        this.verifyAuthentication = this.verifyAuthentication.bind(this);
    }
    verifyAuthentication() {
        fetch('/verifyAuthentication', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
            }
        ).then(res => res.json())
            .then(json => {
                if (json.code === '110') this.setState({ isLogin: true, user: {...this.state.user, username: json.username} });
                if (json.code === '111') this.setState({ isLogin: false });
            })
            .catch((err) => console.log(err))
    }
    render() {
        const themeColor = ['rgb(149, 125, 25)', 'rgb(225, 197, 81)', 'rgb(250, 245, 224)'];
        const themeLogo = function (size) {
            return (
                <IoIosBonfire size={size}/>
            )
        };
        const themeTitle = 'g/JohnCooperWorks';

        const authenticationTools = {
            isLogin: this.state.isLogin,
            user: this.state.user,
            verifyAuthentication: this.verifyAuthentication
        };
        const themeTools = {
            themeColor: themeColor,
            themeLogo: themeLogo,
            themeTitle: themeTitle
        };
        return (
            <Router>
                <ScrollToTop>
                    <Switch>
                        <Route path="/" exact render={(props) => <Frontpage {...props} {...authenticationTools} {...themeTools} />} />
                        <Route path="/login" exact render={(props) => <Login {...props} /> } />
                        <Route path="/signup" exact render={(props) => <Signup {...props} /> } />
                        <Route path="/createpost" exact render={(props) => <Createpost {...props} {...authenticationTools} {...themeTools}/> } />
                    </Switch>

                    <IFrameS />
                </ScrollToTop>
            </Router>
        )
    }


}

ReactDOM.render(<Index />, document.getElementById('root'));




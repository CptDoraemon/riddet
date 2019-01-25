//stupid IE
import "@babel/polyfill";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import ScrollToTop from './components/scrolltotop';
import { IoIosBonfire } from "react-icons/io";

import { Frontpage } from './components/frontpage';
import { Login } from './components/forms/login';
import { Signup } from './components/forms/signup';
import { Createpost, EditPost } from './components/createpost/createpost';
import { CommentTemplate } from "./components/comment/comment";
import { AccountSetting } from './components/accountSetting/accountSetting';
import { IFrameS } from "./components/iframes/iframe-s";
import { IFrameL } from "./components/iframes/iframe-l";


class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            iFrameLTitle: 'loading...',
            isLogin: false,
            user: {
                username: null,
                userId: null,
            },
        };
        this.verifyAuthentication = this.verifyAuthentication.bind(this);
        this.setIFrameLTitle = this.setIFrameLTitle.bind(this);
    }
    setIFrameLTitle(title){
        this.setState({iFrameLTitle: title})
    };
    verifyAuthentication() {
        fetch('/verifyAuthentication', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
            }
        ).then(res => res.json())
            .then(json => {
                if (json.code === '110') this.setState({ isLogin: true, user: {...this.state.user, username: json.username, userId: json.userId} });
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
                        <Route path="/" exact render={(props) => <Frontpage {...props} {...authenticationTools} {...themeTools} setIFrameLTitle={this.setIFrameLTitle}/>} />
                        <Route path="/login" exact render={(props) => <Login {...props} /> } />
                        <Route path="/signup" exact render={(props) => <Signup {...props} /> } />
                        <Route path="/createpost" exact render={(props) => <Createpost {...props} {...authenticationTools} {...themeTools}/> } />
                        <Route path="/editPost/:postOrComment/:id" exact render={(props) => <EditPost {...props} {...authenticationTools} {...themeTools}/> } />
                        <Route path="/comment/:postId" exact render={(props) => <CommentTemplate {...props} {...authenticationTools} {...themeTools}/> } />
                        <Route path="/accountSetting/:userId" exact render={(props) => <AccountSetting {...props} {...authenticationTools} {...themeTools}/> } />
                    </Switch>

                    <IFrameS />
                    <IFrameL title={this.state.iFrameLTitle}/>
                </ScrollToTop>
            </Router>
        )
    }


}

ReactDOM.render(<Index />, document.getElementById('root'));




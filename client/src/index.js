//stupid IE
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import ScrollToTop from './components/scrolltotop';
import { IoIosBonfire, IoIosClose } from "react-icons/io";

import { Frontpage } from './components/frontpage';
import { Login } from './components/forms/login';
import { Signup } from './components/forms/signup';
import { Welcome } from './components/forms/welcome';
import { Createpost } from './components/createpost/createpost';

function IFrame(props) {
    return(
        <div className='iframe-wrapper'>
            <div className='iframe-close-icon' onClick={() => props.openInSmallIFrame('')}>
                <Link to=''>
                    <IoIosClose size='50px'/>
                </Link>
            </div>
            <iframe title='iframe in frontpage' id='iframe' src={props.link} onLoad={props.handleIFrameChange}> </iframe>
        </div>
    )
}

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            smallIFrame: '',
            isLogin: false,
            user: {
                username: null,
            }
        };
        this.openInSmallIFrame = this.openInSmallIFrame.bind(this);
        this.handleIFrameChange = this.handleIFrameChange.bind(this);
        this.closeIFrame = this.closeIFrame.bind(this);
        this.verifyAuthentication = this.verifyAuthentication.bind(this);
        this.createPost = this.createPost.bind(this);
    }
    openInSmallIFrame(link) {
        this.setState({
            smallIFrame: link
        });
        this.toggleBodyOverflow(link);
    }
    handleIFrameChange() {
        const url = document.getElementById('iframe').contentWindow.location.href;
        if ((/welcome$/i).test(url)) {
            setTimeout(this.closeIFrame, 3000)
        }
    }
    closeIFrame() {
        this.setState({smallIFrame: ''});
        this.toggleBodyOverflow('');
        this.verifyAuthentication();
    }
    toggleBodyOverflow(link) {
        link === '' ? document.body.style.overflow = 'auto' : document.body.style.overflow = 'hidden';
    }
    verifyAuthentication() {
        fetch('/verifyAuthentication', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }}
        ).then(res => res.json())
            .then(json => {
                if (json.code === '110') this.setState({ isLogin: true, user: {...this.state.user, username: json.username} });
                if (json.code === '111') this.setState({ isLogin: false });
            })
            .catch((err) => console.log(err))
    }
    createPost() {
        this.state.isLogin ? window.location.replace('/createpost') : this.openInSmallIFrame('/login')
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
            smallIFrame: this.state.smallIFrame,
            isLogin: this.state.isLogin,
            user: this.state.user,
            openInSmallIFrame: this.openInSmallIFrame,
            handleIFrameChange: this.handleIFrameChange,
            closeIFrame: this.closeIFrame,
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
                        <Route path="/" exact render={(props) => <Frontpage {...props} {...authenticationTools} {...themeTools} createPost={this.createPost}/>} />
                        <Route path="/login" exact render={(props) => <Login {...props} /> } />
                        <Route path="/signup" exact render={(props) => <Signup {...props} /> } />
                        <Route path="/welcome" exact render={(props) => <Welcome {...props} /> } />
                        <Route path="/createpost" exact render={(props) => <Createpost {...props} {...authenticationTools} {...themeTools}/> } />
                    </Switch>

                    { this.state.smallIFrame === '' ? null : <IFrame link={this.state.smallIFrame} openInSmallIFrame={this.openInSmallIFrame} handleIFrameChange={this.handleIFrameChange}/> }
                </ScrollToTop>
            </Router>
        )
    }


}

ReactDOM.render(<Index />, document.getElementById('root'));




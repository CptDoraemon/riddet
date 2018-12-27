import React from 'react';

import { Link } from 'react-router-dom';
import './frontpage.css';
import { IoIosClose } from "react-icons/io";

import { Header } from './header';
import { Card } from './card';
import { Info } from './info';

function IFrame(props) {
    return(
        <div className='iframe-wrapper'>
            <div className='iframe-close-icon' onClick={() => props.openInSmallIFrame('')}>
                <Link to='./'>
                    <IoIosClose size='50px'/>
                </Link>
            </div>
            <iframe title='iframe in frontpage' id='iframe' src={props.link} onLoad={props.handleIFrameChange}> </iframe>
        </div>
    )
}
class Frontpage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            view: 'card',
            sort: 'hot',
            smallIFrame: '',
            isLogin: false
        };
        this.toggleView = this.toggleView.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.openInSmallIFrame = this.openInSmallIFrame.bind(this);
        this.handleIFrameChange = this.handleIFrameChange.bind(this);
        this.closeIFrame = this.closeIFrame.bind(this);
        this.verifyAuthentication = this.verifyAuthentication.bind(this);
    }
    toggleView (e) {
        this.setState({
            view: e
        })
    }
    toggleSort(item) {
        this.setState({
            sort: item
        })
    }
    toggleBodyOverflow(link) {
        link === '' ? document.body.style.overflow = 'auto' : document.body.style.overflow = 'hidden';
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
    verifyAuthentication() {
        fetch('/verifyAuthentication', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }}
        ).then(res => res.json())
            .then(json => {
                if (json === '110') this.setState({isLogin: true});
                if (json === '111') this.setState({isLogin: false});
                console.log(json);
            })
            .catch((err) => console.log(err))
    }
    componentDidMount() {
        this.verifyAuthentication();
    }
    render() {
        return (
            <div className='frontpage-wrapper'>
                <Header themeColor={this.props.themeColor} themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle} view={this.state.view} toggleView={this.toggleView} sort={this.state.sort} toggleSort={this.toggleSort}
                openInSmallIFrame={this.openInSmallIFrame} isLogin={this.state.isLogin}/>
                <div className='main-content-wrapper'>
                    <div className='main-content-wrapper-box'>
                        <div className='posts-wrapper'>
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                        </div>
                        <div className='infos-wrapper'>
                            <Info themeColor={this.props.themeColor} themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle}/>
                        </div>
                    </div>
                </div>
                { this.state.smallIFrame === '' ? null : <IFrame link={this.state.smallIFrame} openInSmallIFrame={this.openInSmallIFrame} handleIFrameChange={this.handleIFrameChange}/> }
            </div>
        )
    }
}

export { Frontpage };
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
            <iframe title='iframe in frontpage' src={props.link}> </iframe>
        </div>
    )
}
class Frontpage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            view: 'card',
            sort: 'hot',
            smallIFrame: ''
        };
        this.toggleView = this.toggleView.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.openInSmallIFrame = this.openInSmallIFrame.bind(this);
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
    openInSmallIFrame(link) {
        this.setState({
            smallIFrame: link
        })
    }
    render() {
        return (
            <div className='frontpage-wrapper'>
                <Header themeColor={this.props.themeColor} themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle} view={this.state.view} toggleView={this.toggleView} sort={this.state.sort} toggleSort={this.toggleSort}
                openInSmallIFrame={this.openInSmallIFrame}/>
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
                { this.state.smallIFrame === '' ? null : <IFrame link={this.state.smallIFrame} openInSmallIFrame={this.openInSmallIFrame}/> }
            </div>
        )
    }
}

export { Frontpage };
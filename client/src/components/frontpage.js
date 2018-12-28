import React from 'react';
import './frontpage.css';

import { HeaderMax } from './header';
import { Card } from './card';
import { Info } from './info';

class Frontpage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            view: 'card',
            sort: 'hot',
        };
        this.toggleView = this.toggleView.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
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
    componentDidMount() {
        this.props.verifyAuthentication();
    }
    render() {
        return (
            <div className='frontpage-wrapper'>
                <HeaderMax themeColor={this.props.themeColor} themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle} view={this.state.view} toggleView={this.toggleView} sort={this.state.sort} toggleSort={this.toggleSort}
                openInSmallIFrame={this.props.openInSmallIFrame} isLogin={this.props.isLogin} user={this.props.user}/>
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
                            <Info {...this.props} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export { Frontpage };
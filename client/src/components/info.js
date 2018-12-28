import React from 'react';

import { Link } from 'react-router-dom';
import './info.css';


class Info extends React.Component {
    constructor(props) {
        super(props);
        this.aboutRef = React.createRef();
        this.state = {
            aboutRefPosition: null,
            aboutFixed: false
        };
        this.toggleAboutFixed = this.toggleAboutFixed.bind(this);
    }
    toggleAboutFixed() {
        window.scrollY + 50 + 10> this.state.aboutRefPosition ? this.setState({aboutFixed: true}) : this.setState({aboutFixed: false})
    }
    componentDidMount() {
        this.setState({
            aboutRefPosition: this.aboutRef.current.offsetTop
        });
        window.addEventListener('scroll', this.toggleAboutFixed);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.toggleAboutFixed);
    }
    render() {
        return (
            <div>
                <div className='info-wrapper'>
                    <div className='info-header' style={{backgroundColor:this.props.themeColor[1]}}>
                        <h5>guild info</h5>
                    </div>
                    <div className='info-body'>
                        <div className='info-banner'>
                            {this.props.themeLogo('30px')}
                            <span> {this.props.themeTitle} </span>
                        </div>
                        <div className='info-stats flex-row-even'>
                            <div className='info-stat'>
                                <p>0.0k</p>
                                <h5>Guild Members</h5>
                            </div>
                            <div className='info-stat'>
                                <p>000</p>
                                <h5>Online</h5>
                            </div>
                        </div>
                        <div className='info-message'>
                            <p>First Guild in Riddet! Guild Messages will be showing here.</p>
                        </div>
                        <button className='info-button' style={{backgroundColor: this.props.themeColor[0]}}>JOIN GUILD</button>
                        <Link to={this.props.isLogin ? '/createpost' : '/login'} target={this.props.isLogin ? null : 'iframe-s'}>
                            <button className='info-button' style={{backgroundColor: this.props.themeColor[0]}}>create post</button>
                        </Link>
                    </div>
                </div>
                <div className='info-wrapper'>
                    <div className='info-header' style={{backgroundColor:this.props.themeColor[1]}}>
                        <h5>guild officers</h5>
                    </div>
                    <div className='info-body flex-column-center'>
                        <div className='info-officer'>
                            <span className='info-officer-name' style={{color: this.props.themeColor[0]}}>u/placehoder</span>
                            <span className='info-officer-signature'>signature placeholder</span>
                        </div>
                        <div className='info-officer'>
                            <span className='info-officer-name' style={{color: this.props.themeColor[0]}}>u/placehoder</span>
                            <span className='info-officer-signature'>signature placeholder</span>
                        </div>
                        <div className='info-officer'>
                            <span className='info-officer-name' style={{color: this.props.themeColor[0]}}>u/placehoder</span>
                            <span className='info-officer-signature'>signature placeholder</span>
                        </div>
                    </div>
                </div>
                <div className={this.state.aboutFixed ? 'info-wrapper info-about-fixed' : 'info-wrapper'} ref={this.aboutRef}>
                    <div className='info-about'>
                        <p>This website is a web development practice project for my personal use.</p>
                        <a href='https://www.xiaoxihome.com' target='_blank' rel='noopener noreferrer' style={{color: this.props.themeColor[0]}}>Author</a>
                    </div>
                </div>
            </div>
        )
    }
}

export { Info };
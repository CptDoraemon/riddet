import React from 'react';

import { Link } from 'react-router-dom';
import './header.css';

import { IoIosAnalytics, IoIosSearch, IoIosTrendingUp, IoIosStats, IoIosCube, IoMdPerson, IoMdArrowDropdown } from "react-icons/io";
import { MdViewStream, MdMenu, MdReorder } from "react-icons/md";
import { MdWhatshot, MdNewReleases } from "react-icons/md";


function HeaderFixedLogo (props) {
    return (
        <div className='header-fixed-logo flex-row-even'>
            <IoIosAnalytics size='30px'/>
            <span>riddet</span>
        </div>
    )
}

function HeaderFixedSubs (props) {
    return (
        <button className='header-fixed-subs flex-row-even pointer'>
            <div className='header-fixed-subs-icon'>
                { props.themeLogo('30px') }
            </div>
            <span>{ props.themeTitle }</span>
        </button>
    )
}

class HeaderFixedSearch extends React.Component{
    constructor (props) {
        super (props);
        this.state = {
           value: ''
        };
        this.defaultValue = '... search ' + this.props.themeTitle;
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }
    handleChange (e) {
        this.setState({
            value: e.target.value
        })
    }
    handleFocus (e) {
        this.setState({
            value: this.state.value === this.defaultValue ? '' : e.target.value
        })
    }
    handleBlur (e) {
        this.setState({
            value: (/^\s*$/).test(this.state.value) ? this.defaultValue : e.target.value
        })
    }
    componentDidMount() {
        this.setState({
            value: this.defaultValue
        })
    }
    render () {
        return (
            <div className='header-fixed-search flex-row-even'>
                <IoIosSearch size='20px'/>
                <input value={this.state.value} onChange={this.handleChange} onBlur={this.handleBlur} onFocus={this.handleFocus}/>
            </div>
        )
    }
}

function HeaderFixedTools (props) {
    return (
        <div className='header-fixed-tools flex-row-even'>
            <IoIosTrendingUp size='20px' className='pointer'/>
            <IoIosStats size='20px' className='pointer'/>
            <IoIosCube size='20px' className='pointer'/>
        </div>
    )
}

function HeaderFixedSignup (props) {
    return (
        <div className='header-fixed-signup-login flex-row-even'>
            <button className='header-fixed-signup pointer' onClick={() => props.openInSmallIFrame('./login')}>LOG IN</button>
            <button className='header-fixed-login pointer'>SIGN UP</button>
        </div>
    )
}

class HeaderFixedUser extends React.Component{
    constructor (props) {
        super (props);
        this.state = {
            dropdown: false
        }
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.closeDropdown = this.closeDropdown.bind(this);
    }
    toggleDropdown (e) {
        e.stopPropagation();
        this.setState({
            dropdown: !this.state.dropdown
        })
    }
    closeDropdown () {
        this.setState({
            dropdown: false
        })
    }
    componentDidMount () {
        window.addEventListener('click', this.closeDropdown);
    }
    componentWillUnmount () {
        window.removeEventListener('click', this.closeDropdown);
    }
    render() {
        return (
            <div className='header-fixed-user'>
                <button className='header-fixed-user-button flex-row-even pointer' onClick={this.toggleDropdown}>
                    <IoMdPerson size='25px'/>
                    <IoMdArrowDropdown size='25px'/>
                </button>
                <div
                    className={this.state.dropdown ? 'header-fixed-user-dropdown-active' : 'header-fixed-user-dropdown-inactive'}>
                    <div className='header-fixed-user-dropdown-active-item' onClick={() => this.props.openInSmallIFrame('./login')}>
                        <span>Log in / Sign up</span>
                    </div>
                </div>
            </div>
        )
    }
}


class HeaderFixed extends React.Component {
    render() {
        return (
            <div className='header-fixed flex-row-even'>
                    <HeaderFixedLogo />
                    <HeaderFixedSubs themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle}/>
                    <HeaderFixedSearch themeTitle={this.props.themeTitle}/>
                    <HeaderFixedTools />
                    <HeaderFixedSignup openInSmallIFrame={this.props.openInSmallIFrame}/>
                    <HeaderFixedUser openInSmallIFrame={this.props.openInSmallIFrame}/>
            </div>
        );
    }
}

function HeaderFixedPlaceholder(props) {
    return (
        <div className='header-fixed-placeholder'>

        </div>
    )
}

function Banner1 (props) {
    return (
        <div className='banner1 flex-row-center' style={{backgroundColor: props.themeColor[1]}}>
            <div className='banner1-container'>
                <div className='banner1-logo'>
                    { props.themeLogo('30px') }
                </div>
                <div className='banner1-title'>
                    <span> { props.themeTitle } </span>
                </div>
            </div>
        </div>
    )
}

function Banner2 (props) {
    return (
        <div className='banner2 flex-row-center' style={{backgroundColor: props.themeColor[2]}}>
            <div className='banner2-container'>
                <div className='banner2-item' style={{color: props.themeColor[0], borderBottomColor: props.themeColor[0]}} >
                    <span>Posts</span>
                </div>
            </div>
        </div>
    )
}

class Banner3 extends React.Component{
    constructor (props) {
        super (props);
        this.state = {
            sortDropdown: false
        };
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.closeDropdown = this.closeDropdown.bind(this);
        this.hot = () => {
            return (
                <div className='banner3-sort-item flex-row-even' style={this.props.sort === 'hot' ? {color: this.props.themeColor[0]} : null}>
                    <MdWhatshot />
                    <span>HOT</span>
                </div>
            )
        };
        this.new = () => {
            return (
                <div className='banner3-sort-item flex-row-even' style={this.props.sort === 'new' ? {color: this.props.themeColor[0]} : null}>
                    <MdNewReleases />
                    <span>New</span>
                </div>
            )
        };
        this.top = () => {
            return (
                <div className='banner3-sort-item flex-row-even' style={this.props.sort === 'top' ? {color: this.props.themeColor[0]} : null}>
                    <IoIosStats />
                    <span>TOP</span>
                </div>
            )
        }
    }
    toggleDropdown(e) {
        e.stopPropagation();
        this.setState({
            sortDropdown: !this.state.sortDropdown
        })
    }
    closeDropdown () {
        this.setState({
            sortDropdown: false
        })
    }
    handleSortEnter(e) {
        e.target.style = 'background-color: ' + this.props.themeColor[2] + ';color: black;';
    }
    handleSortLeave(e) {
        e.target.style = null;
    }
    componentDidMount() {
        window.addEventListener('click', this.closeDropdown);
    }
    componentWillUnmount() {
        window.removeEventListener('click', this.closeDropdown);
    }
    render() {
        let sort = this.props.sort === 'hot' ?
            this.hot() : this.props.sort === 'new' ? this.new() : this.top();
        const handlers = {
            onMouseEnter: (e) => this.handleSortEnter(e),
            onMouseLeave: (e) => this.handleSortLeave(e),
        }
        return (
            <div className='banner3 flex-row-center'>
                <div className='banner3-container'>
                    <div className='banner3-view flex-row-even'>
                        <span>VIEW</span>
                        <div className='flex-row-even' style={{color: this.props.themeColor[0]}}>
                            <div className='banner3-view-item pointer' onClick={() => this.props.toggleView('card')}>
                                <MdViewStream size='25px' style={{opacity: this.props.view === 'card' ? 1 : 0.3}}/>
                                <span className='banner3-view-item-toolkit'>Card</span>
                            </div>
                            <div className='banner3-view-item pointer' onClick={() => this.props.toggleView('classic')}>
                                <MdMenu size='25px' style={{opacity: this.props.view === 'classic' ? 1 : 0.3}}/>
                                <span className='banner3-view-item-toolkit'>Classic</span>
                            </div>
                            <div className='banner3-view-item pointer' onClick={() => this.props.toggleView('compact')}>
                                <MdReorder size='25px' style={{opacity: this.props.view === 'compact' ? 1 : 0.3}} />
                                <span className='banner3-view-item-toolkit'>Compact</span>
                            </div>
                        </div>
                    </div>

                    <div className='banner3-sort flex-row-even pointer' onClick={this.toggleDropdown}>
                        <span>SORT</span>
                        <div>
                            { sort }
                        </div>
                        <IoMdArrowDropdown size='20px'/>
                        <div className={this.state.sortDropdown ? 'banner3-sort-dropdown-active' : 'banner3-sort-dropdown-inactive'}>
                            <div className='banner3-sort-dropdown-item pointer' onClick={() => this.props.toggleSort('hot')} {...handlers}>
                                { this.hot() }
                            </div>
                            <div className='banner3-sort-dropdown-item pointer' onClick={() => this.props.toggleSort('new')} {...handlers}>
                                { this.new() }
                            </div>
                            <div className='banner3-sort-dropdown-item pointer' onClick={() => this.props.toggleSort('top')} {...handlers}>
                                { this.top() }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


class Header extends React.Component {
    render() {
        return (
            <div className='header-wrapper'>
                <HeaderFixed themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle} openInSmallIFrame={this.props.openInSmallIFrame}/>
                <HeaderFixedPlaceholder />
                <Banner1 themeColor={this.props.themeColor} themeLogo={this.props.themeLogo} themeTitle={this.props.themeTitle}/>
                <Banner2 themeColor={this.props.themeColor}/>
                <Banner3 themeColor={this.props.themeColor} view={this.props.view} toggleView={this.props.toggleView} sort={this.props.sort} toggleSort={this.props.toggleSort}/>
            </div>
        )
    }
}

export { Header };
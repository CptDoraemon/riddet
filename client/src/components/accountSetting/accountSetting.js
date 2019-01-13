import React from "react";
import './accountSetting.css';
import { HeaderFixedLogo } from "../header";
import { MdChevronRight } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";

const toNormalDate = require('../tools/dateCalculation').toNormalDate;

class AccountSettingHeadbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAtRef: 0,
        };
        this.clickHandler = this.clickHandler.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    clickHandler(e) {
        const index = e.target.id.match(/\d+/g);
        window.scrollTo({
            top: document.getElementById('accountSettingRef' + index).offsetTop - 79,
            behavior: 'smooth'
        });
    }
    handleScroll() {
        const scrolled = window.scrollY + 80;
        let refs = [];
        for (let i=0; i<8; i++) {
            const el = document.getElementById('accountSettingRef' + i);
            refs.push(el.offsetTop);
        }
        refs[0] = 0;
        let currentAtRef = -1;
        refs.map((i) => scrolled > i ? currentAtRef++ : null);
        if (currentAtRef !== this.state.currentAtRef) {
            this.setState({currentAtRef: currentAtRef});
        }
    }
    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    render() {
        const listNameArray = ['Avatar', 'Password', 'My Posts', 'My Comments', 'Saved Posts', 'Saved Comments', 'Hidden Posts', 'Hidden Comments'];
        const activeCSS = 'account-setting-headbar-item account-setting-headbar-item-active';
        const inactiveCSS = 'account-setting-headbar-item';

        return (
            <div className='account-setting-headbar-wrapper'>
                <div className='account-setting-headbar-logo'>
                    <HeaderFixedLogo text={false}/>
                </div>

                { listNameArray.map((i, index) => {
                    return (
                        <div className={this.state.currentAtRef === index ? activeCSS : inactiveCSS} id={'accountSettingNavbar' + index} onClick={this.clickHandler}>
                            {i}
                        </div>
                        )
                    })
                }
            </div>
        )
    }
}
function NoEntry(props) {
    const wrapperClassName = props.isActive ? 'post-entry-wrapper-noentry-active' : 'post-entry-wrapper-noentry-inactive';
    return (
        <div className={wrapperClassName}>
            No Entry
        </div>
    )
}
class PostEntry extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: true
        };
        this.clickHandler = this.clickHandler.bind(this);
        this.handleUnhide = this.handleUnhide.bind(this);
        this.handleUnsave = this.handleUnsave.bind(this);
        this.isSendingRequest = false;
    }
    clickHandler() {
        window.open('/comment/' + this.props.data._id)
    }
    handleUnsave() {
        if (this.isSendingRequest) return;
        this.isSendingRequest = true;
        const postId = this.props.data._id;
        const data = {
            id: postId,
            isCancel: true
        };
        fetch('/savePost', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.isSendingRequest= false;
                if (json === '152') {
                    this.setState({isDisplay: false})
                }
            })
            .catch(err => {
                this.isSendingRequest= false;
            })
    }
    handleUnhide() {
        if (this.isSendingRequest) return;
        this.isSendingRequest = true;
        const postId = this.props.data._id;
        const data = {
            id: postId,
            isCancel: true
        };
        fetch('/hidePost', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.isSendingRequest= false;
                if (json === '154') {
                    this.setState({isDisplay: false})
                }
            })
            .catch(err => {
                this.isSendingRequest= false;
            })
    }
    render() {
        const wrapperClassName = this.props.isActive ? 'post-entry-wrapper-active' : 'post-entry-wrapper-inactive';
        if (this.state.isDisplay) {
            return (
                <div className={wrapperClassName} >
                    <div className='post-entry' onClick={this.clickHandler}>
                        <div className='post-entry-info'>Posted by {this.props.data.username} {toNormalDate(this.props.data.date)}</div>
                        <div className='post-entry-title'>{this.props.data.title}</div>
                        <div className='post-entry-content'>{this.props.data.post}</div>
                    </div>
                    {
                        this.props.unsave ?
                            <div className='post-delete-unsave' onClick={this.handleUnsave}>
                                <FiTrash2 size='25px'/>
                            </div> :
                            null
                    }
                    {
                        this.props.unhide ?
                            <div className='post-delete-unhide' onClick={this.handleUnhide}>
                                <FiTrash2 size='25px'/>
                            </div> :
                            null
                    }
                </div>
            )
        } else {
            return null
        }
    }
}
class CommentEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: true
        };
        this.clickHandler = this.clickHandler.bind(this);
        this.handleUnsave = this.handleUnsave.bind(this);
        this.handleUnhide = this.handleUnhide.bind(this);
        this.isSendingRequest = false;
    }
    clickHandler() {
        window.open('/comment/' + this.props.data.parentPost)
    }
    handleUnsave() {
        if (this.isSendingRequest) return;
        this.isSendingRequest = true;
        const commentId = this.props.data._id;
        const data = {
            id: commentId,
            isCancel: true
        };
        fetch('/saveComment', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.isSendingRequest= false;
                if (json === '152') {
                    this.setState({isDisplay: false})
                }
            })
            .catch(err => {
                this.isSendingRequest= false;
            })
    }
    handleUnhide() {
        if (this.isSendingRequest) return;
        this.isSendingRequest = true;
        const commentId = this.props.data._id;
        const data = {
            id: commentId,
            isCancel: true
        };
        fetch('/hideComment', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.isSendingRequest= false;
                if (json === '154') {
                    this.setState({isDisplay: false})
                }
            })
            .catch(err => {
                this.isSendingRequest= false;
            })
    }
    render() {
        const wrapperClassName = this.props.isActive ? 'post-entry-wrapper-active' : 'post-entry-wrapper-inactive';
        if (this.state.isDisplay) {
            return (
                <div className={wrapperClassName} >
                    <div className='post-entry' onClick={this.clickHandler}>
                        <div className='post-entry-info'>Posted by {this.props.data.username} {toNormalDate(this.props.data.date)}</div>
                        <div className='post-entry-content'>{this.props.data.comment}</div>
                    </div>
                    {
                        this.props.unsave ?
                            <div className='post-delete-unsave' onClick={this.handleUnsave}>
                                <FiTrash2 size='25px'/>
                            </div> :
                            null
                    }
                    {
                        this.props.unhide ?
                            <div className='post-delete-unhide' onClick={this.handleUnhide}>
                                <FiTrash2 size='25px'/>
                            </div> :
                            null
                    }
                </div>
            )
        } else {
            return null
        }
    }
}
class Section extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDropDown: true
        };
        this.handleDropdown = this.handleDropdown.bind(this);
    }
    handleDropdown() {
        this.setState({isDropDown: !this.state.isDropDown});
    }
    render() {
        let entry;
        if (!this.props.data || this.props.data.length === 0) {
            entry = <NoEntry isActive={this.state.isDropDown}/>
        } else if (this.props.unhide) {
            if (this.props.type === 'post'){
                entry = this.props.data.map((i) => <PostEntry key={i._id} isActive={this.state.isDropDown} data={i} unhide={true}/>)
            } else if (this.props.type === 'comment') {
                entry = this.props.data.map((i) => <CommentEntry key={i._id} isActive={this.state.isDropDown} data={i} unhide={true}/>)
            }
        } else if (this.props.unsave) {
            if (this.props.type === 'post'){
                entry = this.props.data.map((i) => <PostEntry key={i._id} isActive={this.state.isDropDown} data={i} unsave={true}/>)
            } else if (this.props.type === 'comment') {
                entry = this.props.data.map((i) => <CommentEntry key={i._id} isActive={this.state.isDropDown} data={i} unsave={true}/>)
            }
        } else if (this.props.type === 'post'){
            entry = this.props.data.map((i) => <PostEntry key={i._id} isActive={this.state.isDropDown} data={i}/>)
        } else if (this.props.type === 'comment') {
            entry = this.props.data.map((i) => <CommentEntry key={i._id} isActive={this.state.isDropDown} data={i}/>)
        }

        return (
            <div className='account-setting-section-wrapper'>
                <div className={this.state.isDropDown ? 'account-setting-section-title-active': 'account-setting-section-title-inactive'}
                     onClick={this.handleDropdown}>
                    <span> {this.props.sectionName} </span>
                    <div className={this.state.isDropDown ? 'account-setting-section-title-icon-active' : 'account-setting-section-title-icon-inactive'} >
                        <MdChevronRight size='20px' />
                    </div>
                </div>
                { entry }
            </div>
        )
    }
}
class AccountSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
        };
        this.userId = this.props.match.params.userId;
    }
    componentDidMount() {
        fetch('/accountSettingVerification', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({userId: this.userId}),
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111'){
                    window.location.href = '/';
                } else if (json === '106') {

                } else {
                    // success
                    this.setState({data: json})
                }
            }).catch(err => console.log(err));
    }
    render() {
        return (
            <React.Fragment>
                <div className='account-setting-headbar-backbone'>
                    <AccountSettingHeadbar themeLogo={this.props.themeLogo}/>
                </div>
                <div className='account-setting-wrapper'>
                    <div className='account-setting-content-wrapper'>
                        <div id='accountSettingRef0'/>
                        {/*<AvatarSetting />*/}
                        <div id='accountSettingRef1'/>
                        {/*<ChangePassword />*/}
                        <div id='accountSettingRef2'/>
                        <Section sectionName='my posts' type='post' data={this.state.data.userPosts}/>
                        <div id='accountSettingRef3'/>
                        <Section sectionName='my comments' type='comment' data={this.state.data.userComments}/>
                        <div id='accountSettingRef4'/>
                        <Section sectionName='saved posts' type='post' data={this.state.data.savedPosts} unsave={true}/>
                        <div id='accountSettingRef5'/>
                        <Section sectionName='saved comments' type='comment' data={this.state.data.savedComments} unsave={true}/>
                        <div id='accountSettingRef6'/>
                        <Section sectionName='hidden posts' type='post' data={this.state.data.hiddenPosts} unhide={true}/>
                        <div id='accountSettingRef7'/>
                        <Section sectionName='hidden comments' type='comment' data={this.state.data.hiddenComments} unhide={true}/>
                    </div>

                </div>
            </React.Fragment>
        )
    }
}

export { AccountSetting };
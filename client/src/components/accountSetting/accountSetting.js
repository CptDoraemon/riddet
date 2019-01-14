import React from "react";
import './accountSetting.css';
import { HeaderFixedLogo } from "../header";
import { MdChevronRight } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";

const myScrollTo = require('../tools/myScrollTo');

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
        let y = document.getElementById('accountSettingRef' + index).offsetTop - 79;
        //window.scrollTo(0, y);
        myScrollTo(y);
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
        const listNameArray = ['Profile', 'Password', 'My Posts', 'My Comments', 'Saved Posts', 'Saved Comments', 'Hidden Posts', 'Hidden Comments'];
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
class AccountSettingInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLabelMinimized: false,
            keepLabelMinimized: false,
            value: '',
        };
        this.handleHover = this.handleHover.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleHover() {
        if (!this.state.keepLabelMinimized) {
            this.setState({isLabelMinimized: !this.state.isLabelMinimized})
        }
    }
    handleFocus() {
        this.setState({keepLabelMinimized: true});
        if (!this.state.isLabelMinimized) {
            this.setState({isLabelMinimized: true})
        }
    }
    handleBlur() {
        if (this.state.value === '') {
            this.setState({isLabelMinimized: false, keepLabelMinimized: false})
        }
    }
    handleChange(e) {
        const value = e.target.value;
        let isValid = value !== this.oldValue && value.length <= 20;
        if (!this.props.allowEmpty) {
            isValid = isValid && value !== ''
        }
        isValid ? this.props.canSubmit(true) : this.props.canSubmit(false);
        this.setState({value: value})
    }
    componentDidMount() {
        console.log(this.props.oldValue);
        if (this.props.oldValue !== '') {
            this.props.canSubmit(false);
            this.setState({value: this.props.oldValue, isLabelMinimized: true, keepLabelMinimized: true});
        }
    }
    render() {
        const labelCSS = this.state.isLabelMinimized ? 'account-setting-input-label-minimized' : 'account-setting-input-label';
        return (
            <div className='account-setting-input-wrapper' onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}>
                        <span className={labelCSS} >
                            { this.props.label }
                        </span>
                <input onFocus={this.handleFocus} onBlur={this.handleBlur} value={this.state.value} onChange={this.handleChange} id={this.props.inputId} type={this.props.inputType}/>
            </div>
        )
    }
}
class ProfileSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            canSubmit: false,
            isSubmitting: false,
            success: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.canSubmit = this.canSubmit.bind(this);
    }
    canSubmit(status) {
        if (this.state.canSubmit !== status)
        this.setState({canSubmit: status})
    }
    handleSubmit() {
        if (this.buttonDisabled) return;
        this.setState({isSubmitting: true});

        const signature = document.getElementById('accountSettingSignature').value;
        fetch('/updateSignature', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({signature: signature}),
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    window.location.href = '/'
                } else if (json === '104') {
                    this.setState({isSubmitting: false, success: true});
                } else {
                    this.setState({isSubmitting: false});
                }
            }).catch((err) => {
                console.log(err);
                this.setState({isSubmitting: false});
        })
    }
    render() {
        const buttonClassName = this.state.canSubmit && !this.state.isSubmitting ? 'account-setting-submit-button' : 'account-setting-submit-button account-setting-submit-button-disabled';
        return (
            <div className='account-setting-section-wrapper'>
                <div className='account-setting-section-title-active' >
                    <span> My Profile </span>
                </div>

                {/*wait data*/}
                { this.props.oldSignature || this.props.oldSignature === '' ?
                    <AccountSettingInput label='Signature (limit 20 characters)' inputId='accountSettingSignature' inputType='text' canSubmit={this.canSubmit} oldValue={this.props.oldSignature} allowEmpty={true}/> :
                    null
                }

                { this.props.oldSignature || this.props.oldSignature === '' ?
                    <button className={buttonClassName} onClick={this.handleSubmit} disabled={!this.state.canSubmit || this.state.isSubmitting}> { this.state.success ? 'Success!' : 'Submit' } </button> :
                    null
                }

            </div>
        )
    }
}
class ChangePassword extends React.Component {
    render() {
        return (
            <div className='account-setting-section-wrapper'>
                <div className='account-setting-section-title-active'>
                    <span> Change Password </span>
                </div>
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
                        <div className='account-setting-username'>
                            <span>{this.state.data.username}</span>
                        </div>
                        <div id='accountSettingRef0'/>
                        <ProfileSetting oldSignature={this.state.data.signature}/>
                        <div id='accountSettingRef1'/>
                        <ChangePassword />
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
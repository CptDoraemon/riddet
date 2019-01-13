import React from "react";
import './accountSetting.css';
import { HeaderFixedLogo } from "../header";
import { MdChevronRight } from "react-icons/md";

const toNormalDate = require('../tools/dateCalculation').toNormalDate;

class AccountSettingHeadbar extends React.Component {
    render() {
        return (
            <div className='account-setting-headbar-wrapper'>
                <div className='account-setting-headbar-logo'>
                    <HeaderFixedLogo text={false}/>
                </div>
                <div className='account-setting-headbar-item'>
                    Avatar
                </div>
                <div className='account-setting-headbar-item account-setting-headbar-item-active'>
                    Password
                </div>
                <div className='account-setting-headbar-item'>
                    My Posts
                </div>
                <div className='account-setting-headbar-item'>
                    My Comments
                </div>
                <div className='account-setting-headbar-item'>
                    Saved Posts
                </div>
                <div className='account-setting-headbar-item'>
                    Saved Comments
                </div>
                <div className='account-setting-headbar-item'>
                    Hidden Posts
                </div>
                <div className='account-setting-headbar-item'>
                    Hidden Comments
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
function PostEntry (props) {
    const wrapperClassName = props.isActive ? 'post-entry-wrapper-active' : 'post-entry-wrapper-inactive';
    return (
        <div className={wrapperClassName}>
            <div className='post-entry-info'>Posted by {props.data.username} {toNormalDate(props.data.date)}</div>
            <div className='post-entry-title'>{props.data.title}</div>
            <div className='post-entry-content'>{props.data.post}</div>
        </div>
        )
}
function CommentEntry (props) {
    const wrapperClassName = props.isActive ? 'post-entry-wrapper-active' : 'post-entry-wrapper-inactive';
    return (
        <div className={wrapperClassName}>
            <div className='post-entry-info'>Posted by {props.data.username} {toNormalDate(props.data.date)}</div>
            <div className='post-entry-content'>{props.data.comment}</div>
        </div>
    )
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
        return (
            <div className='account-setting-section-wrapper'>
                <div className={this.state.isDropDown ? 'account-setting-section-title-active': 'account-setting-section-title-inactive'}
                     onClick={this.handleDropdown}>
                    <span> {this.props.sectionName} </span>
                    <div className={this.state.isDropDown ? 'account-setting-section-title-icon-active' : 'account-setting-section-title-icon-inactive'} >
                        <MdChevronRight size='20px' />
                    </div>
                </div>
                {
                    !this.props.data || this.props.data.length === 0 ?
                    <NoEntry isActive={this.state.isDropDown}/> :
                    this.props.type === 'post' ?
                    this.props.data.map((i) => <PostEntry key={i._id} isActive={this.state.isDropDown} data={i}/>) :
                        this.props.data.map((i) => <CommentEntry key={i._id} isActive={this.state.isDropDown} data={i}/>)
                }
            </div>
        )
    }
}
class AccountSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            scrolled: null,
        };
        this.userId = this.props.match.params.userId;
        this.handleScroll = this.handleScroll.bind(this);
    }
    handleScroll() {
        this.setState({scrolled: window.scrollY})
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

        window.addEventListener('scroll', this.handleScroll);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    render() {
        return (
            <React.Fragment>
                <div className='account-setting-headbar-backbone'>
                    <AccountSettingHeadbar themeLogo={this.props.themeLogo}/>
                </div>
                <div className='account-setting-wrapper'>
                    <div className='account-setting-content-wrapper'>
                        {/*<AvatarSetting />*/}
                        {/*<ChangePassword />*/}
                        <Section sectionName='my posts' type='post' data={this.state.data.userPosts}/>
                        <Section sectionName='my comments' type='comment' data={this.state.data.userComments}/>
                        <Section sectionName='saved posts' type='post' data={this.state.data.savedPosts}/>
                        <Section sectionName='saved comments' type='comment' data={this.state.data.savedComments}/>
                        <Section sectionName='hidden posts' type='post' data={this.state.data.hiddenPosts}/>
                        <Section sectionName='hidden comments' type='comment' data={this.state.data.hiddenComments}/>
                    </div>

                </div>
            </React.Fragment>
        )
    }
}

export { AccountSetting };
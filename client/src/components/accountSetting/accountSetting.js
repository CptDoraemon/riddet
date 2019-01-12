import React from "react";
import './accountSetting.css';
import { HeaderFixedLogo } from "../header";
import { MdChevronRight } from "react-icons/md";

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

function PostEntry (props) {
    const wrapperClassName = props.isActive ? 'post-entry-wrapper-active' : 'post-entry-wrapper-inactive';
    return (
        <div className={wrapperClassName}>
            <div className='post-entry-info'>Posted by xxxxx date 22-22-22</div>
            <div className='post-entry-title'>I'm title</div>
            <div className='post-entry-content'>I'm content</div>
        </div>
        )
}
function CommentEntry (props) {

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
                <PostEntry isActive={this.state.isDropDown}/>
                <PostEntry isActive={this.state.isDropDown}/>
                <PostEntry isActive={this.state.isDropDown}/>
                <PostEntry isActive={this.state.isDropDown}/>
                <PostEntry isActive={this.state.isDropDown}/>
            </div>
        )
    }
}
class AccountSetting extends React.Component {
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
                        <Section sectionName='my posts' type='post'/>
                        <Section sectionName='my comments' type='comment'/>
                        <Section sectionName='saved posts' type='post'/>
                        <Section sectionName='saved comments' type='comment'/>
                        <Section sectionName='hidden posts' type='post'/>
                        <Section sectionName='hidden comments' type='comment'/>
                    </div>

                </div>
            </React.Fragment>
        )
    }
}

export { AccountSetting };
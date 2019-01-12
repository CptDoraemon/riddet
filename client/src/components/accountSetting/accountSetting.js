import React from "react";
import './accountSetting.css';
import { HeaderFixedLogo } from "../header";

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
                        {/*<SavedPosts />*/}
                        {/*<SavedComments />*/}
                        {/*<HiddenPosts />*/}
                        {/*<HiddenComments />*/}
                    </div>

                </div>
            </React.Fragment>
        )
    }
}

export { AccountSetting };
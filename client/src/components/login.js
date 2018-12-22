import React from 'react';

import { Link } from 'react-router-dom';
import './login.css';

class Login extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            inName: false,
            inPassword: false,
            name: '',
            password: ''
        };
        this.inNameOn = this.inNameOn.bind(this);
        this.inNameOff = this.inNameOff.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.inPasswordOn = this.inPasswordOn.bind(this);
        this.inPasswordOff = this.inPasswordOff.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }
    inNameOn() {
        this.setState({
            inName: true
        })
    }
    inNameOff() {
        if (this.state.name === '') {
            this.setState({
                inName: false
            })
        }
    }
    handleNameChange(e) {
        this.setState({
            name: e.target.value,
            inName: true
        })
    }
    inPasswordOn() {
        this.setState({
            inPassword: true
        })
    }
    inPasswordOff() {
        if (this.state.password === '') {
            this.setState({
                inPassword: false
            })
        }
    }
    handlePasswordChange(e) {
        this.setState({
            password: e.target.value,
            inPassword: true
        })
    }
    render() {
        return (
            <div className='login-wrapper'>
                <div className='login-left'>
                </div>
                <div className='login-right'>
                    <h3>Log in</h3>
                    <form action={this.handleSubmit} className='login-form'>

                        <div className='login-item-wrapper' onMouseOver={this.inNameOn} onMouseLeave={this.inNameOff}>
                            <span className={this.state.inName ? 'login-item-wrapper-label-small' : 'login-item-wrapper-label'}>Email</span>
                            <input onMouseOver={this.inNameOn} onMouseLeave={this.inNameOff} onFocus={this.inNameOn} onBlur={this.inNameOff} onChange={this.handleNameChange} value={this.state.name}/>
                        </div>

                        <div className='login-item-wrapper' onMouseOver={this.inPasswordOn} onMouseLeave={this.inPasswordOff}>
                            <span className={this.state.inPassword ? 'login-item-wrapper-label-small' : 'login-item-wrapper-label'}>Password</span>
                            <input type='password' onMouseOver={this.inPasswordOn} onMouseLeave={this.inPasswordOff} onFocus={this.inPasswordOn} onBlur={this.inPasswordOff} onChange={this.handlePasswordChange} value={this.state.password}/>
                        </div>

                        <button>Log in</button>
                    </form>
                    <div className='login-forget'>
                        <Link to=''>Forgot your password?</Link>
                    </div>
                    <div className='login-signup'>
                        <span>Don't have an account? <Link to=''>Sign up</Link> today!</span>
                    </div>
                </div>
            </div>
        )
    }
}

export { Login };
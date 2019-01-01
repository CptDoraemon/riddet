import React from 'react';

import { Link, Redirect } from 'react-router-dom';
import './form.css';
import { FormItem } from './formItem';

class Login extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            email: '',
            password: '',
            error: null,
            successMessage: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e, key) {
        this.setState({
            [key]: e.target.value,
        })
    }
    handleSubmit(e) {
        // 110 login success; 111 login failed
        e.preventDefault();
        let data = { email: this.state.email, password: this.state.password };
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
        }).then(res => res.json())
            .then(json => {
                if (json.code === '111') {
                    this.setState({
                        error: 'The credentials you supplied do not match our record'
                    })
                }
                if (json.code === '110') {
                    this.setState({successMessage: 'Welcome back ' + json.username +'!'});
                    setTimeout(() => window.location='/close', 3000);
                }
            }).catch((err) => {
                this.setState({
                    error: err
                })
        })
    }
    render() {
        if (!this.state.successMessage) {
            return (
                <div className='form-wrapper tsunami-bg'>
                    <div className='form-left'>
                    </div>
                    <div className='form-right'>
                        <h3>Log in</h3>
                        <form onSubmit={this.handleSubmit} className='form-form'>

                            <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                            <FormItem label='Password' value={this.state.password} handler={(e) => this.handleChange(e, 'password')} type='password'/>

                            <span className='form-form-error'> {this.state.error} </span>
                            <button>Log in</button>
                            <span className='form-form-error'> {this.state.successMessage} </span>
                        </form>
                        <div className='form-forget'>
                            <Link to=''>Forgot your password?</Link>
                        </div>
                        <div className='form-signup'>
                            <span>Don't have an account? <Link to='/signup'>Sign up</Link> today!</span>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className='form-wrapper tsunami-bg'>
                    <div className='form-left'>
                    </div>
                    <div className='form-right'>
                        <p className='form-login-success'> {this.state.successMessage} </p>
                        <p className='form-login-success'>This window will be closed in 3 seconds.</p>
                    </div>
                </div>
            )
        }
    }
}

export { Login };
import React from 'react';

import { Link, Redirect } from 'react-router-dom';
import './form.css';
import { FormItem } from './formItem';

class Signup extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            firstStage: true,
            email: '',
            username: '',
            password: '',
            errorEmail: null,
            errorUsername: null,
            errorPassword: null,
            successMessage: null
        };
        this.handleFirstSubmit = this.handleFirstSubmit.bind(this);
        this.handleSecondSubmit = this.handleSecondSubmit.bind(this);
    }
    handleChange(e, key) {
        this.setState({
            [key]: e.target.value,
        })
    }
    validationEmail (value) {
        return (value.indexOf('@') !== -1);
    }
    validationUsername (value) {
        return (!(/^\s*$/).test(value) && value.length < 21 && value.length > 2);
    }
    validationPassword (value) {
        return (value.length >= 8 && value.indexOf(' ') === -1);
    }
    resetState() {
        this.setState({
            errorEmail: null,
            errorUsername: null,
            errorPassword: null,
        })
    }
    handleFirstSubmit(e) {
        e.preventDefault();
        this.resetState();
        if (!this.validationEmail(this.state.email)) {
            this.setState({errorEmail: 'Invalid Email'});
            return;
        }
        let data = {email: this.state.email};

        fetch('/signup/first', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
        }).then(res => res.json())
            .then(json => {
                if (json === '104') {
                    this.setState({ errorEmail: 'This email is registered' });
                } else if (json === '101') {
                    this.setState({ errorEmail: 'Invalid email' });
                } else {
                    this.setState({ errorEmail: null, firstStage: false });
                }
            })
            .catch((err) => console.log(err));
    }
    handleSecondSubmit(e) {
        e.preventDefault();
        this.resetState();
        if (!this.validationEmail(this.state.email)) {
            this.setState({errorEmail: 'Invalid Email'});
            return;
        }
        if (!this.validationUsername(this.state.username)) {
            this.setState({errorUsername: 'Invalid Username'});
            return;
        }
        if (!this.validationPassword(this.state.password)) {
            this.setState({errorPassword: 'Invalid Password'});
            return;
        }
        let data = {email: this.state.email, username: this.state.username, password: this.state.password};


        // 100 success; 101 invalid email; 102 invalid username; 103 invalid password
        // 104 email taken; 105 username taken

        fetch('/signup/second', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
        }).then(res => res.json())
            .then(json => {
                if (json === '101') {
                    this.setState({errorEmail: 'Invalid Email'});
                    return;
                }
                if (json === '102') {
                    this.setState({errorUsername: 'Invalid Username'});
                    return;
                }
                if (json === '103') {
                    this.setState({errorPassword: 'Invalid Password'});
                    return;
                }
                if (json === '104') {
                    this.setState({errorEmail: 'Email taken'});
                    return;
                }
                if (json === '105') {
                    this.setState({errorUsername: 'Sorry, someone has taken this username.'});
                    return;
                }
                if (json === '106') {
                    this.setState({errorPassword: 'Connection error, please try again.'});
                    return;
                }
                if (json.code === '110') {
                    //login success
                    this.setState({successMessage: json.username + ', welcome to Riddet!'});
                    setTimeout(() => window.location = '/close', 3000);
                }
                if (json.code === '111') {
                    //login failed
                    this.setState({successMessage: 'welcome to Riddet!'});
                    setTimeout(() => window.location = '/close', 3000);
                }
            })
            .catch((err) => this.setState({errorPassword: err}));
    }
    firstStageForm() {
        return (
            <React.Fragment>
                <form onSubmit={this.handleFirstSubmit} className='form-form'>
                    <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                    <span className='form-form-error'> {this.state.errorEmail} </span>
                    <button>Next</button>
                </form>
                <div className='form-signup'>
                    <span>Already have an account? <Link to='/login'>Log in</Link></span>
                </div>
            </React.Fragment>
        )
    }
    secondStageForm() {
        return (
            <form onSubmit={this.handleSecondSubmit} className='form-form'>
                <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')} disabled={true} style={{cursor: 'not-allowed', opacity: 0.5}}/>
                <span className='form-form-error'> {this.state.errorEmail} </span>
                <span className='form-form-info' style={{cursor: 'pointer'}} onClick={() => this.setState({firstStage: true})}>Wanna change email?</span>

                <FormItem label='Username' value={this.state.username} handler={(e) => this.handleChange(e, 'username')}/>
                <span className='form-form-error'> {this.state.errorUsername} </span>
                <span className='form-form-info'>You will be recognized as your username in Riddet, username must be between 3 and 20 characters.</span>

                <FormItem label='Password' value={this.state.password} handler={(e) => this.handleChange(e, 'password')} type='password'/>
                <span className='form-form-error'> {this.state.errorPassword} </span>
                <span className='form-form-info'>Although only the hash value of your password will be stored in database, please pick a password you would not use anywhere else. The only validation check is length equal to or greater than 8.</span>
                <button>Next</button>
            </form>
        )
    }
    render() {
        if (!this.state.successMessage) {
            return (
                <div className='form-wrapper paris-bg'>
                    <div className='form-left'>
                    </div>
                    <div className='form-right'>
                        <h3>Sign up</h3>

                        { this.state.firstStage ? this.firstStageForm() : this.secondStageForm() }

                    </div>
                </div>
            )
        } else {
            return (
                <div className='form-wrapper paris-bg'>
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

export { Signup };
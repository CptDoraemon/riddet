import React from 'react';

import { Link } from 'react-router-dom';
import './form.css';
import { FormItem } from './formItem';

class Login extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            name: '',
            password: ''
        };
    }
    handleChange(e, key) {
        this.setState({
            [key]: e.target.value,
        })
    }
    render() {
        return (
            <div className='form-wrapper tsunami-bg'>
                <div className='form-left'>
                </div>
                <div className='form-right'>
                    <h3>Log in</h3>
                    <form action={this.handleSubmit} className='form-form'>

                        <FormItem label='Email' value={this.state.name} handler={(e) => this.handleChange(e, 'name')}/>
                        <FormItem label='Password' value={this.state.password} handler={(e) => this.handleChange(e, 'password')} type='password'/>

                        <button>Log in</button>
                    </form>
                    <div className='form-forget'>
                        <Link to=''>Forgot your password?</Link>
                    </div>
                    <div className='form-signup'>
                        <span>Don't have an account? <Link to=''>Sign up</Link> today!</span>
                    </div>
                </div>
            </div>
        )
    }
}

export { Login };
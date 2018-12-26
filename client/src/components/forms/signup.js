import React from 'react';

import { Link } from 'react-router-dom';
import './form.css';
import { FormItem } from './formItem';

class Signup extends React.Component {
    constructor (props) {
        super (props);
        this.state = {
            firstStage: true,
            email: '',
        };
        this.handleFirstSubmit = this.handleFirstSubmit.bind(this);
    }
    handleChange(e, key) {
        this.setState({
            [key]: e.target.value,
        })
    }
    handleFirstSubmit() {
        fetch('/signup/first', {
            method: 'POST',
            body: JSON.stringify({email: this.state.email}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
        }).then(res => res.json())
            .then(json => console.log(json))
            .catch((err) => console.log('123' + err));
    }
    firstStageForm() {
        return (
            <form onSubmit={this.handleFirstSubmit} className='form-form'>
                <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                <button>Next</button>
            </form>
        )
    }
    secondStageForm() {
        return (
            <form onSubmit={this.handleFirstSubmit} className='form-form'>
                <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                <FormItem label='Email' value={this.state.email} handler={(e) => this.handleChange(e, 'email')}/>
                <button>Next</button>
            </form>
        )
    }
    render() {
        return (
            <div className='form-wrapper paris-bg'>
                <div className='form-left'>
                </div>
                <div className='form-right'>
                    <h3>Sign up</h3>

                    { this.state.firstStage ? this.firstStageForm() : this.secondStageForm() }

                    <div className='form-signup'>
                        <span>Already have an account? <Link to='/login'>Log in</Link></span>
                    </div>
                </div>
            </div>
        )
    }
}

export { Signup };
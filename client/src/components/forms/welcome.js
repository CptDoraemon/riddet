import React from 'react';

import { Link } from 'react-router-dom';
import './form.css';

class Welcome extends React.Component {
    render() {
        return (
            <div className='form-wrapper paris-bg'>
                <div className='form-left'>
                </div>
                <div className='form-right'>
                    <h3>Welcome to Riddet!</h3>
                    <span>This window will be closed in 3 seconds...</span>
                </div>
            </div>
        )
    }
}

export { Welcome };
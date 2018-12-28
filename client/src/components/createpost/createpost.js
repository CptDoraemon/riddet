import React from 'react';

import { Link } from 'react-router-dom';
import './createpost.css';
import { HeaderLite } from '../header';
import { TextEditor } from './texteditor';

class Createpost extends React.Component {
    render() {
        return (
            <div className='createpost-wrapper'>
                <HeaderLite {...this.props}/>

                <div className='createpost-content-wrapper'>
                    <div className='createpost-content-title'>
                        <h3>Create Post</h3>
                    </div>
                    <div className='createpost-content-rules'>
                        <h4>Posting to Riddet</h4>
                        <ol>
                            <li>Remember the human</li>
                            <li>Behave like you would in real life</li>
                            <li>Look for the original source of content</li>
                            <li>Search for duplicates before posting</li>
                        </ol>
                    </div>
                    <div className='createpost-content-text-editor'>
                        <TextEditor/>
                    </div>
                </div>
            </div>
        )
    }
}

export { Createpost };
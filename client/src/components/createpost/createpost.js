import React from 'react';

import { Link } from 'react-router-dom';
import './createpost.css';
import { HeaderLite } from '../header';
import { PostTextEditor, PostEditPostTextEditor, CommentEditPostTextEditor } from './texteditor';

class Createpost extends React.Component {
    componentDidMount() {
        this.props.verifyAuthentication();
    }
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
                        <PostTextEditor themeColor={this.props.themeColor} isLogin={this.props.isLogin} username={this.props.user.username}/>
                    </div>
                </div>
            </div>
        )
    }
}

class EditPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            content: null,
        };
        this.type = this.props.match.params.postOrComment; // post or comment
        this.id = this.props.match.params.id;
    }
    componentDidMount() {
        this.props.verifyAuthentication();
        // verify if log in and if this post/comment was created by this user
        const data = {type: this.type, id: this.id};
        fetch('/verifyEditQualification', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(data),
                credentials: "same-origin"
            }
        ).then(res => res.json())
            .then(json => {
                // success
                if (json.code === '112') {
                    this.setState({
                        title: json.title,
                        content: json.content,
                    })
                }
                // error
                if (json === '113' || json === '106' || json === '111') {
                    window.location.href = '/';
                }
            })
            .catch((err) => window.location.href = '/')
    }
    render() {
        const editor = this.type === 'post' ? <PostEditPostTextEditor themeColor={this.props.themeColor} isLogin={this.props.isLogin} username={this.props.user.username} title={this.state.title} content={this.state.content} type={this.type} id={this.id}/> :
            <CommentEditPostTextEditor themeColor={this.props.themeColor} isLogin={this.props.isLogin} username={this.props.user.username} content={this.state.content} type={this.type} id={this.id}/>;

        return (
            <div className='createpost-wrapper'>
                <HeaderLite {...this.props}/>

                <div className='createpost-content-wrapper'>
                    <div className='createpost-content-title'>
                        <h3>Edit {this.type}</h3>
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
                        {
                            this.state.content === null ? null : editor
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export { Createpost, EditPost };
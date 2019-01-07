import React from 'react';
import './comment.css';
import '../card.css';
import { Vote, Save, Edit, Share, CommentUnclickable, Hide, Report } from "../buttons/cardButtons";
import { PostParser } from "../createpost/postparser";
import { CommentTextEditor } from '../createpost/texteditor';

function Login (props) {
    return (
        <div className='comment-login'>
            <span>What are your thoughts? Log in or Sign up </span>
            <a href='/login' target='iframe-s'>
                <button className='comment-login-button'>LOG IN</button>
            </a>
            <a href='/signup' target='iframe-s'>
                <button className='comment-signup-button'>SIGN UP</button>
            </a>
        </div>
    )
}

class Post extends React.Component {
    render() {
        const voteClassName = {
            up: ['card-sidebar-voteup', 'card-sidebar-voteup-voted'],
            count: 'card-sidebar-count',
            down: ['card-sidebar-votedown', 'card-sidebar-votedown-voted']
        };
        // date calculations
        const postDate = new Date(this.props.data.date);
        const nowDate = new Date();
        let dateDiff = Math.floor((nowDate - postDate) / (1000 * 60)); //minute
        let dateDiffMessage;
        dateDiffMessage = dateDiff === 1 ? ' minute ago' : ' minutes ago';
        dateDiffMessage = dateDiff + dateDiffMessage;
        if (dateDiff >= 60) {
            dateDiff = Math.floor(dateDiff / 60); //hour
            dateDiffMessage = dateDiff === 1 ? ' hour ago' : ' hours ago';
            dateDiffMessage = dateDiff + dateDiffMessage;
            if (dateDiff >= 24) {
                dateDiff = Math.floor(dateDiff / 24); //day
                dateDiffMessage = dateDiff === 1 ? ' day ago' : ' days ago';
                dateDiffMessage = dateDiff + dateDiffMessage;
            }
        }
        //
        const buttonSize='15px';
        const postId = this.props.data._id;
        const isSaved = this.props.data.isSaved;
        const isEditable = this.props.data.isEditable;
        const isHidden = this.props.data.isHidden;
        const isUpVoted = this.props.data.isUpVoted;
        const isDownVoted = this.props.data.isDownVoted;
        const upVotes = this.props.data.upVotes ? this.props.data.upVotes.length : 0;
        const downVotes = this.props.data.downVotes ? this.props.data.downVotes.length : 0;
        const count = upVotes - downVotes;
        const buttonClassName = 'comment-post-buttons-item';

        return (
            <div className='comment-post-wrapper'>
                <div className='comment-post-sidebar'>
                    <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                          postId={this.props.postId} count={count}/>
                </div>
                <div className='comment-post-content'>
                    <div className='comment-post-info'>
                        <p>Posted by
                            <span> u/{this.props.data.username}</span>
                            <span> {dateDiffMessage}</span>
                        </p>
                    </div>
                    <div className='comment-post-title'> <h3> {this.props.data.title} </h3> </div>

                    <div className='comment-post-post'>
                        {isHidden ?
                            <span>You hid this post</span> :
                            <PostParser post={this.props.data.post}/>
                        }

                    </div>

                    <div className='comment-post-buttons'>
                        <CommentUnclickable className={buttonClassName} size={buttonSize}/>

                        <Share className={buttonClassName} size={buttonSize} link={window.location.href}/>

                        <Save className={buttonClassName} isSaved={isSaved} postId={postId} size={buttonSize}/>

                        { isEditable ? <Edit size={buttonSize} className={buttonClassName}  /> : null }

                        <Hide className={buttonClassName} size={buttonSize} postId={postId}/>

                        <Report className={buttonClassName} size={buttonSize}/>

                    </div>
                </div>
            </div>
        )
    }
}

class CommentTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };
        this.postId = this.props.match.params.postId;
    }
    componentDidMount() {
        this.props.verifyAuthentication();

        fetch('/getComment', {
            method: 'POST',
            body: JSON.stringify({postId: this.postId}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.setState({data: json})
            })
            .catch((err) => {
                console.log(err);
            })
    }
    render() {
        return (
            <div className='comment-template-wrapper'>
                <div className='comment-template-content-wrapper'>
                    {this.state.data !== null ? <Post postId={this.postId} data={this.state.data}/> : null }


                    <Login/>


                </div>
            </div>
        )
    }
}

export { CommentTemplate };
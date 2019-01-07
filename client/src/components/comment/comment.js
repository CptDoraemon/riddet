import React from 'react';
import './comment.css';
import '../card.css';
import { Vote, CommentUnclickable } from "../buttons/cardButtons";
import { PostParser } from "../createpost/postparser";

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

        return (
            <div className='comment-post-wrapper'>
                <div className='comment-post-sidebar'>
                    <Vote className={{...voteClassName}} isUpVoted={false} isDownVoted={false}
                          postId={this.props.postId} count={0 - 0}/>
                </div>
                <div className='comment-post-content'>
                    <div className='comment-post-info'>
                        <p>Posted by
                            <span> u/{this.props.data.username}</span>
                            <span> {dateDiffMessage}</span>
                        </p>
                    </div>
                    <div className='comment-post-title'> <h3> {this.props.data.title} </h3> </div>
                    <div className='comment-post-post'> <PostParser post={this.props.data.post}/> </div>
                    <div className='comment-post-buttons'>
                        <CommentUnclickable className='card-body-bottombar-item'/>
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
            isLogin: this.props.isLogin,
            user: this.props.user,
            data: {
                username: '',
                title: '',
                post: '',
                isSaved: false,
                isUpVoted: false,
                isDownVoted: false,
                isEditable: false
            }
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
                    <Post postId={this.postId} data={this.state.data}/>

                </div>
            </div>
        )
    }
}

export { CommentTemplate };
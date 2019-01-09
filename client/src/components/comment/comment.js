import React from 'react';
import './comment.css';
import '../card.css';
import { Vote, Save, Edit, Share, CommentUnclickable, Hide, Report, Reply } from "../buttons/cardButtons";
import { PostParser } from "../createpost/postparser";
import {CommentTextEditor, ReplyTextEditor} from '../createpost/texteditor';

const nestedArrayTools = require('../tools/nestedArrayTools');
const searchByFlattenIndex = nestedArrayTools.searchByFlattenIndex;
const replaceByFlattenIndex = nestedArrayTools.replaceByFlattenIndex;
const flattenArray = nestedArrayTools.flattenArray;

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

function PostHOC (reply = false) {
    return class Post extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                replyTextEditor: false
            };
            this.toggleReplyTextEditor = this.toggleReplyTextEditor.bind(this);
        }
        toggleReplyTextEditor() {
            if (!this.props.isLogin) {
                window.open('/login', 'iframe-s');
                return
            }
            this.setState({replyTextEditor: !this.state.replyTextEditor});
        }
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

            const postOrData = reply ? this.props.data.comment : this.props.data.post;

            return (
                <div className='comment-post-wrapper'>
                    {/* Vote SideBar, omit count prop for a compact vote */}
                    <div className='comment-post-sidebar'>
                        <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                              postId={this.props.postId} count={reply ? null : count} size={reply ? '20px' : '25px'}/>
                    </div>

                    <div className='comment-post-content'>
                        {/* info */}

                        { reply ?
                            <div className='comment-post-info'>
                                    <span> u/{this.props.data.username}</span>
                                    <span> &middot; </span>
                                    <span> { count === 0 ? count + ' point' : count + ' points'}</span>
                                    <span> &middot; </span>
                                    <span> {dateDiffMessage}</span>
                            </div> :
                            <div className='comment-post-info'>
                                <p>Posted by
                                    <span> u/{this.props.data.username}</span>
                                    <span> {dateDiffMessage}</span>
                                </p>
                            </div>
                        }

                        {/* title */}
                        { !reply ?
                            <div className='comment-post-title'> <h3> {this.props.data.title} </h3> </div> :
                            null }

                        {/* post */}
                        <div className={reply ? 'comment-post-reply' : 'comment-post-post'} >
                            {isHidden ?
                                <span>You hid this post</span> :
                                <PostParser post={postOrData}/>
                            }
                        </div>

                        <div className='comment-post-buttons'>
                            { reply ?
                                <Reply className={buttonClassName} size={buttonSize} handleClick={this.toggleReplyTextEditor}/> :
                                <CommentUnclickable className={buttonClassName} size={buttonSize} />
                            }

                            <Share className={buttonClassName} size={buttonSize} link={window.location.href} icon={!reply}/>

                            <Save className={buttonClassName} isSaved={isSaved} postId={postId} size={buttonSize} icon={!reply}/>

                            { isEditable ? <Edit size={buttonSize} className={buttonClassName} icon={!reply} /> : null }

                            <Hide className={buttonClassName} size={buttonSize} postId={postId} icon={!reply}/>

                            <Report className={buttonClassName} size={buttonSize} icon={!reply}/>

                        </div>

                        { /* TextEditor for reply */ }
                        { reply ?
                        <div className={this.state.replyTextEditor ? 'reply-texteditor-active' : 'reply-texteditor-inactive'}>
                            <ReplyTextEditor themeColor={this.props.themeColor} isLogin={this.props.isLogin} postId={this.props.postId}/>
                        </div> : null }
                    </div>
                </div>
            )
        }
    }
}

const Post = PostHOC();
const ReplyPost = PostHOC(true);

function ReplyPosts(props) {

    function renderPost(array) {
        let posts = array.map((i) => i instanceof Array ?
            renderPost(i) :
            i instanceof Object ?
            <ReplyPost key={i._id} data={i} themeColor={props.themeColor} isLogin={props.isLogin} postId={props.postId}/> :
            null);
        return posts;
    }


    return renderPost(props.data);
}


class CommentTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            postData: null,
            commentArray: null,
            noMoreComment: false,
        };
        this.postId = this.props.match.params.postId;
        this.isLoadingComment = false;
        this.commentArrayFlatten= null;
        this.noMoreComment= false;
        this.lastCommentOrder = -1;
        this.loadHowManyComments = 10;
        this.bottomRef = React.createRef();
        this.loadMoreComments = this.loadMoreComments.bind(this);
        this.scrolled = this.scrolled.bind(this);
    }
    scrolled() {
        const scrolledBottom = window.scrollY + window.innerHeight;
        const height = this.bottomRef.current.offsetTop;
        if (scrolledBottom >= height && !this.isLoadingComment) {
            this.loadMoreComments()
        }
    }
    loadMoreComments(commentArray = this.state.commentArray.slice()) {
        if (this.noMoreComment || this.isLoadingComment) return;
        this.isLoadingComment = true;

        console.log(commentArray);
        console.log(commentArray);
        const start = this.lastCommentOrder + 1;
        const end = start + this.loadHowManyComments;
        const commentRequesting = this.commentArrayFlatten.slice(start, end);

        console.log(commentRequesting);
        fetch('/getComment', {
            method: 'POST',
            body: JSON.stringify({commentRequesting: commentRequesting}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                // upon success, replace the id in commentArray with comment object, update this.lastCommentOrder
                const commentRequested = json.slice();
                console.log(commentRequested);
                let start = this.lastCommentOrder + 1;
                commentRequested.map((i) => {
                    commentArray = replaceByFlattenIndex(commentArray, start, i);
                    start++
                });
                if (end >= this.commentArrayFlatten.length) {
                    this.noMoreComment = true;
                }
                this.lastCommentOrder += this.loadHowManyComments;
                this.isLoadingComment = false;

                this.setState({commentArray: commentArray});
            })
            .catch((err) => {
                console.log(err);
            })
    }
    componentDidMount() {
        this.props.verifyAuthentication();
        window.addEventListener('scroll', this.scrolled);

        fetch('/getCommentMainPost', {
            method: 'POST',
            body: JSON.stringify({postId: this.postId}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                let flatten;
                if (json.comments) {
                    flatten= flattenArray(json.comments);
                }
                this.commentArrayFlatten = flatten;
                // If this post has no comments, set this.noMoreComment
                if (!json.comments) {
                    this.noMoreComment = true;
                }
                this.setState({postData: json, commentArray: json.comments});
                // load comment
                this.loadMoreComments(json.comments);
            })
            .catch((err) => {
                console.log(err);
            });

    }
    componentWillUnmount() {
        window.addEventListener('scroll', this.scrolled);
    }
    render() {
        return (
            <div className='comment-template-wrapper'>
                <div className='comment-template-content-wrapper'>

                    { this.state.postData !== null ?
                        <Post postId={this.postId} data={this.state.postData}/> : null }

                    {
                        this.props.isLogin ?
                        <CommentTextEditor
                            themeColor={this.props.themeColor}
                            isLogin={this.props.isLogin}
                            postId={this.postId} /> :
                        <Login/>
                    }

                    {
                        this.state.commentArray === null || !this.state.commentArray ?
                        <div className='comment-no-comment'>Be the first one to comment!</div> :
                        <ReplyPosts data={this.state.commentArray} isLogin={this.props.isLogin} themeColor={this.props.themeColor} postId={this.props.postId}/>
                    }



                    <div ref={this.bottomRef} />

                </div>
            </div>
        )
    }
}

export { CommentTemplate };
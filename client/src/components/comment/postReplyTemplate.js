import React from "react";
import './comment.css';
import '../card.css';
import { Vote, Save, Edit, Share, CommentUnclickable, Hide, Report, Reply } from "../buttons/cardButtons";
import { PostParser } from "../createpost/postparser";
import {ReplyTextEditor} from '../createpost/texteditor';
import {flattenArray} from "../tools/nestedArrayTools";
const calcDateDiffMessage = require('../tools/dateCalculation').calcDateDiffMessage;

// Post is the main post in comment page
class Post extends React.Component {
    render() {
        const voteClassName = {
            up: ['card-sidebar-voteup', 'card-sidebar-voteup-voted'],
            count: 'card-sidebar-count',
            down: ['card-sidebar-votedown', 'card-sidebar-votedown-voted']
        };

        //
        const dateDiffMessage = calcDateDiffMessage(this.props.data.date);
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
        const post = this.props.data.post;
        const commentCount = this.props.data.comments ? flattenArray(this.props.data.comments).length : 0;


        return (
            <div className='comment-post-wrapper'>
                {/* Vote SideBar, omit count prop for a compact vote */}
                <div className='comment-post-sidebar'>
                    <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                          postId={this.props.postId} count={count} size='25px' type='post'/>
                </div>

                <div className='comment-post-content'>
                    {/* info */}
                    <div className='comment-post-info'>
                        <p>Posted by
                            <span> u/{this.props.data.username}</span>
                            <span> {dateDiffMessage}</span>
                        </p>
                    </div>

                    {/* title */}
                    <div className='comment-post-title'> <h3> {this.props.data.title} </h3> </div>

                    {/* post */}
                    <div className='comment-post-post'>
                        {isHidden ?
                            <span>You hid this post</span> :
                            <PostParser post={post}/>
                        }
                    </div>

                    <div className='comment-post-buttons'>
                        <CommentUnclickable className={buttonClassName} size={buttonSize} commentCount={commentCount}/>

                        <Share className={buttonClassName} size={buttonSize} link={window.location.href} icon={true}/>

                        <Save className={buttonClassName} isSaved={isSaved} postId={postId} size={buttonSize} icon={true} type='post'/>

                        { isEditable ? <Edit size={buttonSize} className={buttonClassName} icon={true} /> : null }

                        <Hide className={buttonClassName} size={buttonSize} postId={postId} icon={true} type='post'/>

                        <Report className={buttonClassName} size={buttonSize} icon={true}/>

                    </div>
                </div>
            </div>
        )
    }
}


// ReplyPost are the reply comments to the main post.
class ReplyPost extends React.Component {
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
        //
        const dateDiffMessage = calcDateDiffMessage(this.props.data.date);
        const buttonSize='15px';
        const commentId = this.props.data._id;
        const isSaved = this.props.data.isSaved;
        const isEditable = this.props.data.isEditable;
        const isHidden = this.props.data.isHidden;
        const isUpVoted = this.props.data.isUpVoted;
        const isDownVoted = this.props.data.isDownVoted;
        const upVotes = this.props.data.upVotes ? this.props.data.upVotes.length : 0;
        const downVotes = this.props.data.downVotes ? this.props.data.downVotes.length : 0;
        const count = upVotes - downVotes;
        const buttonClassName = 'comment-post-buttons-item';
        const comment = this.props.data.comment;

        const replyIndentationCSS = {
            marginLeft: this.props.identation*35 + 'px',
            borderLeft: '5px solid rgba(0,0,0,0.1)',
        };

        return (
            <React.Fragment>
                <div className='comment-post-wrapper' style={{...replyIndentationCSS}}>
                    {/* Vote SideBar, omit count prop for a compact vote */}
                    <div className='comment-post-sidebar'>
                        <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                              commentId={commentId} postId={this.props.postId} count={null} size='20px' type='comment'/>
                    </div>

                    <div className='comment-post-content'>
                        {/* info */}
                        <div className='comment-post-info'>
                            <span> u/{this.props.data.username}</span>
                            <span> &middot; </span>
                            <span> { count === 0 ? count + ' point' : count + ' points'}</span>
                            <span> &middot; </span>
                            <span> {dateDiffMessage}</span>
                        </div>

                        {/* no title */}

                        {/* post */}
                        <div className='comment-post-reply'>
                            {isHidden ?
                                <span style={{color: 'rgba(0,0,0,0.3)'}}>You hid this comment</span> :
                                <PostParser post={comment}/>
                            }
                        </div>

                        <div className='comment-post-buttons'>
                            <Reply className={buttonClassName} size={buttonSize} handleClick={this.toggleReplyTextEditor}/>

                            <Share className={buttonClassName} size={buttonSize} link={window.location.href} icon={false}/>

                            <Save className={buttonClassName} isSaved={isSaved} postId={commentId} size={buttonSize} icon={false} type='comment'/>

                            { isEditable ? <Edit size={buttonSize} className={buttonClassName} icon={false} /> : null }

                            <Hide className={buttonClassName} size={buttonSize} postId={commentId} icon={false}/>

                            <Report className={buttonClassName} size={buttonSize} icon={false}/>

                        </div>
                    </div>
                </div>
                { /* TextEditor for reply */ }
                <div className={this.state.replyTextEditor ? 'reply-texteditor-active' : 'reply-texteditor-inactive'}>
                    <ReplyTextEditor themeColor={this.props.themeColor} isLogin={this.props.isLogin} postId={this.props.postId} parentCommentId={this.props.data._id}/>
                </div>
            </React.Fragment>
        )
    }
}

export { Post, ReplyPost };



import React from 'react';
import './comment.css';
import {CommentTextEditor} from '../createpost/texteditor';
import {Post, ReplyPost} from "./postReplyTemplate";

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

function ReplyPosts(props) {

    let renderArray = [];
    let indentation = -1;

    function renderPost(array) {
        indentation++;
        for (let i=0; i<array.length; i++) {
            if (array[i] instanceof Object) {
                // array item could be id (typeof string), unloaded yet.
                if (array[i] instanceof Array) {
                    renderPost(array[i]);
                } else {
                    if (indentation > 0 && i === 0) {
                        // data is comment object
                        renderArray.push(<ReplyPost key={array[i]._id} data={array[i]} themeColor={props.themeColor} isLogin={props.isLogin} postId={props.postId} identation={indentation - 1}/>);
                    } else {
                        renderArray.push(<ReplyPost key={array[i]._id} data={array[i]} themeColor={props.themeColor} isLogin={props.isLogin} postId={props.postId} identation={indentation}/>);
                    }
                }
            }
        }
        indentation--;
    }

    renderPost(props.data);
    const render = renderArray.map((j) => j);
    return render;

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

        const start = this.lastCommentOrder + 1;
        const end = start + this.loadHowManyComments;
        const commentRequesting = this.commentArrayFlatten.slice(start, end);

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
                let start = this.lastCommentOrder + 1;
                for (let i=0; i<commentRequested.length; i++) {
                    commentArray = replaceByFlattenIndex(commentArray, start, commentRequested[i]);
                    start++;
                }

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
                        <Post postId={this.postId} data={this.state.postData} isLogin={this.props.isLogin} themeColor={this.props.themeColor}/> : null }

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
                        <ReplyPosts data={this.state.commentArray} isLogin={this.props.isLogin} themeColor={this.props.themeColor} postId={this.postId}/>
                    }



                    <div ref={this.bottomRef} />

                </div>
            </div>
        )
    }
}

export { CommentTemplate };
import React from 'react';

import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { MdComment, MdShare, MdBookmark, MdBookmarkBorder, MdHighlightOff, MdFlag, MdMoreHoriz, MdFirstPage, MdEdit, MdReply } from "react-icons/md";
import '../header.css';

class Vote extends React.Component {
    // it receives props type = 'up' || 'down'
    constructor(props) {
        super(props);
        this.state = {
            isUpVoted: this.props.isUpVoted,
            isDownVoted: this.props.isDownVoted,
            countOffset: 0,
        };
        this.isVoting = false;
        this.handleUpVote = this.handleUpVote.bind(this);
        this.handleDownVote = this.handleDownVote.bind(this);
    }
    handleUpVote(e) {
        e.preventDefault();
        if (this.isVoting) return;
        this.isVoting = true;

        if (this.state.isUpVoted && !this.state.isDownVoted) {
            // cancel up
            this.vote(true, true, -1);
        }
        if (!this.state.isUpVoted && this.state.isDownVoted) {
            // cancel down, vote up
            this.vote(false, true, 0);
            this.vote(true, false, 2);
        }
        if (!this.state.isUpVoted && !this.state.isDownVoted) {
            // vote up
            this.vote(true, false, 1);
        }
    }
    handleDownVote(e) {
        e.preventDefault();
        if (this.isVoting) return;
        this.isVoting = true;

        if (this.state.isUpVoted && !this.state.isDownVoted) {
            // cancel up, vote down
            this.vote(true, true, 0);
            this.vote(false, false, -2);
        }
        if (!this.state.isUpVoted && this.state.isDownVoted) {
            // cancel down
            this.vote(false, true, 1);
        }
        if (!this.state.isUpVoted && !this.state.isDownVoted) {
            // vote down
            this.vote(false, false, -1);
        }
    }
    vote(isUpVote, isCancel, offset) {
        let link;
        if (this.props.type === 'post') {
            if (isUpVote) {
                link = '/upVote'
            } else if (!isUpVote) {
                link = '/downVote'
            }
        } else if (this.props.type === 'comment') {
            if (isUpVote) {
                link = '/upVoteComment'
            } else if (!isUpVote){
                link = '/downVoteComment'
            }
        }
        const state = isUpVote ? 'isUpVoted' : 'isDownVoted';
        const failedAction = () => {
            this.isVoting = false;
        };
        const successAction = () => {
            this.isVoting = false;
            this.setState({[state]: !isCancel, countOffset: this.state.countOffset + offset});
        };

        const id = this.props.type === 'post' ? this.props.postId : this.props.commentId;
        fetch(link, {
            method: 'POST',
            body: JSON.stringify({id: id, isCancel: isCancel}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    window.open('/login', 'iframe-s');
                    failedAction();
                } else if (json === '150') {
                    // success
                    successAction();
                } else {
                    // failed
                    failedAction();
                }
            })
            .catch(err => {
                failedAction();
                console.log(err)
        })
    }

    render() {
        const upClassName = this.state.isUpVoted ? this.props.className.up[1] : this.props.className.up[0];
        const downClassName = this.state.isDownVoted ? this.props.className.down[1] : this.props.className.down[0];
        const countClassName = this.props.className.count;
        return (
            <React.Fragment>
                <div className={upClassName} onClick={this.handleUpVote}>
                        <GoArrowUp size={this.props.size}/>
                </div>

                { /* omit count prop for a compact vote */ }
                { this.props.count !== null ?
                    <div className={countClassName}>
                        { this.props.count + this.state.countOffset}
                    </div> : null
                }

                <div className={downClassName} onClick={this.handleDownVote}>
                    <GoArrowDown size={this.props.size}/>
                </div>
            </React.Fragment>
        )
    }
}

class Save extends React.Component {
    // 2 types (prop): post and comment.
    constructor(props) {
        super(props);
        this.state = {
            isSaved: this.props.isSaved,
        };
        this.isSaving = false;
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e) {
        e.preventDefault();
        if (this.isSaving) return;

        const link = this.props.type === 'post' ? '/savePost' : '/saveComment';
        const successAction = () => {
            this.isSaving = false;
            this.setState({isSaved: !this.state.isSaved});
        };
        const failedAction = () => {
            this.isSaving = false;
        };

        this.isSaving = true;
        fetch(link, {
            method: 'POST',
            body: JSON.stringify({id: this.props.postId, isCancel: this.state.isSaved}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    window.open('/login', 'iframe-s');
                    failedAction();
                } else if (json === '152') {
                    // success
                    successAction();
                } else {
                    // failed
                    failedAction();
                }
            })
            .catch(err => failedAction());
    }
    render() {
        const icon = this.state.isSaved ? <MdBookmark size='20px'/> : <MdBookmarkBorder size='20px'/>;
        return (
            <div className={this.props.className} onClick={this.handleClick}>
                { this.props.icon ? icon : null }
                { this.state.isSaved ? <span>saved</span> : <span>save</span> }
            </div>
        )
    }
}

class HideAndReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDropDown: false
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
    }
    toggleDropDown() {
        this.setState({isDropDown: !this.state.isDropDown})
    }
    render() {
        const itemWrapper = this.state.isDropDown ? null : { display: 'none' };

        return (
            <React.Fragment>
                <div className={this.props.className} onClick={this.toggleDropDown}>
                    { this.state.isDropDown ? <MdFirstPage size={this.props.size}/> : <MdMoreHoriz size={this.props.size}/> }
                </div>

                <div className={this.props.className} onClick={this.props.handleHide} style={{...itemWrapper}}>
                    <MdHighlightOff size={this.props.size}/>
                    <span>hide</span>
                </div>
                <div className={this.props.className} style={{...itemWrapper}}>
                    <MdFlag size={this.props.size}/>
                    <span>report</span>
                </div>
            </React.Fragment>
        )
    }
}

function Edit (props) {
    return (
        <div className={props.className}>
            { props.icon ? <MdEdit size={props.size}/> : null }
            <span>Edit</span>
        </div>
    )
}

class Share extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: false
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        const el = document.createElement('textarea');
        el.value = this.props.link;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        this.setState({notification: true});
    }
    componentDidUpdate() {
        if (this.state.notification === true) {
            setTimeout(() => this.setState({notification: false}), 5000)
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className={this.props.className} onClick={this.handleClick}>
                    { this.props.icon ? <MdShare size={this.props.size}/> : null }
                    <span>share</span>
                </div>
                <div className={this.state.notification ? 'notification-active' : 'notification-active notification-inactive'}>
                    <span>Link copied to clipboard!</span>
                </div>
            </React.Fragment>
        )
    }
}

class CommentClickable extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e) {
        e.preventDefault();
        window.open('/comment/' + this.props.postId, 'iframe-l');
        this.props.setIFrameLTitle(this.props.postTitle);
    }
    render() {
        const commentCount = this.props.commentCount;
        return (
            <div onClick={this.handleClick}>
                <div className={this.props.className}>
                    <MdComment size={this.props.size}/>

                    { commentCount === 0 ?
                        <span>comment</span> :
                        commentCount === 1 ?
                            <span>1 comment</span> :
                            <span>{commentCount} comments</span>
                    }

                </div>
            </div>
        )
    }
}

function CommentUnclickable (props) {
    const commentCount = props.commentCount;
    return (
        <div className={props.className}>
            <MdComment size={props.size}/>

            { commentCount === 0 ?
                <span>comment</span> :
                commentCount === 1 ?
                    <span>1 comment</span> :
                    <span>{commentCount} comments</span>
            }

        </div>
    )
}

function Reply(props){
        return (
            <div className={props.className} onClick={props.handleClick}>
                <MdReply size={props.size}/>
                <span>reply</span>
            </div>
        )
}

class Hide extends React.Component {
    constructor(props) {
        super(props);
        this.isHiding = false;
        this.handleHide = this.handleHide.bind(this);
    }
    handleHide() {
        if (this.isHiding) return;

        const link = this.props.type === 'post' ? '/hidePost' : '/hideComment';
        fetch(link, {
            method: 'POST',
            body: JSON.stringify({id: this.props.postId}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    window.open('/login', 'iframe-s');
                    this.isHiding = false;
                } else if (json === '154') {
                    // success
                    this.isHiding = false;
                    window.location.reload();
                } else {
                    // failed
                    this.isHiding = false;
                }
            })
            .catch(err => this.isHiding = false);
    };
    render() {
        return (
            <div className={this.props.className} onClick={this.handleHide}>
                { this.props.icon ? <MdHighlightOff size={this.props.size}/> : null }
                <span>hide</span>
            </div>
        )
    }
}

class Report extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                { this.props.icon ? <MdFlag size={this.props.size}/> : null }
                <span>report</span>
            </div>
        )
    }
}



export { Vote, Save, HideAndReport, Edit, Share, CommentClickable, CommentUnclickable, Reply, Hide, Report };
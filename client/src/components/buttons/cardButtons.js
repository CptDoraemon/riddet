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
            isVoting: false,
            countOffset: 0,
        };
        this.handleUpVote = this.handleUpVote.bind(this);
        this.handleDownVote = this.handleDownVote.bind(this);
    }
    handleUpVote(e) {
        e.preventDefault();
        if (this.state.isVoting) return;
        this.setState({isVoting: true});

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
        if (this.state.isVoting) return;

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
        this.setState({isVoting: true});
        const link = isUpVote ? '/upvote' : '/downvote';
        const state = isUpVote ? 'isUpVoted' : 'isDownVoted';
        const failedAction = () => {
            this.setState({isVoting: false});
        };
        const successAction = () => {
            this.setState({isVoting: false, [state]: !isCancel, countOffset: this.state.countOffset + offset});
        };
        fetch(link, {
            method: 'POST',
            body: JSON.stringify({id: this.props.postId, isCancel: isCancel}),
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
    constructor(props) {
        super(props);
        this.state = {
            isSaved: this.props.isSaved,
            isSaving: false
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e) {
        e.preventDefault();
        if (this.state.isSaving) return;

        const successAction = () => {
            this.setState({isSaving: false, isSaved: !this.state.isSaved});
        };
        const failedAction = () => {
            this.setState({isSaving: false})
        };
        this.setState({isSaving: true});
        fetch('/savepost', {
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

function CommentClickable (props) {
    return (
        <a href={'/comment/' + props.postId} target='iframe-l'>
            <div className={props.className}>
                <MdComment size={props.size}/>
                <span>comment</span>
            </div>
        </a>
    )
}

function CommentUnclickable (props) {
    return (
        <div className={props.className}>
            <MdComment size={props.size}/>
            <span>comment</span>
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
        this.state = {
            isHiding: false
        };
        this.handleHide = this.handleHide.bind(this);
    }
    handleHide() {
        if (this.state.isHiding) return;

        fetch('/hidepost', {
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
                    this.setState({isHiding: false});
                } else if (json === '154') {
                    // success
                    this.setState({isHiding: false, isHidden: true});
                    window.location.reload();
                } else {
                    // failed
                    this.setState({isHiding: false});
                }
            })
            .catch(err => this.setState({isHiding: false}));
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
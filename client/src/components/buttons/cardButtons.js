import React from 'react';

import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { MdComment, MdShare, MdBookmark, MdBookmarkBorder, MdHighlightOff, MdFlag, MdMoreHoriz, MdFirstPage, MdEdit, MdReply } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { Link } from 'react-router-dom';
import '../header.css';
import './cardButtons.css';

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
        const icon = this.state.isSaved ? <MdBookmark size={this.props.size}/> : <MdBookmarkBorder size={this.props.size}/>;
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
        this.handleHide = this.handleHide.bind(this);
        this.isHiding = false;
    }
    toggleDropDown() {
        this.setState({isDropDown: !this.state.isDropDown})
    }
    handleHide() {
        if (this.isHiding) return;

        this.isHiding = true;
        fetch('/hidePost', {
            method: 'POST',
            body: JSON.stringify({id: this.props.id}),
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
                    // hide this Card
                    this.props.handleHide();
                } else {
                    // failed
                    this.isHiding = false;
                }
            })
            .catch(err => this.isHiding = false);
    };
    render() {
        const itemWrapper = this.state.isDropDown ? null : { display: 'none' };

        return (
            <React.Fragment>
                <div className={this.props.className} onClick={this.toggleDropDown}>
                    { this.state.isDropDown ? <MdFirstPage size={this.props.size}/> : <MdMoreHoriz size={this.props.size}/> }
                </div>

                <div className={this.props.className} onClick={this.handleHide} style={{...itemWrapper}}>
                    <MdHighlightOff size={this.props.size}/>
                    <span>hide</span>
                </div>
                <div style={{...itemWrapper}}>
                    <Report icon={true} className={this.props.className} size={this.props.size} type={this.props.type} id={this.props.id}/>
                </div>
            </React.Fragment>
        )
    }
}

function Edit (props) {
    const postOrComment = props.type === 'post' ? 'post' : 'comment';
    const link = '/editPost/' + postOrComment + '/' + props.id;
    return (
        <Link to={link} target='_blank'>
            <div className={props.className}>
                { props.icon ? <MdEdit size={props.size}/> : null }
                <span>Edit</span>
            </div>
        </Link>
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
        const textWithNumber = commentCount === 0 ?
            <span>comment</span> :
            commentCount === 1 ?
                <span>1 comment</span> :
                <span>{commentCount} comments</span> ;

        const numberOnly = <span>{commentCount}</span>;

        return (
            <div onClick={this.handleClick}>
                <div className={this.props.className}>
                    <MdComment size={this.props.size}/>

                    { !this.props.noText ?
                        textWithNumber :
                        numberOnly
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
    constructor(props) {
        super(props);
        this.state = {
            showReportWindow: false,
            isHide: true,
            reason: '',
            isSubmitting: false,
            isSuccess: false,
            message: null
        };
        this.isLogin = false;
        this.toggleReportWindow = this.toggleReportWindow.bind(this);
        this.toggleHide = this.toggleHide.bind(this);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    toggleReportWindow() {
        const toggleFunc = () => {
            const body = document.getElementsByTagName("BODY")[0];

            if (this.state.showReportWindow) {
                this.setState({showReportWindow: false}, () => body.style.overflow = 'auto')
            } else {
                this.setState({showReportWindow: true}, () => body.style.overflow = 'hidden')
            }
        };
        if (!this.isLogin) {
            fetch('/verifyAuthentication', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json; charset=utf-8',
                },
                credentials: "same-origin"
            })
                .then(res => res.json())
                .then(json => {
                    if (json.code === '111') {
                        window.open('/login', 'iframe-s');
                    } else {
                        this.isLogin = true;
                        toggleFunc()
                    }
                })
                .catch(err => console.log(err));
        } else {
            toggleFunc()
        }
    };
    preventWindowClose(e) {
        e.stopPropagation();
    }
    toggleHide() {
        this.setState({isHide: !this.state.isHide})
    }
    handleTextareaChange(e) {
        this.setState({reason: e.target.value})
    }
    handleSubmit(e) {
        e.preventDefault();
        if (this.state.isSubmitting) return;

        if (this.state.reason.length > 200) {
            this.setState({message: 'Reason length exceeds limit.'});
            return
        }

        this.setState({message: null, isSubmitting: true});
        const data = {
            type: this.props.type,
            id: this.props.id,
            reason: this.state.reason,
            isHide: this.state.isHide
        };
        fetch('/submitReport', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({data: data}),
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    window.open('/login', 'iframe-s');
                } else if (json === '161'){
                    this.setState({message: 'Reason length exceeds limit.', isSubmitting: false});
                } else if (json === '155') {
                    this.setState({message: 'Connection error, please try again later.', isSubmitting: false});
                } else if (json === '160') {
                    this.setState({message: 'Thank you for your report, we will handle it soon.', isSubmitting: false, isSuccess: true});
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({message: 'Something unexpected happened, please try again later.', isSubmitting: false});
            });
    }
    render() {
        const postOrComment = this.props.type === 'post' ? 'post' : 'comment';
        const disableButton = this.state.isSubmitting || this.state.isSuccess;
        const buttonCSS = disableButton ? 'report-window-submit-disabled' : 'report-window-submit';
        const reportWindow = (
            <div className='report-window-fullscreen' onClick={this.toggleReportWindow}>
                <div className='report-window-wrapper' onClick={this.preventWindowClose}>
                    <div className='report-window-header'>
                        <h2>Report</h2>
                        <div className='report-window-header-close' onClick={this.toggleReportWindow}>
                            <IoIosClose size='30px' />
                        </div>
                    </div>
                    <form className='report-window-body'>
                        <h3>Reporting { postOrComment }, id: { this.props.id }</h3>
                            <div className='report-window-textarea-wrapper'>
                                <p className='report-window-textarea-label'>Reason (maximum 200 characters):</p>
                                <textarea className='report-window-textarea' value={this.state.reason} onChange={this.handleTextareaChange}/>
                            </div>
                            <div className='report-window-checkbox' onClick={this.toggleHide}>
                                <input type="checkbox" checked={this.state.isHide} />
                                <p>Hide this { postOrComment } for you?</p>
                            </div>
                        <button className={buttonCSS} disabled={disableButton} onClick={this.handleSubmit}>Submit</button>
                        <div className='report-window-message'> {this.state.message} </div>
                    </form>
                </div>
            </div>
        );
        return (
            <div>
                <div className={this.props.className} onClick={this.toggleReportWindow}>
                    { this.props.icon ? <MdFlag size={this.props.size}/> : null }
                    <span >report</span>
                </div>
                { this.state.showReportWindow ?  reportWindow  : null }
            </div>
        )
    }
}



export { Vote, Save, HideAndReport, Edit, Share, CommentClickable, CommentUnclickable, Reply, Hide, Report };
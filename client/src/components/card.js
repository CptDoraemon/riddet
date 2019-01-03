import React from 'react';

import { Link } from 'react-router-dom';
import './card.css';
import { Vote, Save, HideAndReport } from './buttons/cardButtons';
import { MdComment, MdShare, MdEdit } from "react-icons/md";
import { PostParser } from "./createpost/postparser";


class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentIsMaxHeight: false,
            unfold: false,
            isHidden: false,
            isHiding: false
        };
        this.contentRef = React.createRef();
        this.handleHide = this.handleHide.bind(this);
        this.postId = this.props.data._id;
    }
    unfold() {
        this.setState({
            unfold: true
        })
    }
    handleHide(e) {
        e.preventDefault();
        if (this.state.isHiding) return;

        fetch('/hidepost', {
            method: 'POST',
            body: JSON.stringify({id: this.postId}),
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
                } else {
                    // failed
                    this.setState({isHiding: false});
                }
            })
            .catch(err => this.setState({isHiding: false}));
    };
    handleReport() {

    }

    componentDidMount() {
        this.setState({
            contentIsMaxHeight: false,
            unfold: false
        });
        if (this.contentRef.current.clientHeight >= 500) {
            this.setState({
                contentIsMaxHeight: true
            })
        }
    }
    render() {

        // data
        const data = this.props.data;
        const [
            username,
            title,
            post,
            date,
            comments,
            upVotes,
            downVotes,
            postId,
            isUpVoted,
            isDownVoted, // By current login user
            isSaved,
            isEditable
        ] = [
            data.username,
            data.title,
            data.post,
            data.date,
            data.comments ? data.comments.length : 0,
            data.upVotes ? data.upVotes.length : 0,
            data.downVotes ? data.downVotes.length : 0,
            data._id,
            data.isUpVoted,
            data.isDownVoted,
            data.isSaved,
            data.isEditable
        ];

        // date calculations
        const postDate = new Date(date);
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

        // vote ClassName
        const voteClassName = {
            up: ['card-sidebar-voteup', 'card-sidebar-voteup-voted'],
            count: 'card-sidebar-count',
            down: ['card-sidebar-votedown', 'card-sidebar-votedown-voted']
        };

        // Button size
        const buttonSize = '20px';

        if (this.state.isHidden) return null;
        return (
                <div className='card-wrapper'>
                    <div className='card-sidebar'>

                        <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                              postId={postId} count={upVotes - downVotes}/>

                    </div>
                    <div className='card-body'>
                        <div className='card-body-info'>
                            <p>Posted by
                                <span> u/{username}</span>
                                <span> {dateDiffMessage}</span>
                            </p>
                        </div>
                        <div
                            className={this.state.unfold ? 'card-body-content card-body-content-unfold' : 'card-body-content'}
                            ref={this.contentRef}
                        >
                            <h3> {title} </h3>
                            <PostParser post={post}/>
                        </div>
                        <div className='card-body-content-maxheight-placeholder'>
                            <span
                                onClick={this.unfold.bind(this)}> {this.state.contentIsMaxHeight && !this.state.unfold ? '... click to unfold ...' : null} </span>
                        </div>
                        <div className='card-body-bottombar'>
                            <div className='card-body-bottombar-item'>
                                <MdComment size={buttonSize}/>
                                <span>comments</span>
                            </div>
                            <div className='card-body-bottombar-item'>
                                <MdShare size={buttonSize}/>
                                <span>share</span>
                            </div>

                            <Save className='card-body-bottombar-item' isSaved={isSaved} postId={postId} size={buttonSize}/>

                            { isEditable ?
                            <div className='card-body-bottombar-item'>
                                <MdEdit size={buttonSize}/>
                                <span>Edit</span>
                            </div> : null }

                            <HideAndReport className='card-body-bottombar-item' handleHide={this.handleHide} handleReport={this.handleReport} size={buttonSize}/>

                        </div>
                    </div>
                </div>
        )
    }
}

export { Card };
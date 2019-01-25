import React from 'react';

import './card.css';
import { Vote, Save, HideAndReport, Edit, Share, CommentClickable } from '../buttons/cardButtons';
import { PostParser } from "../createpost/postparser";
import { flattenArray } from "../tools/nestedArrayTools";

const calcDateDiffMessage = require('../tools/dateCalculation').calcDateDiffMessage;


class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentIsMaxHeight: false,
            unfold: false,
            isHidden: false,
        };
        this.contentRef = React.createRef();
        this.handleHide = this.handleHide.bind(this);
    }
    unfold() {
        this.setState({
            unfold: true
        })
    }
    handleHide() {
        this.setState({isHidden: true});
    }
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
            commentCount,
            upVotes,
            downVotes,
            postId,
            isUpVoted,
            isDownVoted, // By current login user
            isSaved,
            isEditable,
            isEdited,
        ] = [
            data.username,
            data.title,
            data.post,
            data.date,
            data.comments ? flattenArray(data.comments).length : 0,
            data.upVotes ? data.upVotes.length : 0,
            data.downVotes ? data.downVotes.length : 0,
            data._id,
            data.isUpVoted,
            data.isDownVoted,
            data.isSaved,
            data.isEditable,
            data.isEdited ? data.isEdited : false
        ];

        // date calculations
        const dateDiffMessage = calcDateDiffMessage(date);

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
                              postId={postId} count={upVotes - downVotes} size='25px' type='post'/>

                    </div>
                    <div className='card-body'>
                        <div className='card-body-info'>
                            <p>Posted by
                                <span> u/{username}</span>
                                <span> {dateDiffMessage}</span>
                                {isEdited ? <span> *Edited*</span> : null}
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

                            <CommentClickable postId={postId} className='card-body-bottombar-item' commentCount={commentCount} postTitle={title} setIFrameLTitle={this.props.setIFrameLTitle}/>

                            <Share className='card-body-bottombar-item' size={buttonSize} link={window.location.href + 'comment/' + postId} icon={true}/>

                            <Save className='card-body-bottombar-item' isSaved={isSaved} postId={postId} size={buttonSize} icon={true} type='post'/>

                            { isEditable ? <Edit size={buttonSize} className='card-body-bottombar-item' icon={true} type='post' id={postId}/> : null }

                            <HideAndReport className='card-body-bottombar-item' handleHide={this.handleHide} handleReport={this.handleReport} size={buttonSize} id={postId} type='post'/>

                        </div>
                    </div>
                </div>
        )
    }
}

export { Card };
import React from 'react';

import './classic.css';
import { Vote, Save, HideAndReport, Edit, Share, CommentClickable } from '../buttons/cardButtons';
import { PostParser } from "../createpost/postparser";
import { flattenArray } from "../tools/nestedArrayTools";
import { MdZoomOutMap, MdComment } from "react-icons/md";

const calcDateDiffMessage = require('../tools/dateCalculation').calcDateDiffMessage;


class Classic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showContent: false,
            isHidden: false,
        };
        this.handleHide = this.handleHide.bind(this);
        this.handleShowContent = this.handleShowContent.bind(this);
    }
    handleHide() {
        this.setState({isHidden: true});
    }
    handleReport() {

    }
    handleShowContent() {
        this.setState({showContent: !this.state.showContent})
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
        const buttonSize = '15px';

        if (this.state.isHidden) return null;
        return (
            <div className='classic-wrapper'>
                <div className='classic-sidebar'>
                    <div className='classic-sidebar-scale'>
                        <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                              postId={postId} count={upVotes - downVotes} size='25px' type='post'/>
                    </div>
                </div>

                <div className='classic-image'>
                    <MdComment size='20px'/>
                </div>

                <div className='classic-body'>
                    <div className='classic-body-title'>
                        <h3> {title} </h3>
                    </div>
                    <div className='classic-body-info'>
                        <p>Posted by
                            <span> u/{username}</span>
                            <span> {dateDiffMessage}</span>
                            {isEdited ? <span> *Edited*</span> : null}
                        </p>
                    </div>
                    <div className='classic-body-buttons'>

                        <div className='classic-body-button'>
                            <MdZoomOutMap size={buttonSize} onClick={this.handleShowContent} />
                        </div>

                        <CommentClickable postId={postId} className='classic-body-button' commentCount={commentCount} postTitle={title} setIFrameLTitle={this.props.setIFrameLTitle}/>

                        <Share className='classic-body-button' size={buttonSize} link={window.location.href + 'comment/' + postId} icon={true}/>

                        <Save className='classic-body-button' isSaved={isSaved} postId={postId} size={buttonSize} icon={true} type='post'/>

                        { isEditable ? <Edit size={buttonSize} className='classic-body-button' icon={true} type='post' id={postId}/> : null }

                        <HideAndReport className='classic-body-button' handleHide={this.handleHide} handleReport={this.handleReport} size={buttonSize} id={postId} type='post'/>

                    </div>

                    {
                        this.state.showContent ?
                            !post.length ?
                                <div className='classic-body-content'>
                                    <span style={{color: 'rgba(0,0,0,0.1)'}}> (Empty) </span>
                                </div> :
                            <div className='classic-body-content'>
                                <PostParser post={post}/>
                            </div> :
                            null
                    }

                </div>

            </div>
        )
    }
}

export { Classic };
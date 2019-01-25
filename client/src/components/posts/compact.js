import React from 'react';

import './compact.css';
import { Vote, Save, Hide, Report, Edit, Share, CommentClickable } from '../buttons/cardButtons';
import { PostParser } from "../createpost/postparser";
import { flattenArray } from "../tools/nestedArrayTools";
import { MdComment, MdMoreHoriz } from "react-icons/md";
import { IoMdExpand, IoMdContract } from "react-icons/io";

const calcDateDiffMessage = require('../tools/dateCalculation').calcDateDiffMessage;


class Compact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showContent: false,
            isHidden: false,
            isDropDown: false,
            isHoveringIcon: false,
        };
        this.handleHide = this.handleHide.bind(this);
        this.handleShowContent = this.handleShowContent.bind(this);
        this.handleExpandHover = this.handleExpandHover.bind(this);
        this.handleDropDown = this.handleDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
    }
    handleHide() {
        this.setState({isHidden: true});
    }
    handleReport() {

    }
    handleShowContent() {
        this.setState({showContent: !this.state.showContent})
    }
    handleExpandHover() {
        this.setState({isHoveringIcon: !this.state.isHoveringIcon})
    }
    handleDropDown() {
        this.setState({isDropDown: !this.state.isDropDown})
    }
    closeDropDown() {
        if (this.state.isDropDown) {
            this.setState({isDropDown: false})
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
        const buttonSize = '15px';

        if (this.state.isHidden) return null;
        return (
            <div className='compact-wrapper'>
                <div className='compact-sidebar'>
                    <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted}
                          postId={postId} count={upVotes - downVotes} size='25px' type='post'/>
                </div>

                <div className='compact-expand'>
                    <div className='compact-expand-icon-wrapper' onMouseEnter={this.handleExpandHover} onMouseLeave={this.handleExpandHover} onClick={this.handleShowContent} >
                        {
                            !this.state.isHoveringIcon ?
                                <MdComment size='20px'/> :
                                this.state.showContent ?
                                    <IoMdContract size='20px'/> :
                                    <IoMdExpand size='20px'/>


                        }
                    </div>
                </div>

                <div className='compact-body'>
                    <div className='compact-body-title'>
                        <h3> {title} </h3>
                    </div>
                    <div className='compact-body-info'>
                        <p>Posted by
                            <span> u/{username}</span>
                            <span> {dateDiffMessage}</span>
                            {isEdited ? <span> *Edited*</span> : null}
                        </p>
                    </div>
                </div>

                    <CommentClickable postId={postId} className='compact-body-comment-button' commentCount={commentCount} postTitle={title} setIFrameLTitle={this.props.setIFrameLTitle} noText={true}/>

                    <div className='compact-body-showmore-button' onClick={this.handleDropDown}>
                        <MdMoreHoriz size={buttonSize} />

                    </div>

                {
                    !this.state.isDropDown ?
                        null :

                        <div className='compact-body-buttons' onMouseLeave={this.closeDropDown}>
                            <Share className='compact-body-button' size={buttonSize} link={window.location.href + 'comment/' + postId} icon={true}/>
                            <Save className='compact-body-button' isSaved={isSaved} postId={postId} size={buttonSize} icon={true} type='post'/>
                            { isEditable ? <Edit size={buttonSize} className='compact-body-button' icon={true} type='post' id={postId}/> : null }
                            <Hide className='compact-body-button' size={buttonSize} postId={postId} type='post' icon={true}/>
                            <Report className='compact-body-button' size={buttonSize} icon={true} id={postId} type='post'/>
                        </div>
                }

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
        )
    }
}

export { Compact };
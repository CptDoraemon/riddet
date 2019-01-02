import React from 'react';

import { Link } from 'react-router-dom';
import './card.css';
import {Vote} from './buttons/cardButtons';
import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { MdComment, MdShare, MdBookmark, MdHighlightOff, MdFlag } from "react-icons/md";


class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentIsMaxHeight: false,
            unfold: false,
        };
        this.contentRef = React.createRef();
    }
    unfold() {
        this.setState({
            unfold: true
        })
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
            id,
            isUpVoted,
            isDownVoted // By current login user
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
        ];
        console.log(upVotes, downVotes);

        // date calculations
        const postDate = new Date(date);
        const nowDate = new Date();
        let dateDiff = Math.floor((nowDate - postDate) / (1000 * 60)); //minute
        let dateDiffMessage = dateDiff + ' minutes ago';
        if (dateDiff >= 60) {
            dateDiff = Math.floor(dateDiff / 60); //hour
            dateDiffMessage = dateDiff + ' hours ago';
            if (dateDiff >= 24) {
                dateDiff = Math.floor(dateDiff / 24); //day
                dateDiffMessage = dateDiff + ' days ago';
            }
        }

        // vote ClassName
        const voteClassName = {
            up: ['card-sidebar-voteup', 'card-sidebar-voteup-voted'],
            count: 'card-sidebar-count',
            down: ['card-sidebar-votedown', 'card-sidebar-votedown-voted']
        };

        return (
            <div className='card-wrapper'>
                <div className='card-sidebar'>

                    <Vote className={{...voteClassName}} isUpVoted={isUpVoted} isDownVoted={isDownVoted} id={id} count={upVotes - downVotes}/>

                </div>
                <div className='card-body'>
                    <div className='card-body-info'>
                        <p>Posted by
                            <span> u/{username}</span>
                            <span> {dateDiffMessage}</span>
                        </p>
                    </div>
                    <div
                        className={this.state.unfold ? 'card-body-content card-body-content-unfold' : 'card-body-content' }
                        ref={this.contentRef}
                    >
                        <h3> { title } </h3>
                        <p> { post }</p>
                    </div>
                    <div className='card-body-content-maxheight-placeholder'>
                        <span onClick={this.unfold.bind(this)}> {this.state.contentIsMaxHeight && !this.state.unfold ? '... click to unfold ...' : null} </span>
                    </div>
                    <div className='card-body-bottombar'>
                        <div className='card-body-bottombar-item'>
                            <MdComment size='20px'/>
                            <span>comments</span>
                        </div>
                        <div className='card-body-bottombar-item'>
                            <MdShare size='20px'/>
                            <span>share</span>
                        </div>
                        <div className='card-body-bottombar-item'>
                            <MdBookmark size='20px'/>
                            <span>save</span>
                        </div>
                        <div className='card-body-bottombar-item'>
                            <MdHighlightOff size='20px'/>
                            <span>hide</span>
                        </div>
                        <div className='card-body-bottombar-item'>
                            <MdFlag size='20px'/>
                            <span>report</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export { Card };
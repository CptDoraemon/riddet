import React from 'react';

import { Link } from 'react-router-dom';
import './card.css';

import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { MdComment, MdShare, MdBookmark, MdHighlightOff, MdFlag } from "react-icons/md";


class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentIsMaxHeight: false,
            unfold: false
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
        const postDate = new Date(this.props.date);
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


        return (
            <div className='card-wrapper'>
                <div className='card-sidebar'>
                    <div className='card-sidebar-voteup'>
                        <GoArrowUp size='25px'/>
                    </div>
                    <div className='card-sidebar-count'>
                        6
                    </div>
                    <div className='card-sidebar-votedown'>
                        <GoArrowDown size='25px'/>
                    </div>

                </div>
                <div className='card-body'>
                    <div className='card-body-info'>
                        <p>Posted by
                            <span> u/{this.props.username}</span>
                            <span> {dateDiffMessage}</span>
                        </p>
                    </div>
                    <div
                        className={this.state.unfold ? 'card-body-content card-body-content-unfold' : 'card-body-content' }
                        ref={this.contentRef}
                    >
                        <h3> { this.props.title } </h3>
                        <p> { this.props.post }</p>
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
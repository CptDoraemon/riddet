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
                        <span>Posted by u/CptDoraemon 4 hours ago</span>
                    </div>
                    <div
                        className={this.state.unfold ? 'card-body-content card-body-content-unfold' : 'card-body-content' }
                        ref={this.contentRef}
                    >
                        <h3>Give Thanks for the Winter Solstice. You Might Not Be Here Without It.</h3>
                        <p>Via New York Times, By Shannon Hall. Dec. 20, 2017.

                            On Dec. 21, or Friday this year, the sun will hug the horizon. For those of us in the Northern Hemisphere, it will seem to barely rise — hardly peeking above a city’s skyline or a forest’s snow-covered evergreens — before it swiftly sets.

                            For months, the orb’s arc across the sky has been slumping, shortening each day.

                            In New York City, for example, the sun will be in the sky for just over nine hours — roughly six hours less than in June at the summer solstice. The winter solstice marks the shortest day of the year, before the sun reverses course and climbs higher into the sky. (At the same time, places like Australia in the Southern Hemisphere mark the summer solstice, the longest day of the year.)

                            This is a good opportunity to imagine what such a day might look like if we had evolved on another planet where the sun would take a different dance across the sky. You might want to feel thankful for the solstices and seasons we do have, or we might not be here to witness them at all.

                            The solstices occur because most planets do not spin upright, or perpendicular to their orbits.

                            The Earth, for example, slouches 23.5 degrees on a tilted axis. This leaves the planet’s North Pole pointed toward the North Star over relatively long periods of time, even as Earth makes its yearlong migration around the sun. That means the Northern Hemisphere will spend half the year tilted slightly toward the sun, bathing in direct sunlight during summer’s long, blissful days, and half the year cooling off as it leans slightly away from the sun during winter’s short, frigid days. Dec. 21 marks the day when the North Pole is most tilted away from the sun.

                            But every planet slouches at different angles.
                            The axial tilt of Venus, for example, is so extreme — 177 degrees — that the planet is essentially flipped upside down with its South Pole pointing up. Perhaps counter-intuitively, that means that there’s very little tilt to its upside-down spin and its hemispheres will never dramatically point toward or away from the sun. As such, the sun’s dance across the sky will remain relatively stable — shifting by a mere six degrees over the course of a Venusian year.</p>
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
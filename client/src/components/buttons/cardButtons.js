import React from 'react';

import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { MdComment, MdShare, MdBookmark, MdHighlightOff, MdFlag } from "react-icons/md";

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
            body: JSON.stringify({id: this.props.id, isCancel: isCancel}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
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

    componentDidMount() {
        this.setState({isVoted: this.props.isVoted})
    }
    render() {
        const upClassName = this.state.isUpVoted ? this.props.className.up[1] : this.props.className.up[0];
        const downClassName = this.state.isDownVoted ? this.props.className.down[1] : this.props.className.down[0];
        const countClassName = this.props.className.count;
        return (
            <React.Fragment>
                <div className={upClassName} onClick={this.handleUpVote}>
                        <GoArrowUp size='25px'/>
                </div>
                <div className={countClassName}>
                    { this.props.count + this.state.countOffset}
                </div>
                <div className={downClassName} onClick={this.handleDownVote}>
                    <GoArrowDown size='25px'/>
                </div>
            </React.Fragment>
        )
    }
}



export { Vote };
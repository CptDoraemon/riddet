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
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleUpVote(e) {
        e.preventDefault();
        if (this.state.isVoting) return;

        const isVoted = this.state.isUpVoted;
        this.setState({isVoted: !isVoted, isVoting: true});

        const diff = this.props.type === 'up' ? 1 : -1;
        const voteDiff = isVoted ? 0 : diff;
        const voteReset = voteDiff === 0 ? diff : 0;
        this.props.changeVote(voteDiff);
        const actionAfterFailed = () => {
                this.props.changeVote(voteReset);
                this.setState({isVoted: isVoted, isVoting: false});
        };

        const link = this.props.type === 'up' ? '/upvote' : '/downvote';
        fetch(link, {
            method: 'POST',
            body: JSON.stringify({id: this.props.id, isCancel: isVoted}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            }
        })
            .then(res => res.json())
            .then(json => {
                if (json === '111') {
                    actionAfterFailed();
                    window.open('/login', 'iframe-s');
                } else if (json === '150') {
                    // success
                    this.setState({isVoting: false});
                } else {
                    // failed
                    actionAfterFailed();
                }
            })
            .catch(err => {
                actionAfterFailed();
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
                    { this.props.count + this.state.voteDiff}
                </div>
                <div className={downClassName} onClick={this.handleDownVote}>
                    <GoArrowDown size='25px'/>
                </div>
            </React.Fragment>
        )
    }
}



export { Vote };
import React from 'react';
import './frontpage.css';

import { HeaderMax } from './header';
import { Card } from './card';
import { Info } from './info';
import { Loading, LoadingFailed } from "./tools/loading";

function Cards (props) {
    const data = props.postData;
    if (data.length !== 0) {
        let posts = data.map((i) => <Card username={i.username} title={i.title} post={i.post} date={i.date} />);
        return posts
    } else {
        return null
    }
}
class Frontpage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            view: 'card',
            sort: 'hot',
            loadingPost: true,
            loadingPostSuccess: true,
            postData: []
        };
        this.loadingRef = React.createRef();
        this.toggleView = this.toggleView.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }
    toggleView (e) {
        this.setState({
            view: e
        })
    }
    toggleSort(item) {
        this.setState({
            sort: item
        })
    }
    requestPosts() {
        this.setState({loadingPost: true, loadingPostSuccess: true});
        fetch('/getNewPost', {
            method: 'GET'
        })
            .then(res => res.json())
            .then(json => {
                let postData = [...this.state.postData];
                json.map((i) => postData.push(i));
                this.setState({
                    postData: postData,
                    loadingPost: false,
                    loadingPostSuccess: true
                });
            })
            .catch((err) => {
                this.setState({loadingPost: false, loadingPostSuccess: false});
                console.log(err);
            })
    }
    loadMore() {
        const scrolledBottom = window.scrollY + window.innerHeight;
        const height = this.loadingRef.current.offsetTop;
        console.log(height, scrolledBottom);
        if (scrolledBottom > height && !this.state.loadingPost) {
            this.requestPosts()
        }
    }
    componentDidMount() {
        this.props.verifyAuthentication();
        this.requestPosts();
        window.addEventListener('scroll', this.loadMore);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.loadMore);
    }
    render() {
        return (
            <div className='frontpage-wrapper'>
                <HeaderMax {...this.props} view={this.state.view} toggleView={this.toggleView} sort={this.state.sort} toggleSort={this.toggleSort} />
                <div className='main-content-wrapper'>
                    <div className='main-content-wrapper-box'>
                        <div className='posts-wrapper' id='postContainer'>

                            <Cards postData={this.state.postData} />
                            { this.state.loadingPost ? <Loading /> : null }
                            { this.state.loadingPostSuccess ? null : <LoadingFailed/> }
                            <div ref={this.loadingRef} />
                        </div>
                        <div className='infos-wrapper'>
                            <Info {...this.props} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export { Frontpage };
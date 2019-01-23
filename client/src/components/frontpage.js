import React from 'react';
import './frontpage.css';

import { HeaderMax } from './header';
import { Card } from './posts/card';
import { Classic } from './posts/classic';
import { Compact } from './posts/compact';
import { Info } from './info';
import { Loading, LoadingFailed, NoMoreLoad } from "./tools/loading";

function Cards (props) {
    const data = props.postData;
    if (data.length) {
        // i is posts objects
        return data.map((i) => <Card key={i._id} data={{...i}} setIFrameLTitle={props.setIFrameLTitle}/>);
    } else {
        return null
    }
}
function Classics (props) {
    const data = props.postData;
    if (data.length) {
        // i is posts objects
        return data.map((i) => <Classic key={i._id} data={{...i}} setIFrameLTitle={props.setIFrameLTitle}/>);
    } else {
        return null
    }
}
function Compacts (props) {
    const data = props.postData;
    if (data.length) {
        // i is posts objects
        return data.map((i) => <Compact key={i._id} data={{...i}} setIFrameLTitle={props.setIFrameLTitle}/>);
    } else {
        return null
    }
}
class Frontpage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            view: 'card',
            sort: 'new',
            loadingPost: false,
            loadingPostSuccess: true,
            postData: [],
            noMorePost: false,
        };
        this.loadingRef = React.createRef();
        this.toggleView = this.toggleView.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.requestPosts = this.requestPosts.bind(this);
    }
    toggleView (e) {
        this.setState({
            view: e
        })
    }
    toggleSort(sortType) {
        this.setState({
            sort: sortType,
            postData: [],
            noMorePost: false,
            loadingPost: false
        },
            this.requestPosts);
    }
    requestPosts() {
        if (this.state.noMorePost || this.state.loadingPost) return;

        let link;
        if (this.state.sort === 'new') {
            link = '/getNewPost'
        } else if (this.state.sort === 'hot') {
            link = '/getHotPost'
        } else if (this.state.sort === 'top') {
            link = '/getTopPost'
        }

        let lastPostId = this.state.postData.length === 0 ? null : this.state.postData[this.state.postData.length - 1]._id;
        lastPostId = {lastPostId: lastPostId};

        const sendRequest = () => {
            fetch(link, {
                method: 'POST',
                body: JSON.stringify(lastPostId),
                headers:{
                    'Content-Type': 'application/json; charset=utf-8',
                },
                credentials: "same-origin"
            })
                .then(res => res.json())
                .then(json => {
                    let postData = [...this.state.postData];
                    if (json === '140') {
                        //no more posts
                        this.setState({noMorePost: true})
                    } else {
                        json.map((i) => postData.push(i));
                    }
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
        };

        this.setState({loadingPost: true, loadingPostSuccess: true}, sendRequest);
    }
    loadMore() {
        const scrolledBottom = window.scrollY + window.innerHeight;
        const height = this.loadingRef.current.offsetTop;
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
        const posts =
            this.state.view === 'card' ?
                <Cards postData={this.state.postData} setIFrameLTitle={this.props.setIFrameLTitle}/> :
                this.state.view === 'classic' ?
                    <Classics postData={this.state.postData} setIFrameLTitle={this.props.setIFrameLTitle}/> :
                    <Compacts postData={this.state.postData} setIFrameLTitle={this.props.setIFrameLTitle}/>;

        const postWrapperCSS = this.state.view === 'card' ? 'posts-wrapper' : 'post-wrapper-fullscreen posts-wrapper';
        return (
            <div className='frontpage-wrapper'>
                <HeaderMax {...this.props} view={this.state.view} toggleView={this.toggleView} sort={this.state.sort} toggleSort={this.toggleSort} />
                <div className='main-content-wrapper'>
                    <div className={ postWrapperCSS } id='postContainer'>

                        { posts }

                        { this.state.loadingPost ? <Loading /> : null }
                        { this.state.loadingPostSuccess ? null : <LoadingFailed/> }
                        <div ref={this.loadingRef} />
                        { this.state.noMorePost ? <NoMoreLoad /> : null }
                    </div>
                    <div className='infos-wrapper'>
                        <Info {...this.props} />
                    </div>
                </div>
            </div>
        )
    }
}

export { Frontpage };
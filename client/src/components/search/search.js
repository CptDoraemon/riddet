import React from 'react';
import '../frontpage.css';
import './search.css';

import { HeaderLite } from "../header";
import { Classic } from '../posts/classic';
import { Loading, LoadingFailed, NoMoreLoad } from "../tools/loading";


function Classics (props) {
    const data = props.postData;
    if (data.length) {
        // i is posts objects
        return data.map((i) => <Classic key={i._id} data={{...i}} setIFrameLTitle={props.setIFrameLTitle}/>);
    } else {
        return null
    }
}

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: [],
            isError: false
        };
        this.query = new URLSearchParams(this.props.location.search).get('key');
        this.sendSearchRequest = this.sendSearchRequest.bind(this);
    }
    sendSearchRequest() {
        fetch('/search', {
            method: 'POST',
            body: JSON.stringify({key: this.query}),
            headers:{
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: "same-origin"
        })
            .then(res => res.json())
            .then(json => {
                this.setState({
                    data: json,
                    isLoaded: true
                })
            })
            .catch(e => {
                console.log(e);
                this.setState({isError: true})
            });
    }
    componentDidMount() {
        this.sendSearchRequest()
    }
    render() {
        return (
            <div>
                <HeaderLite {...this.props} searchPreFill={this.query}/>
                <div className='search-wrapper'>
                    <div className='search-message'>
                        <h3>{
                        !this.state.isLoaded
                            ? 'Fetching results from server'
                            : this.state.isError
                            ? 'Ooops, something unexpected happended. Please reload.'
                            : this.state.data.length === 0
                                ? 'No match for search: ' + this.query
                                : 'Search results for: ' + this.query
                    } </h3>
                    </div>
                    { !this.state.isLoaded ? <Loading/> : <Classics postData={this.state.data} {...this.props}/> }
                </div>
            </div>
        )
    }
}

export { Search };
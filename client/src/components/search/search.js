import React from 'react';
import '../frontpage.css';

import { HeaderLite } from "../header";
import { Classic } from '../posts/classic';


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

    render() {
        const query = new URLSearchParams(this.props.location.search).get('key');
        return (
            <div>
                <HeaderLite {...this.props} />
                { query }
            </div>
        )
    }
}

export { Search };
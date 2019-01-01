import Loader from 'react-loader-spinner';
import React from 'react';

class Loading extends React.Component {
    render() {
        return(
            <Loader
                type="Bars"
                color='rgb(54, 121, 204)'
                height="50"
                width="200"
            />
        );
    }
}

class LoadingFailed extends React.Component {
    render() {
        return(
            <div style={{color: 'grey', width: '100%', fontSize: '12px'}}>
                <p style={{textAlign: 'center', width: '100%'}}>Oops, something unexpected happened, please reload.</p>
            </div>
        );
    }
}
export {Loading, LoadingFailed };
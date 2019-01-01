import Loader from 'react-loader-spinner';
import React from 'react';

class Loading extends React.Component {
    render() {
        return(
            <div style={{margin: '20px'}}>
                <Loader
                    type="Bars"
                    color='rgb(54, 121, 204)'
                    height='40'
                    width="200"
                />
            </div>
        );
    }
}

const messageWrapper = {
    color: 'grey',
    width: '100%',
    fontSize: '12px',
    marginTop: '100px',
    fontWeight: 'bold',
    textAlign: 'center',
};
class LoadingFailed extends React.Component {
    render() {
        return(
            <div style={{...messageWrapper}}>
                <p style={{width: '100%'}}>Oops, something unexpected happened, please reload.</p>
            </div>
        );
    }
}

class NoMoreLoad extends React.Component {
    render() {
        return(
            <div style={{...messageWrapper}}>
                <p style={{width: '100%'}}>Emmm... Is that Voyager 1 on your left?</p>
            </div>
        );
    }
}
export {Loading, LoadingFailed, NoMoreLoad };
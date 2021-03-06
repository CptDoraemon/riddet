import React from "react";
import './iframe.css';
import { IoIosClose } from "react-icons/io";

class IFrameL extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isWorking: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
    }
    handleChange() {
        const url = document.getElementById("iframe-l").contentWindow.location.href;
        if (url.slice(url.length - 5, url.length) === 'close') {
            window.location.reload();
        } else if (url === 'about:blank') {

        } else {
            if (!this.state.isWorking) this.setState({isWorking: true});
            document.body.style.overflow = 'hidden';
        }
    }
    close() {
        document.getElementById("iframe-s").contentWindow.location.href = 'about:blank';
        if (this.state.isWorking) this.setState({isWorking: false});
        document.body.style.overflow = 'auto';
    }
    preventClose(e) {
        e.stopPropagation();
    }
    render() {
        return(
            <div className={this.state.isWorking ? 'iframe-l-wrapper' : 'iframe-l-wrapper-hidden'} onClick={this.close}>
                <div className='iframe-l-bodywrapper' onClick={this.preventClose}>
                    <div className='iframe-l-headbar'>
                        <div className='iframe-l-headbar-title'>
                            { this.props.title }
                        </div>
                        <div className='iframe-l-headbar-close' onClick={this.close}>
                            <IoIosClose size='25px'/>
                            <span>close</span>
                        </div>
                    </div>
                    <iframe title='iframe-l' id='iframe-l' name='iframe-l' onLoad={this.handleChange}> </iframe>
                </div>
            </div>
        )
    }
}

export { IFrameL };
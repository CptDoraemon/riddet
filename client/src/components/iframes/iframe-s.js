import React from "react";
import './iframe.css';
import { IoIosClose } from "react-icons/io";

class IFrameS extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isWorking: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
    }
    handleChange() {
        const url = document.getElementById("iframe-s").contentWindow.location.href;
        if (url.slice(url.length - 5, url.length) === 'close') {
            window.location.reload();
        } else if (url === 'about:blank') {
            // FOR IE/EDGE
        } else {
            this.setState({isWorking: true});
            document.body.style.overflow = 'hidden';
        }
    }
    close() {
        this.setState({
            isWorking: false
        });
        document.body.style.overflow = 'auto';
    }
    render() {
        return(
            <div className={this.state.isWorking ? 'iframe-s-wrapper' : 'iframe-s-wrapper-hidden'}>
                <div className='iframe-s-close-icon' onClick={this.close}>
                    <IoIosClose size='50px'/>
                </div>
                <iframe title='iframe-s' id='iframe-s' name='iframe-s' onLoad={this.handleChange}> </iframe>
            </div>
        )
    }
}

export { IFrameS };
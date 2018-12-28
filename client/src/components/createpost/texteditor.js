import React from 'react';
import './texteditor.css';

class TextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teTitle: 'Title',
            tePost: 'Text (optional)'
        };
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.tePostDefault = 'Text (optional)';
        this.teTitleDefault = 'Title';
    }
    handleTextareaChange(e) {
        let defaultValue = e.target.id === 'teTitle' ? this.teTitleDefault : this.tePostDefault;

        if (e.target.value.slice(0, defaultValue.length) === defaultValue) {
            let value = e.target.value.slice(defaultValue.length, e.target.value.length);
            this.setState({
                [e.target.id]: value
            })
        } else {
            this.setState({
                [e.target.id]: e.target.value
            })
        }

        let el = document.getElementById(e.target.id);
        el.style.height = '0';
        let scrollHeight = el.scrollHeight;
        let paddingTop = window.getComputedStyle(el, null).getPropertyValue('padding-top');
        let paddingBot = window.getComputedStyle(el, null).getPropertyValue('padding-bottom');
        paddingTop = parseFloat(paddingTop);
        paddingBot = parseFloat(paddingBot);
        scrollHeight = scrollHeight - paddingTop - paddingBot;
        el.style.height = scrollHeight + 'px';
    }
    render() {
        return (
            <div className='text-editor-wrapper'>
                <form>
                    <div className='text-editor-title'>
                        <textarea className={this.state.teTitle === this.teTitleDefault ? 'text-editor-editor-default-text' : null}
                                  id='teTitle' name='title' value={this.state.teTitle} onChange={this.handleTextareaChange}/>
                    </div>
                    <div className='text-editor-editor-wrapper'>
                        <div className='text-editor-editor-toolbox'>
                        </div>
                        <textarea className={this.state.tePost === this.tePostDefault ? 'text-editor-editor-default-text' : null}
                            id='tePost' name='post' value={this.state.tePost} onChange={this.handleTextareaChange} />
                    </div>
                </form>
            </div>
        )
    }
}

export { TextEditor };
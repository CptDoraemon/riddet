import React from 'react';
import './texteditor.css';

class TextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teTitle: 'Title (required)',
            tePost: 'Text (optional)'
        };
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.clearDefault = this.clearDefault.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.tePostDefault = 'Text (optional)';
        this.teTitleDefault = 'Title (required)';
    }
    clearDefault(e) {
        let defaultValue = e.target.id === 'teTitle' ? this.teTitleDefault : this.tePostDefault;
        if (e.target.value === defaultValue) {
            this.setState({
                [e.target.id]: ''
            })
        }
    }
    handleBlur(e) {
        let defaultValue = e.target.id === 'teTitle' ? this.teTitleDefault : this.tePostDefault;
        if (e.target.value === '') {
            this.setState({
                [e.target.id]: defaultValue
            })
        }
    }
    handleTextareaChange(e) {
        this.setState({
            [e.target.id]: e.target.value
        });

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
        const handlers = {
            onChange: this.handleTextareaChange,
            onFocus: this.clearDefault,
            onBlur: this.handleBlur
        };
        return (
            <div className='text-editor-wrapper'>
                <form>
                    <div className='text-editor-title'>
                        <textarea className={this.state.teTitle === this.teTitleDefault ? 'text-editor-editor-default-text' : null}
                                  id='teTitle' name='title' value={this.state.teTitle} {...handlers}/>
                    </div>
                    <div className='text-editor-editor-wrapper'>
                        <div className='text-editor-editor-toolbox'>
                        </div>
                        <textarea className={this.state.tePost === this.tePostDefault ? 'text-editor-editor-default-text' : null}
                            id='tePost' name='post' value={this.state.tePost} {...handlers}/>
                    </div>
                </form>
            </div>
        )
    }
}

export { TextEditor };
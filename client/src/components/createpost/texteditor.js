import React from 'react';
import './texteditor.css';
import { FiBold, FiItalic, FiAlertCircle, FiEdit3, FiImage } from "react-icons/fi";

class ItemGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHover: false,
        };
        this.handleHover = this.handleHover.bind(this);
    }
    handleHover() {
        this.setState({
            isHover: !this.state.isHover
        })
    }
    render() {
        const spanClassName = this.state.isHover ? 'text-editor-editor-toolbox-label-active' : 'text-editor-editor-toolbox-label-inactive'
        return (
            <div className='text-editor-editor-toolbox-item' onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}>
                <this.props.Icon size='inherit' />
                <span className={spanClassName}>{this.props.label}</span>
            </div>
        )
    }
}

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
                            <ItemGenerator Icon={FiBold} label='bold' />
                            <ItemGenerator Icon={FiItalic} label='italic' />
                            <ItemGenerator Icon={FiEdit3} label='delete' />
                            <ItemGenerator Icon={FiAlertCircle} label='spoiler' />
                            <ItemGenerator Icon={FiImage} label='add image' />
                        </div>
                        <textarea className={this.state.tePost === this.tePostDefault ? 'text-editor-editor-default-text' : null}
                            id='tePost' name='post' value={this.state.tePost} {...handlers}/>
                    </div>
                    <div className='text-editor-button'>
                        <button style={{backgroundColor: this.props.themeColor[0]}}>Post</button>
                    </div>
                </form>
            </div>
        )
    }
}

export { TextEditor };
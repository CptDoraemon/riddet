import React from 'react';
import './texteditor.css';
import { FiBold, FiItalic, FiAlertCircle, FiEdit3, FiImage, FiArrowDownLeft, FiArrowDownRight } from "react-icons/fi";

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
        const spanClassName = this.state.isHover ? 'text-editor-editor-toolbox-label-active' : 'text-editor-editor-toolbox-label-inactive';
        const itemClassNmae = this.props.isSelected ? 'text-editor-editor-toolbox-item-selected' : 'text-editor-editor-toolbox-item';
        return (
            <div className={itemClassNmae} onMouseEnter={this.handleHover} onMouseLeave={this.handleHover} onClick={this.props.toggleButton}>
                <this.props.Icon style={{width: 'inherit', height: 'inherit'}}/>
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
            tePost: 'Text (optional)',
            bold: false,
            italic: false,
            spoiler: false,
            strikethrough: false,
            list: false,
            markdown: false,
            preview: false
        };
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.clearDefault = this.clearDefault.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.tePostDefault = 'Text (optional)';
        this.teTitleDefault = 'Title (required)';
        this.toggleButton = this.toggleButton.bind(this);
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
        let content = e.target.value;
        this.setState({
            [e.target.id]: content
        });

        function getActualHeight(el) {
            el.style.height = '0';
            let scrollHeight = el.scrollHeight;
            let paddingTop = window.getComputedStyle(el, null).getPropertyValue('padding-top');
            let paddingBot = window.getComputedStyle(el, null).getPropertyValue('padding-bottom');
            paddingTop = parseFloat(paddingTop);
            paddingBot = parseFloat(paddingBot);
            let height = scrollHeight - paddingTop - paddingBot;
            return height;
        }

        let el = document.getElementById(e.target.id);
        let actualHeight = getActualHeight(el);
        if (e.target.id === 'teTitle') {
            el.style.height = actualHeight + 'px';
        }
        if (e.target.id === 'tePost') {
            let preview = document.getElementById('tePreview');
            let previewHeight = getActualHeight(preview);
            let setHeight = Math.max(actualHeight, previewHeight);
            el.style.height = setHeight + 'px';
            preview.style.height = setHeight + 'px';
            this.renderPreview(content);
        }
    }
    renderPreview(content) {
        let preview = document.getElementById('tePreview');
        let node;
        let textnode;
        while (preview.firstChild) {
            preview.removeChild(preview.firstChild);
        }
        console.log(content);
        content = JSON.stringify(content);
        console.log(content);
        content = content.slice(1, content.length - 1);
        content = content.split('\\n');
        content.map((i) => {
            node = document.createElement('p');
            textnode = i === '' ?  document.createTextNode(' '): document.createTextNode(i);
            node.appendChild(textnode);
            preview.appendChild(node);
        });
        console.log(content);

    }
    toggleButton(buttonName) {
        let toggleButton = () => {
            let el = document.getElementById('tePost');
            let start = el.selectionStart;
            let end = el.selectionEnd;
            let post;
            let selection;

            if (buttonName === 'bold') {
                if (start === end) {
                    this.setState({
                        [buttonName]: !this.state[buttonName]
                    });
                } else {
                    post = this.state.tePost.slice();
                    selection = this.state.tePost.slice(start, end);
                    selection = '<b>' + selection + '</b>';
                    post = post.slice(0, start) + selection + post.slice(end, post.length);
                    this.setState({
                        tePost: post
                    });
                }
            }
        };
        return toggleButton;
    };
    togglePreview(buttonName) {
        let togglePreview = () => {
            if(buttonName === 'markdown') {
                !this.state.preview ? this.setState({markdown: !this.state.markdown}) : this.setState({markdown: true, preview: false});
                }
            if(buttonName === 'preview') {
                !this.state.markdown ? this.setState({preview: !this.state.preview}) : this.setState({preview: true, markdown: false});
            }
            };
        return togglePreview;
        };
    render() {
        const handlers = {
            onChange: this.handleTextareaChange,
            onFocus: this.clearDefault,
            onBlur: this.handleBlur
        };

        let markdownClassName;
        let previewClassName;
        if (this.state.markdown) {
            markdownClassName = this.state.tePost === this.tePostDefault ? 'text-editor-editor-default-text text-editor-maximize' : 'text-editor-maximize';
            previewClassName = 'text-editor-preview text-editor-minimize';
        } else if (this.state.preview) {
            markdownClassName = 'text-editor-minimize';
            previewClassName = 'text-editor-preview text-editor-maximize';
        } else {
            markdownClassName = this.state.tePost === this.tePostDefault ? 'text-editor-editor-default-text' : null;
            previewClassName = 'text-editor-preview';
        }

        return (
            <div className='text-editor-wrapper'>
                <form>
                    <div className='text-editor-title'>
                        <textarea className={this.state.teTitle === this.teTitleDefault ? 'text-editor-editor-default-text' : null}
                                  id='teTitle' name='title' value={this.state.teTitle} {...handlers}/>
                    </div>
                    <div className='text-editor-editor-wrapper'>
                        <div className='text-editor-editor-toolbox-wrapper'>
                            <div className='text-editor-editor-toolbox-left'>
                                <ItemGenerator Icon={FiBold} label='bold' toggleButton={this.toggleButton('bold')} isSelected={this.state.bold}/>
                                <ItemGenerator Icon={FiItalic} label='italic' toggleButton={this.toggleButton('italic')} isSelected={this.state.italic}/>
                                <ItemGenerator Icon={FiEdit3} label='strikethrough' toggleButton={this.toggleButton('strikethrough')} isSelected={this.state.del}/>
                                <ItemGenerator Icon={FiAlertCircle} label='spoiler' toggleButton={this.toggleButton('spoiler')} isSelected={this.state.spoiler}/>
                                <ItemGenerator Icon={FiImage} label='add image' />
                            </div>
                            <div className='text-editor-editor-toolbox-center'>
                                <ItemGenerator Icon={FiArrowDownRight} label='markdown' toggleButton={this.togglePreview('markdown')} isSelected={this.state.markdown}/>
                                <ItemGenerator Icon={FiArrowDownLeft} label='preview' toggleButton={this.togglePreview('preview')} isSelected={this.state.preview}/>
                            </div>
                            <div className='text-editor-editor-toolbox-right'>
                            </div>
                        </div>
                        <div className='text-editor-markdown-wrapper'>
                            <textarea className={markdownClassName}
                                id='tePost' name='post' value={this.state.tePost} {...handlers}/>
                            <div className={previewClassName} id='tePreview'>

                            </div>
                        </div>
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
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

class TeTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teTitle: 'Title (required)',
        };
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.teTitleDefault = 'Title (required)';
        this.clearDefault = this.clearDefault.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
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
    handleTitleChange(e) {
        let content = e.target.value;
        this.setState({
            teTitle: content,
        });
        // Adjust Textarea Height
        // getActualHeight() is at bottom
        let el = document.getElementById(e.target.id);
        let actualHeight = getActualHeight(el);
        el.style.height = actualHeight + 'px';
    }
    render() {
        const handlers = {
            onFocus: this.clearDefault,
            onBlur: this.handleBlur
        };
        return (
            <div className='text-editor-title'>
                        <textarea
                            className={this.state.teTitle === this.teTitleDefault ? 'text-editor-editor-default-text' : null}
                            id='teTitle' name='title' value={this.state.teTitle} {...handlers}
                            onChange={this.handleTitleChange}/>
            </div>
        )
    }
}

class TePost extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tePost: 'Text (optional)',
            bold: false,
            italic: false,
            spoiler: false,
            strikethrough: false,
            markdown: false,
            preview: false,
            selectionStart: null,
            selectionEnd: null
        };
        this.tePostDefault = 'Text (optional)';
        this.handlePostChange = this.handlePostChange.bind(this);
        this.clearDefault = this.clearDefault.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.toggleButton = this.toggleButton.bind(this);
        this.shortcutListener = this.shortcutListener.bind(this);
    }
    clearDefault(e) {
        if (e.target.value === this.tePostDefault) {
            this.setState({
                tePost: ''
            })
        }
    }
    handleBlur(e) {
        if (e.target.value === '') {
            this.setState({
                tePost: this.tePostDefault
            })
        }
    }
    handlePostChange(e) {
        let content = e.target.value;
        let el = document.getElementById('tePost');
        this.setState({
            tePost: content,
        });
        // Adjust Textarea Height
        // getActualHeight() is at bottom
        let actualHeight = getActualHeight(el);
        let preview = document.getElementById('tePreview');
        let previewHeight = getActualHeight(preview);
        let setHeight = Math.max(actualHeight, previewHeight);
        el.style.height = setHeight + 'px';
        preview.style.height = setHeight + 'px';
        this.renderPreview(content);
    }
    renderPreview(content) {
        let preview = document.getElementById('tePreview');
        let node;
        let textnode;
        while (preview.firstChild) {
            preview.removeChild(preview.firstChild);
        }
        content = JSON.stringify(content);
        content = content.slice(1, content.length - 1);
        content = content.split('\\n');
        content.map((i) => {
            node = document.createElement('p');
            textnode = document.createTextNode(i);
            node.appendChild(textnode);
            preview.appendChild(node);
        });
    }
    toggleButton(buttonName) {
        let toggleButton = () => {
            let el = document.getElementById('tePost');
            let start = el.selectionStart;
            let end = el.selectionEnd;
            let post = this.state.tePost.slice();
            let selection = post.slice(start, end);
            let markupLeading;
            let markupTrailing;
            let markupLength; // HALF
            el.focus();

            if (buttonName === 'bold') {
                markupLeading = '**';
                markupTrailing = '**';
            } else if (buttonName === 'italic') {
                markupLeading = '*';
                markupTrailing = '*';
            } else if (buttonName === 'strikethrough') {
                markupLeading = '~~';
                markupTrailing = '~~';
            } else if (buttonName === 'spoiler') {
                markupLeading = '>!';
                markupTrailing = '!<';
            }
            markupLength = markupLeading.length;
            const exactMatch = (selection.slice(0, markupLength) === markupLeading && selection.slice(selection.length - markupLength, selection.length) === markupTrailing);


            // CASE 0: BUTTON CLICKED WHEN POST EMPTY
            if (this.state.tePost === this.tePostDefault) {
                post = markupLeading + markupTrailing;
                this.setState({
                    [buttonName]: true,
                    tePost: post,
                    selectionStart: markupLength,
                    selectionEnd: markupLength,
                });
            } // CASE 1: TURN ON STYLE
            else if (start === end && !this.state[buttonName]) {
                post = post.slice(0, start) + markupLeading + markupTrailing + post.slice(start, post.length);
                this.setState({
                    [buttonName]: true,
                    tePost: post,
                    selectionStart: start + markupLength,
                    selectionEnd: start + markupLength,
                });
            } // CASE 2: TURN OFF STYLE
            else if (start === end && this.state[buttonName]) {
                const nothingTyped = (post.slice(start - markupLength, start) === markupLeading && post.slice(end, end + markupLength) === markupTrailing);
                //CASE 2.0 NOTHING TYPED
                if (nothingTyped) {
                    post = post.slice(0, start - markupLength) + post.slice(end + markupLength, post.length);
                    this.setState({
                        [buttonName]: false,
                        tePost: post,
                        selectionStart: start,
                        selectionEnd: start,
                    });
                } //CASE 2.1 TYPED SOMETHING
                else {
                    this.setState({
                        [buttonName]: false,
                        selectionStart: start + markupLength,
                        selectionEnd: start + markupLength,
                    });
                }
            }// CASE 3: CONVERT SELECTION INTO STYLE
            else if (start !== end && !this.state[buttonName] && !exactMatch) {
                post = post.slice(0, start) + markupLeading + selection + markupTrailing + post.slice(end, post.length);
                this.setState({
                    [buttonName]: false,
                    tePost: post,
                    selectionStart: start,
                    selectionEnd: end + markupLength * 2,
                });
            } // CASE 4: SELECTION UNSTYLE (EXACT MATCH **A-Z**)
            else if (start !== end && !this.state[buttonName] && exactMatch) {
                post = post.slice(0, start) + selection.slice(markupLength, selection.length - markupLength) + post.slice(end, post.length);
                this.setState({
                    [buttonName]: false,
                    tePost: post,
                    selectionStart: start,
                    selectionEnd: end - markupLength * 2,
                });
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
    shortcutListener(e) {
        let ctrl = (e.ctrlKey || e.metaKey);
        if (document.activeElement === document.getElementById('tePost')) {
            if (e.key === 'b' && ctrl) {
                e.preventDefault();
                (this.toggleButton('bold'))();
            }
            if (e.key === 'i' && ctrl) {
                e.preventDefault();
                (this.toggleButton('italic'))();
            }
            if (e.key === 'd' && ctrl) {
                e.preventDefault();
                (this.toggleButton('strikethrough'))();
            }
            if (e.key === 's' && ctrl) {
                e.preventDefault();
                (this.toggleButton('spoiler'))();
            }
        }
    }
    componentDidUpdate() {
        if (this.state.selectionStart || this.state.selectionEnd) {
            let el = document.getElementById('tePost');
            el.selectionStart = this.state.selectionStart;
            el.selectionEnd = this.state.selectionEnd;
            this.setState({
                selectionStart: null,
                selectionEnd: null
            })
        }
    }
    componentDidMount() {
        window.addEventListener('keydown', this.shortcutListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.shortcutListener);
    }
    render() {
        const handlers = {
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
            <div className='text-editor-editor-wrapper'>
                <div className='text-editor-editor-toolbox-wrapper'>
                    <div className='text-editor-editor-toolbox-left'>
                        <ItemGenerator Icon={FiBold} label='bold (Ctrl+B)' toggleButton={this.toggleButton('bold')} isSelected={this.state.bold}/>
                        <ItemGenerator Icon={FiItalic} label='italic (Ctrl+I)' toggleButton={this.toggleButton('italic')} isSelected={this.state.italic}/>
                        <ItemGenerator Icon={FiEdit3} label='strikethrough (Ctrl+D)' toggleButton={this.toggleButton('strikethrough')} isSelected={this.state.strikethrough}/>
                        <ItemGenerator Icon={FiAlertCircle} label='spoiler (Ctrl+S)' toggleButton={this.toggleButton('spoiler')} isSelected={this.state.spoiler}/>
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
                                      onChange={this.handlePostChange}
                                      id='tePost' name='post' value={this.state.tePost} {...handlers}/>
                    <div className={previewClassName} id='tePreview'>

                    </div>
                </div>
            </div>
        )
    }
}

class TextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className='text-editor-wrapper'>
                <form>

                    <TeTitle />
                    <TePost />

                    <div className='text-editor-button'>
                        <button style={{backgroundColor: this.props.themeColor[0]}}>Post</button>
                    </div>
                </form>
            </div>
        )
    }
}

// function for handleTitleChange & handlePostChange
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

export { TextEditor };
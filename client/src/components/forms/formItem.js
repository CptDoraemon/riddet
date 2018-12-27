import React from 'react';
import './form.css';

class FormItem extends React.Component {

    //It requires props: label, value, (onchange) handler, type

    constructor (props) {
        super(props);
        this.state = {
            hover: false,
            focus: false
        };
        this.toggleHover = this.toggleHover.bind(this);
        this.toggleFocus = this.toggleFocus.bind(this);
    }
    toggleHover() {
        this.setState({
            hover: !this.state.hover
        })
    }
    toggleFocus() {
        this.setState({
            focus: !this.state.focus
        })
    }
    render() {
        return (
            <div className='form-item-wrapper'>
                <span className={!this.state.hover && !this.state.focus && this.props.value === '' ? 'form-item-wrapper-label' : 'form-item-wrapper-label-small'}>{ this.props.label }</span>
                <input
                    onMouseOver={this.toggleHover}
                    onMouseLeave={this.toggleHover}
                    onFocus={this.toggleFocus}
                    onBlur={this.toggleFocus}
                    onChange={(e) => this.props.handler(e)}
                    value={this.props.value}
                    type={this.props.type || 'text'}
                    disabled={this.props.disabled || false}
                    style={this.props.style || null} />
            </div>
        )
    }
}

export { FormItem };
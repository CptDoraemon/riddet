
// let node;
    // let textnode;
    // let container  = document.createElement('div');
    // let array = [];
    // post = post.slice();
    //
    // post = JSON.stringify(post);
    // post = post.slice(1, post.length - 1);
    //
    // // [ character, isBold, isItalic, isStrikethrough, isSpoiler, paragraph# ]
    // // 1. Break into characters, set paraNum
    // post = post.split('\\n');
    // post.map((i) => {
    //     node = document.createElement('p');
    //     textnode = document.createTextNode(i);
    //     node.appendChild(textnode);
    //     container.appendChild(node);
    // });
    // let paraNum = 0;
    // post.map((i) => {
    //     let char = i.split('');
    //     char.map((j) => {
    //         array.push([j, false, false, false, false, paraNum]);
    //     });
    //     paraNum++;
    // });
    // 2. Find **


import React from 'react';

class PostParser extends React.Component {
    render () {
        let post = JSON.stringify(this.props.post);
        post = post.slice(1, post.length - 1);
        post = post.split('\\n');
        const posts = post.map((i) => <p> {i} </p>);
        return (
            <React.Fragment>
                { posts }
            </React.Fragment>
        )
    }
}

export { PostParser };


//node.className = 'postparser-spoiler';
//node.onclick = () => {node.className = 'postparser-spoiler-revealed'}


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
import './postparser.css';

class PostParser extends React.Component {
    render () {
        let postString = JSON.stringify(this.props.post);
        postString = !postString ? '' : postString;
        postString = postString.slice(1, postString.length - 1);

        let paragraphArray = postString.split('\\n');

        paragraphArray = processParagraph(paragraphArray, /\*\*/, '<b>', '</b>');
        paragraphArray = processParagraph(paragraphArray, /\*/, '<i>', '</i>');
        paragraphArray = processParagraph(paragraphArray, />!|!</, '<span class="postparser-spoiler" onClick="(()=>{this.className=\'postparser-spoiler-revealed\'})()">', '</span>');
        paragraphArray = processParagraph(paragraphArray, /~~/, '<span class="postparser-strikethrough">', '</span>');
        //
        paragraphArray = paragraphArray.map(p => {
            return '<p>' + p + '</p>'
        });


        const processedString = paragraphArray.join('');
        const innerHtml = {__html: processedString};


        return (
            <div dangerouslySetInnerHTML={innerHtml}>
            </div>
        );


        function processParagraph(array, dividerRegEx,tagStartString, tagCloseString) {
            return array.map(p => {
                let fragmentsArray = p.split(dividerRegEx);
                if (fragmentsArray.length === 1) {
                    return fragmentsArray[0];
                } else {
                    fragmentsArray = fragmentsArray.map((i, index) => {
                        if (index % 2 === 1) {
                            return tagStartString + i + tagCloseString;
                        } else {
                            return i
                        }
                    });
                    return fragmentsArray.join('');
                }
            });
        }
    }
}

export { PostParser };



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

        paragraphArray = processParagraph(paragraphArray, /\*\*/, 'postparser-bold');
        paragraphArray = processParagraph(paragraphArray, /\*/, 'postparser-italic');
        paragraphArray = processParagraph(paragraphArray, />!|!</, 'postparser-spoiler');
        paragraphArray = processParagraph(paragraphArray, /~~/, 'postparser-strikethrough');
        //
        const spoilerArray = document.getElementsByClassName('postparser-spoiler');
        for (let i=0; i<spoilerArray.length; i++) {
            const classNameOld = spoilerArray[i].className;
            spoilerArray[i].setAttribute("onclick", '(() => this.className="' + classNameOld + ' postparser-spoiler-revealed")()');
        }
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


        function processParagraph(array, dividerRegEx, classNameString) {
            return array.map(p => {
                let fragmentsArray = p.split(dividerRegEx);
                if (fragmentsArray.length === 1) {
                    // no match
                    return fragmentsArray[0];
                } else {
                    let isThereSpanTagNotClosed = true;
                    let spanTagNotClosed = '';
                    let spanTagNotClosedClassName = '';
                    // matched
                    fragmentsArray = fragmentsArray.map((i, index) => {
                        // reset
                        if (!isThereSpanTagNotClosed) {
                            spanTagNotClosed = '';
                            spanTagNotClosedClassName = '';
                        }
                        //
                        const spanBeginMatchedArray = i.match(/<span.+>/ig);
                        const spanCloseMatchedArray = i.match(/<\/span>/ig);
                        if (spanBeginMatchedArray !== null) {
                            if (spanCloseMatchedArray === null || spanBeginMatchedArray.length !== spanCloseMatchedArray.length) {
                                spanTagNotClosed = spanBeginMatchedArray[spanBeginMatchedArray.length - 1];
                                spanTagNotClosedClassName = spanTagNotClosed.match(/class="(.+)"/)[1];
                                console.log(spanTagNotClosed, spanTagNotClosedClassName)
                            }
                        }

                        if (index % 2 === 1) {
                            let beginTag = '';
                            if (spanTagNotClosed.length !== 0) {
                                // reset
                                isThereSpanTagNotClosed = false;
                                //
                                beginTag = '<span class="' + classNameString + ' ' + spanTagNotClosedClassName + '" ' + '>';
                                return '</span>' + beginTag + i + '</span>' + spanTagNotClosed;
                            } else {
                                beginTag = '<span class="' + classNameString + '">';
                                return beginTag + i + '</span>';
                            }
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


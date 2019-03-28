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
        // add onclick handler
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
                    // matched
                    //
                    let spanCheckOld = {
                        isHangingClosedHere: false,
                        spanTagNotClosedClassName: ''
                    };
                    let spanCheckNew = {
                        isHangingClosedHere: false,
                        spanTagNotClosedClassName: ''
                    };
                    fragmentsArray = fragmentsArray.map((i, index) => {
                        //
                        spanCheckNew = checkSpanInFragment(i);
                        //
                        if (index % 2 === 1) {
                            // this fragment needs to be decorated
                            let isOverlappedWithOtherSpan = false;
                            //
                            if (spanCheckNew.isHangingClosedHere) {
                                isOverlappedWithOtherSpan = true;

                                const closeTagPosition /* pos of '>' */ = i.match(/<\/span>/).index + 7;
                                i = '<span class="' + spanCheckOld.spanTagNotClosedClassName + ' ' + classNameString + '">' +
                                    i.slice(0, closeTagPosition) +
                                    '</span>' +
                                    '<span class="' + classNameString + '">' +
                                    i.slice(closeTagPosition);
                            }
                            if (spanCheckNew.spanTagNotClosedClassName.length > 0) {
                                isOverlappedWithOtherSpan = true;

                                let match, lastMatch;
                                const regex = /<span.+?>/g;
                                while ((match = regex.exec(i)) !== null){
                                    lastMatch = match
                                }
                                const beginTagPosition /* pos of '<' */ = lastMatch.index;
                                const beginTagEndPosition = beginTagPosition + lastMatch[0].length;
                                i = '<span class="' + classNameString + '">' + i.slice(0, beginTagPosition) + '</span>' +
                                    '<span class="' + classNameString + ' ' + spanCheckNew.spanTagNotClosedClassName + '">' + i.slice(beginTagEndPosition) + '</span>' +
                                    '<span class="' + spanCheckNew.spanTagNotClosedClassName + '">'
                            }
                            if (!isOverlappedWithOtherSpan) {
                                i = '<span class="' + classNameString + '">' + i + '</span>';
                            }
                        }
                        // prepare for next loop
                        spanCheckOld = passOnCheckSpan(spanCheckOld, spanCheckNew);
                        //
                        return i
                    });
                    return fragmentsArray.join('');
                }
            });
        }

        function checkSpanInFragment(string) {
            let isHangingClosedHere = false;
            let spanTagNotClosedClassName = '';
            //
            const spanMatchedArray = string.match(/<span.+?>|<\/span>/ig); /* +? lazy match */
            if (spanMatchedArray !== null) {
                if (spanMatchedArray[0][1] === '/') {
                    // preceding not closed is closed in this fragment
                    isHangingClosedHere = true;
                } else {
                    isHangingClosedHere = false;
                }
                if (spanMatchedArray[spanMatchedArray.length - 1][1] !== '/') {
                    // a span is not closed in this fragment
                    spanTagNotClosedClassName = spanMatchedArray[spanMatchedArray.length - 1].match(/class="(.+)"/)[1];
                }
            }
            //
            return {
                isHangingClosedHere: isHangingClosedHere,
                spanTagNotClosedClassName: spanTagNotClosedClassName
            }
        }

        function passOnCheckSpan(checkSpanOld, checkSpanNew) {
            let isHangingClosedHere = false;
            let spanTagNotClosedClassName = '';
            // hanging closed
            if (checkSpanOld.spanTagNotClosedClassName.length > 0 && checkSpanNew.isHangingClosedHere) {
                spanTagNotClosedClassName = '';
            }
            // hanging not closed
            if (checkSpanOld.spanTagNotClosedClassName.length > 0 && !checkSpanNew.isHangingClosedHere) {
                spanTagNotClosedClassName = checkSpanOld.spanTagNotClosedClassName;
            }
            // new hanging
            if (checkSpanNew.spanTagNotClosedClassName.length > 0) {
                spanTagNotClosedClassName = checkSpanNew.spanTagNotClosedClassName;
            }
            //
            return {
                isHangingClosedHere: isHangingClosedHere,
                spanTagNotClosedClassName: spanTagNotClosedClassName
            }
        }
    }
}

export { PostParser };


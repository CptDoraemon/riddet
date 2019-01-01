module.exports = function(post) {
    let node;
    let textnode;
    let container  = document.createElement('div');
    let array = [];
    let tempArray = [];
    post = post.slice();

    post = JSON.stringify(post);
    console.log(post);
    post = post.slice(1, post.length - 1);

    // [ character, isBold, isItalic, isStrikethrough, isSpoiler, paragraph# ]
    // 1. Break into characters, set paraNum
    post = post.split('\\n');
    post.map((i) => {
        node = document.createElement('p');
        textnode = document.createTextNode(i);
        node.appendChild(textnode);
        container.appendChild(node);
    });
    // let paraNum = 0;
    // post.map((i) => {
    //     let char = i.split('');
    //     char.map((j) => {
    //         array.push([j, false, false, false, false, paraNum]);
    //     });
    //     paraNum++;
    // });
    // 2. Find **


    console.log(array);

    return container;
};


//node.className = 'postparser-spoiler';
//node.onclick = () => {node.className = 'postparser-spoiler-revealed'}

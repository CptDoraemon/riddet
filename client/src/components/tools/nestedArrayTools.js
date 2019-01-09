// it returns the found array item
function searchByFlattenIndex(array, indexLookingFor) {
    let flattenIndex = -1;
    let found;
    const actualIndex = indexLookingFor - 1;

    function loop(array, indexLookingFor) {
        for (let i=0; i<array.length; i++) {
            if (array[i] instanceof Array) {
                loop (array[i], indexLookingFor)
            } else {
                if (flattenIndex === actualIndex) {
                    found = array[i];
                }
                flattenIndex++;
            }
        }
    }
    loop(array, indexLookingFor);

    return found;
}

// it returns a copy of modified array
function replaceByFlattenIndex(array, indexLookingFor, replace) {
    let flattenIndex = -1;
    array = array.slice();
    const actualIndex = indexLookingFor - 1;

    function loop(array, indexLookingFor, replace) {
        for (let i=0; i<array.length; i++) {
            if (array[i] instanceof Array) {
                loop (array[i], indexLookingFor, replace)
            } else {
                if (flattenIndex === actualIndex) {
                    array[i] = replace;
                }
                flattenIndex++;
            }
        }
    }
    loop(array, indexLookingFor, replace);


    return array;
}

function flattenArray(array) {
    let flatten = [];

    function loop(array) {
        array.map((i) => {
            i instanceof Array ? loop (i) : flatten.push(i)
        })
    }
    loop(array);
    return flatten;
}

module.exports = {
    searchByFlattenIndex: searchByFlattenIndex,
    replaceByFlattenIndex: replaceByFlattenIndex,
    flattenArray: flattenArray
};
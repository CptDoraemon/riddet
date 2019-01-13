module.exports = {
    calcDateDiffMessage: calcDateDiffMessage,
    toNormalDate: toNormalDate
};

function calcDateDiffMessage(inputDate) {
    inputDate = new Date(inputDate);
    const nowDate = new Date();
    let dateDiff = Math.floor((nowDate - inputDate) / (1000 * 60)); //minute
    let dateDiffMessage;
    dateDiffMessage = dateDiff === 1 ? ' minute ago' : ' minutes ago';
    dateDiffMessage = dateDiff + dateDiffMessage;
    if (dateDiff >= 60) {
        dateDiff = Math.floor(dateDiff / 60); //hour
        dateDiffMessage = dateDiff === 1 ? ' hour ago' : ' hours ago';
        dateDiffMessage = dateDiff + dateDiffMessage;
        if (dateDiff >= 24) {
            dateDiff = Math.floor(dateDiff / 24); //day
            dateDiffMessage = dateDiff === 1 ? ' day ago' : ' days ago';
            dateDiffMessage = dateDiff + dateDiffMessage;
        }
    }
    return dateDiffMessage;
}

function toNormalDate(string) {
    let obj = new Date(string);
    return obj.toLocaleString('en-US', { hour12: false });
}

module.exports = myScrollTo;

function myScrollTo(targetY) {
    const scrolled = window.scrollY;
    const diff = Math.abs(targetY - scrolled);
    const time = 0.3;
    let speed = diff/(60*time);
    speed = scrolled >= targetY ? -speed : speed;
    let step = scrolled + speed;

    function scrollLoop() {
        if (scrolled > targetY) {
            // scroll up
            if (step > targetY) {
                window.scrollTo(0, step);
                step += speed;
                requestAnimationFrame(scrollLoop);
            } else {
                window.scrollTo(0, targetY);
            }
        } else if (scrolled < targetY) {
            // scroll down
            if (step < targetY) {
                window.scrollTo(0, step);
                step += speed;
                requestAnimationFrame(scrollLoop);
            } else {
                window.scrollTo(0, targetY);
            }
        }
    }
    requestAnimationFrame(scrollLoop);
}
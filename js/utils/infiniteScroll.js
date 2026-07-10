export function createInfiniteScroll({
    anchor,
    onLoadMore,
    rootMargin = "240px",
}) {
    const sentinel = document.createElement("div");
    sentinel.className = "infinite-scroll-sentinel";
    anchor.after(sentinel);

    let isStarted = false;

    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;

        onLoadMore();
    }, {
        rootMargin,
    });

    function start() {
        if (isStarted) return;

        isStarted = true;
        observer.observe(sentinel);
    }

    function stop() {
        isStarted = false;
        observer.disconnect();
    }

    return {
        start,
        stop,
        sentinel,
    };
}
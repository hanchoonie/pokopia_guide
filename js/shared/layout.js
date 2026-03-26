function mountLayout(activePage) {
    document.body.insertAdjacentHTML('afterbegin', renderHeader(activePage));
}
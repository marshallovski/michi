function _clearElemTree(parentElem) {
    while ($(parentElem).firstChild) $(parentElem).firstChild.remove();
}
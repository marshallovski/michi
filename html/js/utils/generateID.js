function generateID() {
    const array = new Uint32Array(10);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < array.length; i++)
        return array[i];
}
function parsedData(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error(e);
        return { msg: e.message };
    }
}

exports.parsedData = parsedData;

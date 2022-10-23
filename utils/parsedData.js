function parsedData(json) {
    try {
        return JSON.parse(json);
    } catch {
        //ignore
    }
}

exports.parsedData = parsedData;

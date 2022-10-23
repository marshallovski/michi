function formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 B';
    let k = 1000,
        dm = decimals + 1 || 3,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

exports.formatBytes = formatBytes;
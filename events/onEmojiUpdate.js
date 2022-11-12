exports.onEmojiUpdate = async (ws, data, emojiList, parsedData) => {
    if (ws.bufferedAmount === 0)
        ws.send(JSON.stringify({
            author: Buffer.from(parsedData(data).author, 'base64').toString(),
            emoji: emojiList,
            type: 'emojiupdate'
        }));
}
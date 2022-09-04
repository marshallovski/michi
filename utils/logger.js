exports.log = async (text) => {
   console.log(`[${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}] ${text}`);
}
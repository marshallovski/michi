function connectedUsers(userList) {
    let users = '';

    Object.entries(userList)
        .forEach(u => users += u[1]);

    return users;
}

exports.connectedUsers = connectedUsers;

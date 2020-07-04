const bcrypt = require('bcrypt')

exports.hash = async function (rawPassword) {
    const hash = await bcrypt.hashSync(rawPassword, 10)
    return hash
}

exports.compare = async function (rawPassword, hash) {
    return await bcrypt.compare(rawPassword, hash)
}

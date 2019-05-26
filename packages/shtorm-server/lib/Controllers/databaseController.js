import fs from 'fs'
import path from 'path'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import shortid from 'shortid'

const dbFolder = path.join(__dirname, '../../db')
class DatabaseController {
  constructor () {
    if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder)
    this.adapter = new FileSync('db/shtorm-db.json')
    this.db = low(this.adapter)
    this.db.defaults({
      configs: [],
      presets: [],
      users: [
        {
          id: shortid.generate(),
          name: 'Admin',
          password: 'password',
          isAdmin: true,
          isOriginal: true,
          lastLoggedIn: null
        }
      ]
    }).write()
  }

  getDatabase = (dbName) => {
    return this.db.get(dbName)
  }
}

const databaseController = new DatabaseController()
export default databaseController

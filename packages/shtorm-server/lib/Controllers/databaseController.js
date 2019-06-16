import path from 'path'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import shortid from 'shortid'
import { hashSync, genSaltSync } from 'bcryptjs'
import configChecker from '../configChecker'

class DatabaseController {
  constructor (dbDir) {
    this.adapter = new FileSync(path.join(dbDir, 'shtorm-db.json'))
    this.db = low(this.adapter)
    this.db.defaults({
      configs: [],
      projects: [],
      users: [
        {
          id: shortid.generate(),
          username: 'Admin',
          password: hashSync('password', genSaltSync(10)),
          isAdmin: true,
          isOriginal: true,
          lastSeen: null
        }
      ]
    }).write()
  }

  getDatabase = (dbName) => {
    return this.db.get(dbName)
  }
}

const { databaseDirectory } = configChecker(false, process)
const databaseController = new DatabaseController(databaseDirectory)
export default databaseController

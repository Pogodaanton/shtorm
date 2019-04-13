import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

class DatabaseController {
  constructor () {
    this.adapter = new FileSync('db/nodemw-db.json')
    this.db = low(this.adapter)
    this.db.defaults({ configs: [], presets: [] }).write()
  }

  getDatabase = (dbName) => {
    return this.db.get(dbName)
  }
}

const databaseController = new DatabaseController()
export default databaseController

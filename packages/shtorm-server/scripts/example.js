/* globals updateClient, bot, clientOptions */
const scriptOptions = [
  { type: 'text', name: 'Summary', value: 'Infobox --> Infobox_Weapons' },
  { type: 'number', name: 'From page in category', value: 0 },
  { type: 'number', name: 'Amount of pages to go through', value: 20 }
]

class ExampleClass {
  constructor (bot, options) {
    this.bot = bot
    this.options = options
  }
  getOptions = () => {
    console.log(this.options)
  }
}

const start = () => new Promise((resolve, reject) => {
  const ex = new ExampleClass(bot, clientOptions)

  updateClient({ progress: 10, progressMessage: 'Starting up bot' })
  ex.getOptions()

  updateClient({
    progress: 80,
    progressMessage: 'Getting approval...',
    dialog: {
      type: 'code',
      code: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      msg: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    }
  }).then((data) => {
    if (typeof data === 'string' && data) console.log('You accepted the changes.', data)
    else console.log('You rejected the changes.')
    resolve()
  })
})

exports = {
  default: start,
  scriptOptions
}

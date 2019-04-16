export const scriptOptions = [
  { type: 'text', name: 'Summary', value: 'Infobox --> Infobox_Weapons' },
  { type: 'number', name: 'From page in category', value: 0 },
  { type: 'number', name: 'Amount of pages to go through', value: 20 }
]

class ExampleClass {
  constructor (bot, options) {
    this.bot = bot
    this.options = options
  }

  getBot = () => {
    console.log(this.bot)
  }

  getOptions = () => {
    console.log(this.options)
  }
}

export default (bot, options) => new Promise((resolve, reject) => {
  const ex = new ExampleClass(bot, options)
  ex.getBot()
  ex.getOptions()
  resolve()
})

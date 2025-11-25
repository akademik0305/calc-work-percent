import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters';
import { configDotenv } from 'dotenv';
import db from './db.js';
import dailyController from './daily/daily.controller.js';
configDotenv();

const bot = new Telegraf(process.env.BOT_TOKEN)

// bot.start((ctx) => ctx.reply('Welcome'))
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.on("message", async (ctx) => {
  console.log(ctx.message);
  const data = await dailyController.saveDaily(ctx.message)
  console.log(data);

  ctx.reply(data, { reply_parameters: { message_id: ctx.message.message_id } })
})


// launch bot;
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
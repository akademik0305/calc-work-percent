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

bot.start((ctx) => {
  ctx.reply("Assalomu alaykum bu hisobchi bot, kunlik ishlab chiqarishni yuborsangiz hisoblab saqlab ketaman")
})


bot.on("message", async (ctx) => {
  // console.log(ctx.message);
  if (ctx.message.text.includes('Liniya')) {
    const result = await dailyController.saveDaily(ctx.message)
    ctx.reply(`✅ ${result.today_percent}% ga bajarild`, { reply_parameters: { message_id: ctx.message.message_id } })
    if (result.total_percent) {
      ctx.reply(`🏗 Zavod umumiy ${result.total_percent}% quvvatda ishladi`)
    }
  } else {
    ctx.reply('Bu hisobchi bot')
  }
})


// launch bot;
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
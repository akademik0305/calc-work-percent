// index.js
import { Telegraf } from 'telegraf';
import { configDotenv } from 'dotenv';
import pool from './db.js';
import dailyController from './daily/daily.controller.js';

configDotenv();

// BOT TOKEN tekshiruvi
if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi. Iltimos .env faylini tekshiring");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Global error handler
bot.catch((err, ctx) => {
  console.error("Telegram bot xatosi:", err);
});

// Start komandasi
bot.start((ctx) => {
  ctx.reply(`Assalomu alaykum!\nBu hisobchi bot.\nKunlik ishlab chiqarishni yuborsangiz, hisoblab saqlab ketaman.`);
});

// Statistika komandasi
bot.command(["bugungi", "haftalik", "oylik", "yillik"], async (ctx) => {
  try {
    const { message } = await dailyController.getStatistics(ctx.message);
    await ctx.replyWithHTML(message);
  } catch (err) {
    console.error(err);
    await ctx.reply("Xatolik yuz berdi, keyinroq urinib ko‘ring");
  }
});

// Daily message handler
bot.on("message", async (ctx) => {
  try {
    const text = ctx.message?.text?.toLowerCase() || "";
    if (text.includes('liniya')) {
      const { messages } = await dailyController.saveDaily(ctx.message);
      for (const msg of messages) {
        await ctx.reply(msg, { reply_to_message_id: ctx.message.message_id });
      }
    } else {
      // ixtiyoriy: faqat kerak bo‘lsa javob berish
      // ctx.reply('Bu hisobchi bot');
    }
  } catch (err) {
    console.error("Bot xatosi:", err);
    ctx.reply("Xatolik yuz berdi, keyinroq urinib ko‘ring");
  }
});

// Launch bot
bot.launch().then(() => {
  console.log("Bot ishga tushdi ✅");
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Bot to‘xtatilmoqda...");
  await pool.end();
  bot.stop('SIGTERM');
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
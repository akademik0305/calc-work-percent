// index.js
import { Telegraf } from 'telegraf';
import { configDotenv } from 'dotenv';
import pool from './db.js';
import dailyController from './daily/daily.controller.js';
import express from 'express';
import autofetch from './utils.js';

configDotenv();
autofetch()

// BOT TOKEN tekshiruvi
if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi. Iltimos .env faylini tekshiring");
  process.exit(1);
}

const app = express();
app.use(express.json());
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

const token = process.env.BOT_TOKEN;
const webhookDomain = process.env.HOSTNAME;
const port = process.env.PORT || 3000;
const webhookPath = `/webhook/${token}`;

// Launch bot
bot.launch(
  {
    webhook: {
      domain: webhookDomain,
      port: port,
      webhookPath: webhookPath
    }
  }
).then(() => {
  console.log("Bot ishga tushdi ✅");
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Bot to‘xtatilmoqda...");
  await pool.end();
  bot.stop('SIGTERM');
  process.exit(0);
};

app.get("/", (req, res) => res.send("OK"));


app.listen(webhookDomain || port, () => {
  console.log("Server running on port: ", port);
})


process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
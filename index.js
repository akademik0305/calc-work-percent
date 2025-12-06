// index.js
import express from "express";
import { Telegraf } from "telegraf";
import { configDotenv } from "dotenv";
import pool from "./db.js";
import dailyController from "./daily/daily.controller.js";

configDotenv();

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN topilmadi");
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

// === Webhook URL ===
const WEBHOOK_PATH = `/webhook/${process.env.BOT_TOKEN}`;
const WEBHOOK_URL = `https://${process.env.HOSTNAME}${WEBHOOK_PATH}`;
console.log(WEBHOOK_URL);


// === BOT HANDLERS ===
bot.catch((err, ctx) => console.error("Bot xatosi:", err));

bot.start((ctx) =>
  ctx.reply(
    `Assalomu alaykum!\nBu hisobchi bot.\nKunlik ishlab chiqarishni yuborsangiz — hisoblab saqlab ketaman.`
  )
);

bot.command(["bugungi", "haftalik", "oylik", "yillik"], async (ctx) => {
  try {
    const { message } = await dailyController.getStatistics(ctx.message);
    await ctx.replyWithHTML(message);
  } catch (err) {
    ctx.reply("Xatolik yuz berdi, keyinroq urunib ko‘ring.");
  }
});

bot.on("message", async (ctx) => {
  try {
    const txt = ctx.message.text?.toLowerCase() || "";
    if (!txt.includes("liniya")) return;

    const { messages } = await dailyController.saveDaily(ctx.message);
    for (const msg of messages) {
      await ctx.reply(msg, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (err) {
    console.log(err);
    ctx.reply("Xatolik yuz berdi, keyinroq urinib ko‘ring.");
  }
});

// === WEBHOOK SETUP ===
bot.telegram
  .setWebhook(WEBHOOK_URL)
  .then(() => console.log("✅ Webhook o‘rnatildi:", WEBHOOK_URL))
  .catch((e) => console.error("❌ Webhook o‘rnatilmadi:", e));

// === Express route to receive updates ===
app.use(WEBHOOK_PATH, (req, res) => {
  bot
    .handleUpdate(req.body)
    .then(() => res.sendStatus(200))
    .catch((e) => {
      console.error("Webhook handle error:", e);
      res.sendStatus(500);
    });
});

// === Health check ===
app.get("/", (req, res) =>
  res.status(200).send("OK - Bot is running ✔️")
);

// === Graceful shutdown ===
const shutdown = async () => {
  console.log("⛔ To‘xtatilmoqda...");
  try {
    await pool.end();
    bot.stop("SIGTERM");
  } finally {
    process.exit(0);
  }
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server port ${process.env.PORT} da ishlayapti`)
);

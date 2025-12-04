import DailyService from './daily.service.js';

class DailyController {
  async saveDaily(message) {
    const text = message.text;

    const getFundaments = (text) => {
      const lines = text.split('\n')
      let total = 0

      for (const line of lines) {
        // F bilan boshlansa
        if (/^Ф/i.test(line)) {
          const match = line.match(/(\d+)\s+dona/i)
          if (match) {
            total += Number(match[1])
          }
        }
      }

      return total
    }

    const getValue = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };


    const workshop = getValue(/Liniya:\s*([0-9]+)/i);
    const plates = getValue(/Jami\s+([0-9]+)\s*dona/i);
    const molds = getValue(/(\d+)\s*qolip/i);

    const is_f_modls = text.includes("Ф")
    let f_molds = 0
    if (is_f_modls) {
      f_molds = getFundaments(text)
    }

    const result = await DailyService.saveDaily(workshop, plates, molds, f_molds);

    // Agar error bo‘lsa xabarni tayyorlaymiz
    if (result.error) {
      return { messages: [result.error], data: null };
    }

    const messages = [
      `✅ ${result.today_percent}% ga bajarildi`
    ];

    if (result.total_percent) {
      messages.push(`🏗 Zavod umumiy ${result.total_percent}% quvvatda ishladi`);
    }

    return { messages, data: result };
  }

  async getStatistics(message) {
    const type = message.text.split(" ")[0].replace("/", "");
    const workshop = message.text.split(" ")[1] || 0;

    // get time interval
    let interval = '1 day';
    let interval_name = 'Bugun'
    switch (type) {
      case "haftalik": {
        interval = '1 week';
        interval_name = "bir hafta davomida"
      } break;
      case "oylik": {
        interval = '1 month'
        interval_name = "bir oy davomida"
      } break;
      case "yillik": {
        interval = '1 year'
        interval_name = "bir yil davomid"
      } break;
    }

    const result = await DailyService.getStatistics(interval, workshop);

    if (result.error) {
      return { message: result.error, data: null };
    }

    // get workshop name
    let workshop_name = "🏗 Zavod"

    if (result.workshop_id > 0) {
      workshop_name = `${result.workshop_id}-liniya`
    }

    const messageText = `${workshop_name} ${interval_name} <strong>${result.total_percent}%</strong> quvvatda ishladi`;
    return { message: messageText, data: result };
  }
}

export default new DailyController();

import DailyService from './daily.service.js'



class dailyController {
  async saveDaily(message) {
    const text = message.text

    const getValue = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };

    const workshop = getValue(/Liniya:\s*([0-9]+)/i)
    const plates = getValue(/Jami:\s*([0-9]+)/i);
    const molds = getValue(/Jami qolip:\s*([0-9]+)/i);

    const daily = await DailyService.saveDaily(workshop, plates, molds);
    console.log(daily);
    return daily
  }
}

export default new dailyController();
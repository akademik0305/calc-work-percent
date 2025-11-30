import DailyService from './daily.service.js'



class dailyController {
  async saveDaily(message) {
    const text = message.text

    const getValue = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };

    const workshop = getValue(/Liniya:\s*([0-9]+)/i)
    const plates = getValue(/Jami\s+([0-9]+)\s*dona/i);
    const molds = getValue(/(\d+)\s*qolip/i);

    const result = await DailyService.saveDaily(workshop, plates, molds);
    return result
  }

  async getStatistics(message){
    console.log(message);
    
    const type = message.text.split(" ")[0]
    const workshop = message.text.split(" ")[0]

    const result = await DailyService.getStatistics(type, workshop)

    return result
  }
}

export default new dailyController();
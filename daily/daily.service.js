import db from '../db.js'
class dailyService {
  async saveDaily(workshop, plates, molds) {
    const workshop_data = await db.query('SELECT * FROM workshop WHERE number=$1', [workshop])
    let workshop_id = 0
    if (workshop_data.rows.length) {
      workshop_id = workshop_data.rows[0].id
    }
    // console.log(workshop_id.rows[0]);

    if (!workshop_id) {
      return 'Liniya topilmadi'
    }

    const daily = await db.query('INSERT INTO daily(workshop_id, molds, plates) VALUES($1, $2, $3) RETURNING *', [workshop_id, molds, plates])

    const workshop_molds = workshop_data.rows[0].molds
    const answer = molds / workshop_molds * 100

    // const newDaily = db.query('INSERT INTO')
    return `✅ ${answer.toFixed(1)}% ga bajarildi`
  }
}

export default new dailyService()
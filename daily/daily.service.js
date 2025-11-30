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

    // calc today's work percentage
    const workshop_molds = Number(workshop_data.rows[0].molds)
    const today_percent = Math.round(molds / workshop_molds * 100)

    let newDaily

    // check is exist daily
    const dailyItem = await db.query("SELECT * FROM daily WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '1 day' AND workshop_id = $1", [workshop_id])

    if (dailyItem.rows.length) {
      newDaily = await db.query("UPDATE daily SET molds=$1, plates=$2, today_percent=$3 WHERE id=$4", [molds, plates, today_percent, dailyItem.rows[0].id])
    } else {
      newDaily = await db.query('INSERT INTO daily(workshop_id, molds, plates, today_percent) VALUES($1, $2, $3, $4) RETURNING *', [workshop_id, molds, plates, today_percent])
    }

    // get all workshops and dailys
    const workshops = await db.query("SELECT * FROM workshop")
    const dailys = await db.query("SELECT * FROM daily WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '1 day'");


    // calc total percent
    let total_percent = 0
    if (dailys.rows.length === workshops.rows.length) {
      // finished today daily

      dailys.rows.forEach((daily) => {
        total_percent += daily.today_percent
      })

      total_percent = Math.round(total_percent / 4)
    }


    // const newDaily = db.query('INSERT INTO')
    return { today_percent, total_percent }
    // return `✅ ${today_percent.toFixed(1)}% ga bajarildi`
  }


  async getStatistics(type, workshop) {
    console.log(type, workshop);
    
  }
}

export default new dailyService()
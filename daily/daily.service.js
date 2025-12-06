import db from '../db.js';

class DailyService {

  async saveDaily(workshop, plates, molds, fundaments = 0, bloks = 0) {
    // 1. Workshop topish
    const workshopData = await db.query('SELECT * FROM workshop WHERE number=$1', [workshop]);
    if (!workshopData.rows.length) return { error: 'Liniya topilmadi' };

    const workshop_id = workshopData.rows[0].id;
    const workshop_molds = Number(workshopData.rows[0].molds);

    // 2. Today percent
    let today_percent = Math.round((molds / workshop_molds) * 100);
    
    // agar fundament bo'lsa
    if (fundaments) {
      today_percent += Math.round(fundaments * 20)
    }

    // agar blok bo'lsa
    if(bloks){
      today_percent += Math.round((50 * bloks) / 12)
    }

    // 3. Daily record check & insert/update
    const dailyItem = await db.query("SELECT * FROM daily WHERE date = CURRENT_DATE AND workshop_id = $1", [workshop_id]);

    let newDaily;
    if (dailyItem.rows.length) {
      newDaily = await db.query(
        "UPDATE daily SET molds=$1, plates=$2, today_percent=$3 WHERE id=$4 RETURNING *",
        [molds, plates, today_percent, dailyItem.rows[0].id]
      );
    } else {
      newDaily = await db.query(
        'INSERT INTO daily(workshop_id, molds, plates, today_percent) VALUES($1,$2,$3,$4) RETURNING *',
        [workshop_id, molds, plates, today_percent]
      );
    }

    // 4. Total percent hisoblash
    const workshops = await db.query("SELECT * FROM workshop");
    const dailys = await db.query("SELECT * FROM daily WHERE date = CURRENT_DATE AND workshop_id != 0");

    let total_percent = 0;
    let total_molds = 0;
    if (dailys.rows.length >= workshops.rows.length - 1) {
      dailys.rows.forEach(daily => {
        total_percent += daily.today_percent;
        total_molds += daily.molds;
      });
      total_percent = Math.round(total_percent / (workshops.rowCount - 1));


      // Total daily insert/update
      const totalDaily = await db.query("SELECT * FROM daily WHERE date = CURRENT_DATE AND workshop_id = 0");
      if (totalDaily.rows.length) {
        await db.query(
          "UPDATE daily SET molds=$1, today_percent=$2 WHERE id=$3",
          [total_molds, total_percent, totalDaily.rows[0].id]
        );
      } else {
        await db.query(
          "INSERT INTO daily(workshop_id, molds, today_percent) VALUES($1,$2,$3)",
          [0, total_molds, total_percent]
        );
      }
    }

    return { today_percent, total_percent };
  }

  async getStatistics(interval, workshop) {
    // 1. Workshop tekshirish
    const workshopData = await db.query("SELECT * FROM workshop WHERE id=$1", [workshop]);
    if (!workshopData.rows.length) return { error: 'Workshop topilmadi' };

    const workshop_id = workshopData.rows[0].id;

    // 2. Daily records fetch
    const dailys = await db.query(
      "SELECT * FROM daily WHERE workshop_id=$1 AND date >= CURRENT_DATE - $2::interval",
      [workshop_id, interval]
    );

    // 3. Total percent hisoblash
    let total_percent = 0;
    if (dailys.rows.length) {
      total_percent = Math.round(dailys.rows.reduce((sum, d) => sum + d.today_percent, 0) / dailys.rows.length);
    }

    return { workshop_id, total_percent };
  }
}

export default new DailyService();

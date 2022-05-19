import { AgeClass } from './schemas/AgeClass';
import { Athlete } from './schemas/Athlete';
import { Category } from './schemas/Category';
import { Competition } from './schemas/Competition';
import { Match } from './schemas/Match';
import { Tournament } from './schemas/Tournament';
import { User } from './schemas/User';

async function main() {
  try {
    const competition = await Competition.insertMany([
      {
        username: 'admin',
        password: 'password',
        name: 'Gara Lavis'
      }
    ]);
    const age_class = await AgeClass.insertMany([
      {
        max_age: 15,
        competition: competition[0]._id,
        name: 'Esordienti B',
        closed: false,
        params: {
          fight_time: 120,
          supplemental_fight_time: 120,
          ippon_to_win: 1,
          wazaari_to_win: 2,
          ippon_timer: 20,
          wazaari_timer: 10,
        }
      },
      {
        max_age: 18,
        competition: competition[0]._id,
        name: 'Cadetti',
        closed: false,
        params: {
          fight_time: 180,
          supplemental_fight_time: 180,
          ippon_to_win: 1,
          wazaari_to_win: 2,
          ippon_timer: 20,
          wazaari_timer: 10,
        }
      },
      {
        max_age: 21,
        competition: competition[0]._id,
        name: 'Juniores',
        closed: false,
        params: {
          fight_time: 240,
          supplemental_fight_time: Infinity,
          ippon_to_win: 1,
          wazaari_to_win: 2,
          ippon_timer: 20,
          wazaari_timer: 10,
        }
      }
    ]);
    const category = await Category.insertMany([
      {
        age_class: age_class[0]._id,
        max_weight: 60,
        gender: 'M',
      },
      {
        age_class: age_class[0]._id,
        max_weight: 66,
        gender: 'M',
      },
      {
        age_class: age_class[1]._id,
        max_weight: 60,
        gender: 'M',
      },
      {
        age_class: age_class[1]._id,
        max_weight: 66,
        gender: 'M',
      },
      {
        age_class: age_class[2]._id,
        max_weight: 60,
        gender: 'M',
      },
      {
        age_class: age_class[2]._id,
        max_weight: 66,
        gender: 'M',
      },
    ])
  } catch (e) {
    console.log(e.message);
  }
}

main();

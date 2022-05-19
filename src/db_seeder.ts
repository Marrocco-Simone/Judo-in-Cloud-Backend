import mongoose, { Types } from 'mongoose';
import bcrypt = require('bcrypt');
import 'dotenv/config';
import { AgeClass, AgeClassInterface } from './schemas/AgeClass';
import { Athlete, AthleteInterface } from './schemas/Athlete';
import { Category, CategoryInterface } from './schemas/Category';
import { Competition, CompetitionInterface } from './schemas/Competition';
/* import { Match, MatchInterface } from './schemas/Match'; */
/* import { Tournament, TournamentInterface } from './schemas/Tournament'; */
import { User, UserInterface } from './schemas/User';

const random = (max: number, min = 0) => (Math.random() % (max - min)) + min;

function getIds(obj: { _id: Types.ObjectId }[]) {
  const ids_array: Types.ObjectId[] = [];
  for (const elem of obj) ids_array.push(elem._id);
  return ids_array;
}

function getCompetitions() {
  const competition_array: CompetitionInterface[] = [];
  competition_array.push({
    name: 'Gara Lavis',
  });
  return competition_array;
}

async function getUser(competition_ids: Types.ObjectId[]) {
  const user_array: UserInterface[] = [];
  user_array.push({
    username: process.env.SYSADMIN_USERNAME,
    password: await bcrypt.hash(process.env.SYSADMIN_PASSWORD, 10),
    competition: competition_ids[0],
  });
  return user_array;
}

function getAgeClasses(competition_ids: Types.ObjectId[]) {
  const age_class_array: AgeClassInterface[] = [];
  age_class_array.push(
    {
      max_age: 15,
      competition: competition_ids[0],
      name: 'Esordienti B',
      closed: false,
      params: {
        match_time: 120,
        supplemental_match_time: 120,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    },
    {
      max_age: 18,
      competition: competition_ids[0]._id,
      name: 'Cadetti',
      closed: false,
      params: {
        match_time: 180,
        supplemental_match_time: 180,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    },
    {
      max_age: 21,
      competition: competition_ids[0]._id,
      name: 'Juniores',
      closed: false,
      params: {
        match_time: 240,
        supplemental_match_time: Infinity,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    }
  );
  return age_class_array;
}

function getCategories(age_class_ids: Types.ObjectId[]) {
  const categories_array: CategoryInterface[] = [];
  for (const age_class of age_class_ids) {
    categories_array.push(
      {
        age_class,
        max_weight: 60,
        gender: 'M',
      },
      {
        age_class,
        max_weight: 66,
        gender: 'M',
      },
      {
        age_class,
        max_weight: 52,
        gender: 'F',
      },
      {
        age_class,
        max_weight: 57,
        gender: 'F',
      }
    );
  }
  return categories_array;
}

function getAthetes(
  competition_ids: Types.ObjectId[],
  category: (mongoose.Document<unknown, any, CategoryInterface> &
    CategoryInterface & {
      _id: Types.ObjectId;
    })[]
) {
  const surnames = [
    'Rossi',
    'Ferrari',
    'Russo',
    'Bianchi',
    'Romano',
    'Gallo',
    'Costa',
    'Fontana',
    'Conti',
    'Esposito',
    'Ricci',
    'Bruno',
    'De Luca',
    'Moretti',
    'Marino',
    'Greco',
    'Barbieri',
    'Lombardi',
    'Giordano',
    'Cassano',
    'Colombo',
    'Mancini',
    'Longo',
    'Leone',
    'Martinelli',
    'Marchetti',
    'Martini',
    'Galli',
    'Gatti',
    'Mariani',
    'Ferrara',
    'Santoro',
    'Marini',
    'Bianco',
    'Conte',
    'Serra',
    'Farina',
    'Gentile',
    'Caruso',
    'Morelli',
    'Ferri',
    'Testa',
    'Ferraro',
    'Pellegrini',
    'Grassi',
    'Rossetti',
    'Bernardi',
    'Mazza',
    'Rizzi',
    'Natale',
  ];
  const male_names = [
    'Francesco',
    'Alessandro',
    'Leonardo',
    'Lorenzo',
    'Mattia',
    'Andrea',
    'Gabriele',
    'Matteo',
    'Tommaso',
    'Riccardo',
    'Edoardo',
    'Giuseppe',
    'Davide',
    'Antonio',
    'Federico',
    'Diego',
    'Giovanni',
    'Christian',
    'Nicola',
    'Samuele',
    'Pietro',
    'Marco',
    'Luca',
    'Filippo',
    'Simone',
    'Alessio',
    'Gabriel',
    'Michele',
    'Emanuele',
    'Jacopo',
    'Salvatore',
    'Giulio',
    'Cristian',
    'Daniele',
    'Vincenzo',
    'Giacomo',
    'Gioele',
    'Manuel',
    'Elia',
    'Thomas',
    'Samuel',
    'Giorgio',
    'Daniel',
    'Enea',
    'Stefano',
    'Luigi',
    'Domenico',
    'Angelo',
    'Kevin',
    'Ciro',
  ];
  const female_names = [
    'Sofia',
    'Aurora',
    'Giulia',
    'Emma',
    'Giorgia',
    'Martina',
    'Alice',
    'Greta',
    'Ginevra',
    'Chiara',
    'Anna',
    'Sara',
    'Beatrice',
    'Nicole',
    'Gaia',
    'Matilde',
    'Vittoria',
    'Noemi',
    'Francesca',
    'Alessia',
    'Ludovica',
    'Arianna',
    'Viola',
    'Camilla',
    'Elisa',
    'Bianca',
    'Giada',
    'Rebecca',
    'Elena',
    'Mia',
    'Adele',
    'Marta',
    'Gioia',
    'Maria',
    'Asia',
    'Eleonora',
    'Carlotta',
    'Miriam',
    'Irene',
    'Melissa',
    'Margherita',
    'Emily',
    'Caterina',
    'Anita',
    'Serena',
    'Benedetta',
    'Rachele',
    'Angelica',
    'Cecilia',
    'Isabel',
  ];
  const cities = [
    'Roma',
    'Milano',
    'Napoli',
    'Torino',
    'Palermo',
    'Genova',
    'Bologna',
    'Firenze',
    'Bari',
    'Catania',
    'Venezia',
    'Verona',
    'Messina',
    'Padova',
    'Trieste',
    'Taranto',
    'Brescia',
    'Parma',
    'Prato',
    'Modena',
    'Reggio Calabria',
    'Reggio Emilia',
    'Perugia',
    'Ravenna',
    'Livorno',
    'Cagliari',
    'Foggia',
    'Rimini',
    'Salerno',
    'Ferrara',
    'Sassari',
    'Latina',
    'Giugliano in Campania',
    'Monza',
    'Siracusa',
    'Pescara',
    'Bergamo',
    'Forlì',
    'Trento',
    'Vicenza',
    'Terni',
    'Bolzano',
    'Novara',
    'Piacenza',
    'Ancona',
    'Andria',
    'Arezzo',
    'Udine',
    'Cesena',
    'Lecce',
  ];
  const athletes_array: AthleteInterface[] = [];
  for (const cat of category) {
    const dim = random(17, 5);
    for (let i = 0; i < dim; i++) {
      athletes_array.push({
        name:
          cat.gender === 'M'
            ? male_names[random(50)]
            : female_names[random(50)],
        surname: surnames[random(50)],
        competition: competition_ids[0],
        club: `Judo ${cities[random(50)]}`,
        gender: cat.gender,
        weight: cat.max_weight - 1,
        birth_year: 1970,
        category: cat._id,
      });
    }
  }
  return athletes_array;
}

async function main() {
  const mongo_url = process.env.MONGO_URL;
  try {
    mongoose.connect(mongo_url);
    const competition = await Competition.insertMany(getCompetitions());
    const competition_ids = getIds(competition);
    console.log('created Competition:', competition_ids.length);
    const user = await User.insertMany(await getUser(competition_ids));
    const user_ids = getIds(user);
    console.log('created User:', user_ids.length);
    const age_class = await AgeClass.insertMany(getAgeClasses(competition_ids));
    const age_class_ids = getIds(age_class);
    console.log('created AgeClass:', age_class_ids.length);
    const category = await Category.insertMany(getCategories(age_class_ids));
    const category_ids = getIds(category);
    console.log('created Category:', category_ids.length);
    const athlete = await Athlete.insertMany(
      getAthetes(competition_ids, category)
    );
    const athlete_ids = getIds(athlete);
    console.log('created Athlete:', athlete_ids.length);
  } catch (e) {
    console.log(e.message);
  }
  await mongoose.disconnect();
}

main();

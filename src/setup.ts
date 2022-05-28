import mongoose from 'mongoose';
import { User } from './schemas/User';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const mongo_url = process.env.MONGO_URL;
const sysadmin_username = process.env.SYSADMIN_USERNAME;
const sysadmin_password = process.env.SYSADMIN_PASSWORD;

if ([mongo_url, sysadmin_username, sysadmin_password].includes(undefined)) {
  throw new Error('Application not correctly configured, please copy .env.example to .env ' +
    'and update it with your configuration, then restart.');
}

mongoose.connect(mongo_url);

async function createSysAdmin() {
  const sys_admin = await User.findOne({ username: sysadmin_username });
  if (sys_admin !== null) {
    console.log('SysAdmin found!', sys_admin);
    return;
  }
  console.log('Sysadmin not found, creating...');
  const hash = await bcrypt.hash(sysadmin_password, 10);
  const res = await User.create({
    username: sysadmin_username,
    password: hash
  });
  console.log('Created SysAdmin!', res);
}

async function run() {
  await createSysAdmin();
  await mongoose.disconnect();
}

run();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';

dotenv.config();

const viewServices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const services = await Service.find({});
        console.log(JSON.stringify(services, null, 2));
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

viewServices();

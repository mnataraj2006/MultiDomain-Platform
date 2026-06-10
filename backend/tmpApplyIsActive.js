import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';

dotenv.config();

const applyIsActive = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Service.updateMany({}, { $set: { isActive: true } });
        console.log(`Updated ${result.modifiedCount} services to have isActive: true.`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

applyIsActive();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb+srv://2312031_:nataraj2006@cluster0.bz9khfd.mongodb.net/multidomainplatform?appName=Cluster0";

async function main() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const users = await User.find({});
        for (let user of users) {
            // bcrypt hashes are 60 chars long and start with $2a$, $2b$ or $2y$
            if (!user.password.startsWith("$2")) {
                console.log(`Hashing password for user: ${user.email}`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                // use updateOne to bypass the pre-save hook, otherwise it will be double hashed incorrectly if my pre-save bug theory is correct
                await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
                console.log(`Updated user: ${user.email}`);
            } else {
                console.log(`User ${user.email} already has a hashed password.`);
            }
        }
    } catch (err) {
        console.error("error:", err.message);
    } finally {
        mongoose.disconnect();
    }
}
main();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb+srv://2312031_:nataraj2006@cluster0.bz9khfd.mongodb.net/multidomainplatform?appName=Cluster0";

async function main() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");
        const db = mongoose.connection.db;
        const users = await db.collection("users").find({}).toArray();
        console.log("Users:", users.map(u => ({ email: u.email, password: u.password, role: u.role })));

        if (users.length > 0) {
            const match = await bcrypt.compare("admin123", users[0].password); // just an example check
            console.log("Does admin123 match first user?", match);
        }
    } catch (err) {
        console.error("error:", err.message);
    } finally {
        mongoose.disconnect();
    }
}
main();

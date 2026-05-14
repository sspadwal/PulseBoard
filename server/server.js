import "dotenv/config";
import app from "./src/app.js";
import dbConnect from "./src/common/config/db.js";
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        // db connection 
        await dbConnect();

        app.listen(PORT, () => {
            console.log(`server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error(err);
    }
}

start()

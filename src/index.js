import app from "./app.js";

import dotenv  from "dotenv" ;
dotenv.config()


import connectDatabase from "./db/db.js";
connectDatabase()



const port = process.env.PORT || 3456

app.listen(port , () => {
    console.log(`Server is listening on ${port}`)
})
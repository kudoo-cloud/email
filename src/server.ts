import bodyParser from "body-parser";
import express from "express";
import path from "path";
const app = express();
import EmailRoutes from "./routes/email";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use("/email", EmailRoutes);

app.listen(process.env.PORT);
console.log(`Server started on ${process.env.PORT}`); // tslint:disable-line

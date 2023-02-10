import express, { Express, Request, Response } from 'express';
import { auth } from "./src/user";
import cors from "cors";
import { getContributionsTroncons, postContribution } from './src/contribution';
import multer from "multer";

const app: Express = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Ok');
});
app.post("/contribution", multer().single("photo"), postContribution);
app.post('/auth', auth);
app.get("/update", getContributionsTroncons);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

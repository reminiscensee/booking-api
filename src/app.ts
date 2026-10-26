import express, { type Application } from "express";

const app: Application = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'booking api ready'});
});

export default app
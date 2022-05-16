const express = require('express');
const cors = require('cors');

const app = express();
const server_port = 2500;
const server_url = 'http://localhost';

//for cors policy - https://youtu.be/PNtFSVU-YTI
app.use(cors({origin: '*'}))

//log requestsg
app.use((req , res, next) => {
    console.log(`requested ${req.server_url}`);
    next();
});

//It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

//put here your routers
import { athlete_router } from './routers/athlete_router';
import { ageclass_router } from './routers/ageclass_router';
import { tournament_router } from './routers/tournament_router';
import { match_router } from './routers/match_router';

app.use('/api/v1/athlete', athlete_router);
app.use('/api/v1/ageclass', ageclass_router);
app.use('/api/v1/tournament', tournament_router);
app.use('/api/v1/match', match_router);

//not found page
app.get('*', async (req, res) => {
    res.status(404).send({
        success: 0,
        error: 'page not found'
    })
})

//start server
app.listen(server_port, () => console.log(`Listening on ${server_url}:${server_port}`));
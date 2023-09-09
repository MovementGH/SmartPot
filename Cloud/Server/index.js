const LibExpress = require('express');
const LibCors=require('cors');
const LibFS=require('fs');

console.log('Loading data...');
let Pots = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/pots.json`));
console.log(`Loaded ${Pots.length} pots`);
let Users = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/users.json`));
console.log(`Loaded ${Users.length} users`);
let Plants = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/plants.json`));
console.log(`Loaded ${Plants.length} plants`);


console.log('Starting SmartPot serverr...');

function onStart() {
    setTimeout(()=>{
        LibFS.writeFile(`${process.env.SAVE_LOC}/pots.json`,JSON.stringify(Pots),()=>{});
        LibFS.writeFile(`${process.env.SAVE_LOC}/users.json`,JSON.stringify(Users),()=>{});
        LibFS.writeFile(`${process.env.SAVE_LOC}/plants.json`,JSON.stringify(Plants),()=>{});
    },process.env.SAVE_INTERVAL);
    console.log("Started SmartPot Server!");
}

function Authenticate(Request, Response, Next) {
    //TODO: Implement Accounts
    Request.user = 1; 
    Next();
}

function GetPots(Request,Response) {
    Response.json(Pots.filter(Pot=>Pot.owner==Request.user||Pot.viewers.includes(Request.user)));
}

function PatchPot(Request,Response) {
    let Pot = Pots.find(Pot=>Pot.serialNumber == Request.params.id);
    if(!Pot)
        return Response.sendStatus(404); //Pot not found
    
    if(Pot.owner != Request.user)
        return Response.sendStatus(403); //No permissions

    let serialNumber = Pot.serialNumber;
    Object.assign(Pot,Request.body);
    Pot.serialNumber = serialNumber;
}

function LinkPot(Request,Response) {
    let Pot = Pots.find(Pot=>Pot.serialNumber == Request.body.pot);
    if(!Pot)
        return Response.sendStatus(404); //Pot not found

    if(Pot.owner)
        return Response.sendStatus(403); //Pot already claimed

    Pot.owner = Request.user;
    Pot.viewers = [];
    Response.sendStatus(204);
}

function UnlinkPot(Request,Response) {
    let Pot = Pots.find(Pot=>Pot.serialNumber == Request.params.id);
    if(!Pot)
        return Response.sendStatus(404);
    if(Pot.owner != Request.user)
        return Response.sendStatus(403);

    delete Pot.owner;
    delete Pot.viewers;
    Response.sendStatus(204);
}

function GetUser(Request,Response) {
    let User = Users.find(User=>User.id==Request.user);
    if(!User) {
        Response.sendStatus(404);
        return;
    }
    Response.json(User);
}

function LinkDiscord(Request,Response) {
    //TODO: Implement accounts
}

function GetPlant(Request,Response) {
    let Plant = Plants.find(Plant=>Plant.id==Request.params.id);
    if(!Plant) {
        Response.sendStatus(404);
        return;
    }
    Response.json(Plant);
}

function PostStats(Request,Response) {
    let Pot = Pots.find(Pot=>Pot.serialNumber==Request.body.serialNumber);

    if(!Pot) {
        Pot = {
            serialNumber: Request.body.serialNumber,
            name: 'New Pot (' + Request.body.serialNumber+')',
            plantId: 0,
            stats: Request.body.stats
        };
        Pots.push(Pot);
    } else
        Pot.stats = Request.body.stats;

    Pot.lastSeen = Date.now();
    Response.sendStatus(204);
}


const ObjExpressServer=new LibExpress();
ObjExpressServer.use(LibCors({origin:'*'}));
ObjExpressServer.use('/', Authenticate);
ObjExpressServer.use('/', LibExpress.static('/App/Client/build'));
ObjExpressServer.get('/api/client/pots', GetPots);
ObjExpressServer.patch('/api/client/pot/:id/settings', PatchPot);
ObjExpressServer.delete('/api/client/pot/:id', UnlinkPot);
ObjExpressServer.post('/api/client/pot', LinkPot);

ObjExpressServer.get('/api/client/user', GetUser);
ObjExpressServer.get('/api/client/user/link/discord', LinkDiscord);
ObjExpressServer.get('/api/client/plant/:id', GetPlant);

ObjExpressServer.post('/api/pot/stats',PostStats);
ObjExpressServer.listen(80,onStart);
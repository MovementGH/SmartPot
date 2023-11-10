const LibExpress = require('express');
const LibCors=require('cors');
const LibBodyParser=require('body-parser');
const LibFS=require('fs');
const LibOneSignal = require('onesignal-node');
const LibDgram = require('dgram');
const ObjOneSignalClient = new LibOneSignal.Client(process.env.ONESIGNAL_ID, process.env.ONESIGNAL_KEY);

console.log('Loading data...');
let Pots = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/pots.json`));
console.log(`Loaded ${Pots.length} pots`);
let Users = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/users.json`));
console.log(`Loaded ${Users.length} users`);
let Plants = JSON.parse(LibFS.readFileSync(`${process.env.SAVE_LOC}/plants.json`));
console.log(`Loaded ${Plants.length} plants`);


console.log('Starting SmartPot webserver...');

async function sendNotification(Pot, Message) {
    let notification = {
        name: 'SmartPot Notification',
        contents: {
            'en': Message
        },
        target_channel: "push",
        include_aliases: { "external_id": [''+Pot.owner,...Pot.viewers.map(Viewer=>''+Viewer)]}
    };
    await ObjOneSignalClient.createNotification(notification).catch(err=>console.error('Failed to send notification: '+err));
}

async function onStart() {
    setInterval(()=>{
        LibFS.writeFile(`${process.env.SAVE_LOC}/pots.json`,JSON.stringify(Pots),()=>{});
        LibFS.writeFile(`${process.env.SAVE_LOC}/users.json`,JSON.stringify(Users),()=>{});
        LibFS.writeFile(`${process.env.SAVE_LOC}/plants.json`,JSON.stringify(Plants),()=>{});
    },process.env.SAVE_INTERVAL);
    console.log("Started SmartPot WebServer!");      
}

function Authenticate(Request, Response, Next) {
    //TODO: Implement Accounts
    Request.user = 1; 
    Next();
}

function GetPots(Request,Response) {
    Response.json(Pots.filter(Pot=>Pot.owner==Request.user||Pot.viewers?.includes(Request.user)));
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
    Response.sendStatus(204);
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
    if(!Plant)
        return Response.sendStatus(404);
    Response.json(Plant);
}
function GetPlants(Request,Response) {
    Response.json(Plants);
}

const ObjExpressServer=new LibExpress();
ObjExpressServer.use(LibCors({origin:'*'}));
ObjExpressServer.use(LibBodyParser.json());
ObjExpressServer.use(LibBodyParser.urlencoded({extended:true}));
ObjExpressServer.use('/', Authenticate);
ObjExpressServer.use('/', LibExpress.static('/App/Client/build'));
ObjExpressServer.get('/api/client/pots', GetPots);
ObjExpressServer.patch('/api/client/pot/:id/settings', PatchPot);
ObjExpressServer.delete('/api/client/pot/:id', UnlinkPot);
ObjExpressServer.post('/api/client/pot', LinkPot);

ObjExpressServer.get('/api/client/user', GetUser);
ObjExpressServer.get('/api/client/user/link/discord', LinkDiscord);
ObjExpressServer.get('/api/client/plant/:id', GetPlant);
ObjExpressServer.get('/api/client/plants', GetPlants);

ObjExpressServer.listen(80,onStart);

console.log('Starting SmartPot UDP Server...');

const ObjUDPServer = LibDgram.createSocket('udp4');

ObjUDPServer.on('listening', () => console.log('Started SmartPot UDP Server!') );
ObjUDPServer.on('message', message => {
    let args = message.toString().split(' ');
    let Pot = Pots.find(Pot=>Pot.serialNumber==args[0]);
    if(!Pot) {
        Pot = {
            serialNumber: args[0],
            name: 'New Pot (' + args[0]+')',
            plantId: 0,
            stats: { moistureLevel: 0 }
        };
        Pots.push(Pot);
    } else {
        let Plant = Plants.find(Plant=>Plant.id==Pot.plantId);
        if(Pot.stats[args[1]] > Plant[args[1]].min && args[2] < Plant[args[1]].min)
            sendNotification(Pot, `Time to water ${Pot.name}!`);
        if(Pot.stats[args[1]] < Plant[args[1]].max && args[2] > Plant[args[1]].max)
            sendNotification(Pot, `${Pot.name} is very wet, you might want to drain some water!`);
        Pot.stats[args[1]]= args[2];
    }
    Pot.lastSeen = Date.now();
});

ObjUDPServer.bind(process.env.UDP_PORT, '0.0.0.0');
const LibExpress = require('express');
const LibCors=require('cors');

let Pots = [
    {
        id: 1,
        name: 'Pot 1',
        plantId: 1,
        owner: 1,
        viewers: [],
        
        hardware: {
            version: 1
        }
    }
]
let Users = [
    {
        id: 1,
        name: 'Movement',
    }
]
let Plants = [
    {
        id: 1,
        name: 'Carrot',
        minWater: .2,
        maxWater: .4,
        image: '',
    }
]

function onStart() {
    console.log("Started Express Server!");
}

function Authenticate(Request, Response, Next) {
    Request.user = 1; //TODO: Real logins
    Next();
}

function GetPots(Request,Response) {
    Response.json(Pots.filter(Pot=>Pot.owner==Request.user||Pot.viewers.includes(Request.user)));
}
function GetUser(Request,Response) {
    let User = Users.find(User=>User.id==Request.user);
    if(!User) {
        Response.sendStatus(404);
        return;
    }
    Response.json(User);
}
function GetPlant(Request,Response) {
    let Plant = Plants.find(Plant=>Plant.id==Request.params.id);
    if(!Plant) {
        Response.sendStatus(404);
        return;
    }
    Response.json(Plant);
}


const ObjExpressServer=new LibExpress();
ObjExpressServer.use(LibCors({origin:'*'}));
ObjExpressServer.use('/', Authenticate);
ObjExpressServer.use('/', LibExpress.static('/App/Client/build'));
ObjExpressServer.get('/api/pots', GetPots);
ObjExpressServer.get('/api/user', GetUser);
ObjExpressServer.get('/api/plant/:id', GetPlant);
ObjExpressServer.listen(80,onStart);
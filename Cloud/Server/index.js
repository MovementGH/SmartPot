const LibExpress = require('express');

function onStart() {
    console.log("Started Express Server!");
}


const ObjExpressServer=new LibExpress();
ObjExpressServer.use('/', LibExpress.static('/App/Client/build'));

ObjExpressServer.get('/api',(Request,Response) => {
    Response.send("Hello there");
});

ObjExpressServer.listen(80,onStart);
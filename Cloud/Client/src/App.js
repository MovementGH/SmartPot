
//Libs
import React from 'react'
import { Routes, Route } from 'react-router-dom';

//Contexts
import { UserContext } from './Contexts/User';
import Request from './Tools/Request';

import Home from './Routes/Home';

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state={};
  }

  componentDidMount() {
      Request.CacheableRequest('GET','user').then(Result=>{
        this.setState({Context:{User:Result.Body}});
      })
  }

  render() {
    if(this.state.Context) {
      return (
        <UserContext.Provider value={this.state.Context}>
          <div className="d-flex flex-column" style={{overflow:"hidden",minHeight:"100vh"}}>
            <div className={"text-light pt-4 flex-grow-1 d-flex flex-column"} style={{backgroundImage:'radial-gradient(at top,rgb(26,27,32),rgb(13,13.5,16))'}}>
              <Routes>
                <Route path="/" element = {<Home/>}/>
              </Routes>
            </div>
          </div>
        </UserContext.Provider>
      );
    }
    return null;
  }
}

export default App;

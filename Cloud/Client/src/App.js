
//Libs
import React from 'react'
import { Routes, Route } from 'react-router-dom';

//Contexts
import { UserContext } from './Contexts/User';
import Request from './Tools/Request';

class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state={Context:1};
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
            <Routes>

              <Route path="/" element = {<p>Main Page</p>}/>

            </Routes>
          </div>
        </UserContext.Provider>
      );
    }
    return null;
  }
}

export default App;

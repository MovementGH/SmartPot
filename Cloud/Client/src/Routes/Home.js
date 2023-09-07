import React from 'react'

import Request from '../Tools/Request';



class Home extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    Request.CacheableRequest('GET','pots').then(Result=>{
      this.setState({Pots:Result.Body});
    })
  }

  render() {
    console.log(this.state.Pots)
    return (
        <div>
            <h1>Your Smart Pots:</h1>
            {this.state.Pots?this.state.Pots.map(Pot=>(
              <>
                <h3>{Pot.name}</h3>
                <p>Moisture Level: {Pot.hardware.moistureLevel}</p>
              </>
            )):(
                <p>Loading...</p>
            )}
        </div>
    );
  }
}

export default Home;
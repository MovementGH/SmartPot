import React from 'react'

import Request from '../Tools/Request';
import Button from 'react-bootstrap/Button';

import SmartPot from '../Components/SmartPot';

import Swal from 'sweetalert2';

class Home extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {};
    this.updatePots = this.updatePots.bind(this);
    this.linkPot = this.linkPot.bind(this);
  }

  componentDidMount() {
    setInterval(this.updatePots,1000);
    this.updatePots();
  }

  updatePots() {
    Request.Request('GET','pots').then(Result=>{
      this.setState({Pots:Result.Body});
    }).catch(Error=>{

    })
  }

  linkPot() {
    Swal.fire({
      title: 'Link Pot',
      text: 'Enter the serial number of the pot you would like to link. It can be found on the bottom of your pot.',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Link',
      allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
      if (result.isConfirmed) {
          Swal.fire('Linking pot...');
          Swal.showLoading();
          Request.Request('POST','pot',{pot: result.value}).then(Result=>{
              Swal.fire('Pot Linked','','success');
          }).catch(Error=>{
              Swal.fire('Error','Something went wrong. Please try again.','error');
          })
      }
  });
  }

  render() {
    return (
        <div>
            <h1 className="text-center my-2">Your Smart Pots:</h1>
            <div className="my-4 d-flex flex-wrap justify-content-center">
              {this.state.Pots?this.state.Pots.map(Pot=>(
                <SmartPot key={Pot.serialNumber} pot={Pot}/>
              )):(
                  <p>Loading...</p>
              )}
            </div>
            <div className="d-flex justify-content-center mb-4">
              <Button className="mx-auto" variant="success" onClick={this.linkPot}>Link Pot</Button>
            </div>
            <div className="d-flex justify-content-center mb-4">
              <div className='onesignal-customlink-container'></div>
            </div>
        </div>
    );
  }
}

export default Home;
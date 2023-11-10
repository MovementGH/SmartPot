import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'

import Request from '../Tools/Request';
import StatBar from './StatBar';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

class SmartPot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.setPlant = this.setPlant.bind(this);
        this.setName = this.setName.bind(this);
        this.unlink = this.unlink.bind(this);
    }

    updatePlant() {
        Request.CacheableRequest('GET','plant/'+this.props.pot.plantId).then(Result=>{
            this.setState({plant:Result.Body});
        })
    }
    componentDidMount() {
        this.updatePlant();
    }
    componentDidUpdate() {
        this.updatePlant();
    }

    
    async setPlant() {
        let items = (await Request.CacheableRequest('GET','plants')).Body;
        let onSelect = item => {
            Request.Request('PATCH',`pot/${this.props.pot.serialNumber}/settings`,{plantId: item.id});
            Swal.close();
        };
        let formatResult = item => <span style={{display:'block',textAlign:'left'}}><img src={item.image} style={{height:'2.5em', borderRadius: '1em', marginRight: '.5em'}}/>{item.name}</span>
        
        withReactContent(Swal).fire({
            title: "Choose a plant",
            showConfirmButton: false,
            html: (
                <div style={{height:'32.5em'}}>
                    <ReactSearchAutocomplete items={items} onSelect={onSelect} autoFocus formatResult={formatResult}/> 
                </div>
            )
        });
    }
    async setName() {
        Swal.fire({
            title: 'Set Name',
            text: 'Enter the name you would like to call your pot',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Rename',
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Setting Name...');
                Swal.showLoading();
                Request.Request('PATCH',`pot/${this.props.pot.serialNumber}/settings`,{name: result.value}).then(Result=>{
                    Swal.fire('Pot Renamed','','success');
                }).catch(Error=>{
                    Swal.fire('Error','Something went wrong. Please try again.','error');
                })
            }
        });
    }

    unlink() {

        Swal.fire('Unlinking pot...');
        Swal.showLoading();
        Request.Request('DELETE',`pot/${this.props.pot.serialNumber}`).then(Result=>{
            Swal.fire('Pot Unlinked','','success');
        }).catch(Error=>{
            Swal.fire('Error','Something went wrong. Please try again.','error');
        });
    }

    render() {
        return (
            <Card className="mx-4 my-4 bg-dark text-light border-white border-1 d-flex flex-wrap" style={{ width: '20rem' }}>
                <Card.Img className="mx-auto" variant="top" src={this.state.plant?.image||'/GenericPlant.png'} style={{width: "auto",height:"10em"}}/>
                <Card.Body>
                    <Card.Title className="text-center">{this.props.pot.name}</Card.Title>
                    <Card.Text className="text-center">{this.state.plant?.name}</Card.Text>
                    <Card.Text className="text-center">Last Seen: {moment(new Date(this.props.pot.lastSeen)).fromNow()} </Card.Text>
                    <StatBar min={this.state.plant?.moisture.min} max={this.state.plant?.moisture.max} value={this.props.pot.stats.moisture}/>
                    <div className="w-100 text-center d-flex flex-wrap justify-content-around">
                        <Button className="col-5" variant="primary" onClick={this.setPlant}>Set Plant</Button>
                        <Button className="col-5" variant="primary" onClick={this.setName}>Edit Name</Button>
                    </div>
                    <div className="w-100 text-center mt-3">
                        <Button variant="danger" onClick={this.unlink}>Unlink Pot</Button>
                    </div>
                </Card.Body>
            </Card>
        )
    }
}

export default SmartPot;
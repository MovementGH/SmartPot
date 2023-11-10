import React from 'react';

class StatBar extends React.Component {

    render() {
        return (
            <div style={{width: "100%", marginBottom: '1em', height:"2em",border: '1px solid white',backgroundImage:`linear-gradient(90deg, #f00 ${this.props.min*100-15}%, #ee0 ${this.props.min*100}%, #0f0 ${(this.props.min+(this.props.max-this.props.min)/2)*100}%, #ee0 ${this.props.max*100}%, #f00 ${this.props.max*100+15}%)`}}>
                <span style={{position: 'relative', display:'block', height:"calc(2em - 2px)", width:"5px", backgroundColor:'white', left:`calc(${this.props.value*100}% - 2.5px)`}}></span>
            </div>
        )
    }
}

export default StatBar
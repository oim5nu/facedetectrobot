import React, { Component } from 'react';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''        
  }
};



const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    },
/*    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      }  
    }
*/        
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000')
  //     .then(response => response.json())
  //     .then(console.log());
  // }

  // loadUser = (data) => {
  //   this.setState({
  //     user: {
  //       id: data.id,
  //       name: data.name,
  //       email: data.email,
  //       entries: data.entries,
  //       joined: data.joined
  //     } 
  //   });
  // }

  loadUser = (data) => {
    let newState = Object.assign({}, 
      this.state,
      { user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined        
      }}
    );
    this.setState(newState);
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    let newState = Object.assign({}, 
      this.state,
      { box: {...box} }
    );
    this.setState(newState);
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  imageUrlApi = () => {
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          let newState = Object.assign({}, this.state, 
            { user: { 
              ...this.state.user, 
              entries: count 
            }}
          );
          this.setState(newState);
          //this.setState(Object.assign(this.state.user, { entries: count } ))
        })
        .catch(error => console.log(error))
      }
      // const box = this.calculateFaceLocation(response);
      this.displayFaceBox(this.calculateFaceLocation(response));
    }).catch(err => {
      console.log(err);
    });
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input}, () => {
      this.imageUrlApi();
    }); 
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }

    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box, user } = this.state;
    //console.log('this.state', this.state);
    return (
      <div className="App">
        <Particles className="particles"
          params={particlesOptions}
        />      
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        { route === 'home' ?
          <div>
            <Logo />
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : ( route === 'signin' || route === 'signout' ?
          <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} /> : 
          <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;

import React from "react";
import moment from 'moment';
import Flights from './flights'

import "../styles/components/app.scss";

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      flightSearches: [],
      searchResults: [],
      cities:[],
      originCode:'',
      dateFrom:[],
      dateTo:[]}

    this.fetchFlights = this.fetchFlights.bind(this);
    this.fetchWeather = this.fetchWeather.bind(this);
    this.readLocalStorage = this.readLocalStorage.bind(this)
    this.writeLocalStorageWeather = this.writeLocalStorageWeather.bind(this)

    this.data = this.data.bind(this);
;  }

  componentWillMount() {
    this.data(() => {
      this.readLocalStorage();
      this.fetchFlights();
      this.fetchWeather();
      console.log(this.state.flightSearches)
    });
  }


  readLocalStorage() {
    let flightSearches = JSON.parse(localStorage.getItem('flightSearches'))
    if (flightSearches) {
      this.setState({
        flightSearches : flightSearches
      })
    }
  }

  data(done) {
    const dateFrom = '06/10/2018';
    const dateTo = '09/10/2018';
    const originCode = 'LON';
    const cities = [
      {city: "Barcelona", airportCode: "BCN", countryCode: "ES" },
      {city: "Prague", airportCode: "PRG", countryCode: "CZ" },
      {city:'Berlin', airportCode:"BER", countryCode:"DE"},
      {city:'Madrid', airportCode:"MAD", countryCode:"ES"},
      {city:'Paris', airportCode:"PAR", countryCode:"FR"},
      {city:'Lisbon', airportCode:"LIS", countryCode:"PT"},
      {city:'Krakow', airportCode:"KRK", countryCode:"PL"},
      {city:'Budapest', airportCode:"BUD", countryCode:"HU"},
      {city:'Seville', airportCode:"SVQ", countryCode:"ES"},
      {city:'Istanbul', airportCode:"IST", countryCode:"TR"}
    ];

    this.setState({
      cities:cities,
      originCode: originCode,
      dateFrom: dateFrom.split('/'),
      dateTo: dateTo.split('/')
    }, done)
  }


  fetchFlights() {
    console.log(this.state.cities);
    const dateFrom = this.state.dateFrom.join('/')
    const dateTo = this.state.dateTo.join('/')
    console.log('df =' + this.state.dateFrom);
    const originCode = this.state.originCode;


    Promise.all(this.state.cities.map(city => {
      return fetch(
        `https://api.skypicker.com/flights?flyFrom=${originCode}&to=${
          city.airportCode
        }&dateFrom=${dateFrom}&dateTo=${dateTo}&partner=picky`
      )
        .then(response => response.json())
        .then(result => (result.data.reduce((prev, curr) => {
          return prev.price < curr.price ? prev : curr;
      })))
    }))
      .then(results => {
        this.writeLocalStorageFlights(results)
      });
  }

  writeLocalStorageFlights(searchResults) {
    this.setState({
      searchResults:searchResults
    },() => localStorage.setItem('searchResults', JSON.stringify(this.state.searchResults)))
  }

  writeLocalStorageWeather(weatherResults, dateFrom, dateTo) {
    let sunData = JSON.parse(localStorage.getItem('sunData'))
    if (!sunData) {sunData={}};
    let weatherDates = `${dateFrom.join('')}:${dateTo.join('')}`
    sunData[weatherDates] = weatherResults
    console.log(sunData)

    
    // this.setState({
    //   searchResults:searchResults
    // },() => localStorage.setItem('searchResults', JSON.stringify(this.state.searchResults)))
    // console.log(searchResults);
  }

  fetchWeather() {
    const apiKey = 'febcfe1533da47fab5a477c0658e1016'
    const cities = [
      { city: "Barcelona", airportCode: "BCN", countryCode: "ES" },
      { city: "Prague", airportCode: "PRG", countryCode: "CZ" }
    ];
    console.log(cities)
    
    let dateFrom = this.state.dateFrom;
    let dateTo = this.state.dateTo;
    let dateFromMoment = moment(`${dateFrom[2]} ${dateFrom[1]} ${dateFrom[0]}`);
    let dateToMoment = moment(`${dateTo[2]} ${dateTo[1]} ${dateTo[0]}`);
    let dateTodayMoment = moment()
    let daysUntilDateFrom = dateFromMoment.diff(dateTodayMoment, 'days')+1
    let daysUntilDateTo = dateToMoment.diff(dateTodayMoment, 'days')+1


    Promise.all(cities.map(city => {
      return fetch(
        `https://api.weatherbit.io/v2.0/forecast/energy?city=${city.city}&country=${city.countryCode}&key=${apiKey}`)
        .then(response => response.json())
        .then(result => ({ [result.city_name] : result.data.slice(daysUntilDateFrom,daysUntilDateTo+1).reduce((a,b)=>(a + b.sun_hours),0)}))
    }))
      .then(results => {
        writeLocalStorageWeather(results, dateFrom, dateTo)
        console.log(results)
        console.log('good morning')
      });
  }
  

  render() {
    return <div className="app">
      <Flights searchResults={this.state.searchResults} />
    </div>;
  }
}

export default App;

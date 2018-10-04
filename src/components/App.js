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
      dateTo:[],
      weatherForecasts:{}}

    this.fetchFlights = this.fetchFlights.bind(this);
    this.fetchWeather = this.fetchWeather.bind(this);
    this.readLocalStorage = this.readLocalStorage.bind(this)
    this.writeLocalStorageFlights = this.writeLocalStorageFlights.bind(this)
    this.writeLocalStorageWeather = this.writeLocalStorageWeather.bind(this)
    this.getWeather = this.getWeather.bind(this)

    this.data = this.data.bind(this);
;  }

  componentWillMount() {
    this.data(() => {
      this.fetchFlights();
      this.fetchWeather();
    });
  }


  readLocalStorage() {
    let flightSearches = JSON.parse(localStorage.getItem('flightSearches'))
    if (flightSearches) {
      this.setState({
        flightSearches : flightSearches
      })
    }

    let weatherForecasts = JSON.parse(localStorage.getItem('weatherForecasts'))
    if (weatherForecasts) {
      this.setState({
        weatherForecasts : weatherForecasts
      })
    }
    console.log(53)
    console.log(weatherForecasts)
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

    this.readLocalStorage();

  }


  fetchFlights() {
    const dateFrom = this.state.dateFrom.join('/')
    const dateTo = this.state.dateTo.join('/')
    const originCode = this.state.originCode;


    Promise.all(this.state.cities.map(city => {
      return fetch(
        `https://api.skypicker.com/flights?flyFrom=${originCode}&to=${
          city.airportCode
        }&dateFrom=${dateFrom}&dateTo=${dateTo}&partner=picky`
      )
        .then(response => response.json())
        .then(result => (result.data.reduce((prev, curr) => {
          return prev.price < curr.price ? prev : curr;})))
    }))
      .then(results => {
        // this.writeLocalStorage(results)
        console.log('flights fetched')
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
    console.log('weather storage')

    
    // this.setState({
    //   searchResults:searchResults
    // },() => localStorage.setItem('searchResults', JSON.stringify(this.state.searchResults)))
    // console.log(searchResults);
  }

  fetchWeather() {
    let dateFrom = this.state.dateFrom;
    let dateTo = this.state.dateTo;
    let dateFromMoment = moment(`${dateFrom[2]} ${dateFrom[1]} ${dateFrom[0]}`);
    let dateToMoment = moment(`${dateTo[2]} ${dateTo[1]} ${dateTo[0]}`);
    let dateTodayMoment = moment()
    let daysUntilDateFrom = dateFromMoment.diff(dateTodayMoment, 'days')+1
    let daysUntilDateTo = dateToMoment.diff(dateTodayMoment, 'days')+1
    console.log(`${daysUntilDateFrom} ${daysUntilDateTo}`)
    // console.log(dateFromMoment)
    // console.log(dateTodayMoment)
    // console.log("MOMENT" + dateFromMoment.diff(dateTodayMoment, 'days'));       // 1
    // a.diff(b, 'years', true);
    // console.log("moment" + moment((dateFrom[2]+dateFrom[1]+dateFrom[0]), "YYYYMMDD").fromNow());
    const apiKey = 'febcfe1533da47fab5a477c0658e1016'
    const cities = [
      { city: "Barcelona", airportCode: "BCN", countryCode: "ES" },
      { city: "Prague", airportCode: "PRG", countryCode: "CZ" }
    ];


    console.log(this.state.weatherForecasts)

    Promise.all(cities.map(city => {
      let cityDate = city.city + moment().format('YYYY MM DD').toString();
      console.log(cityDate);
      if(!this.state.weatherForecasts[cityDate]) {
        return fetch(
          `https://api.weatherbit.io/v2.0/forecast/energy?city=${city.city}&country=${city.countryCode}&key=${apiKey}`)
          .then(response => response.json())
          .then(forecast => {
            console.log('set new forecast')
            this.setState(prevState => {
              
              const newWeather = Object.assign({}, prevState.weatherForecasts, {
                [cityDate] : {
                  forecast: forecast,
                  sunshine: forecast.data.slice(daysUntilDateFrom,daysUntilDateTo+1).reduce((a,b)=>(a + b.sun_hours),0)
                }
              });

              return {
                weatherForecasts: newWeather
              }
            },()=>localStorage.setItem('weatherForecasts', JSON.stringify(this.state.weatherForecasts)))
            
          })
        }       
    }))  
        

}

    getWeather(cities) {

    }



    
  

  render() {
    console.log(this.state.weatherForecasts)
    return <div className="app">
      <Flights searchResults={this.state.searchResults} />
    </div>;
  }
}

export default App;

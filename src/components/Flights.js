import React from 'react';
import Flight from './Flight'

function Flights ({searchResults}, {weatherForecast}) {
    return (
        <div className="flights" id="flights">
          {searchResults.map(result => (
            <Flight
              cityFrom={result.cityFrom}
              cityTo={result.cityTo}
              price={result.price}
            />
          ))}
        </div>
      );
};

export default Flights;
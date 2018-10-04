import React from 'react';
import Flight from './Flight'

function Flights ({results}) {
    return (
        <div className="flights" id="flights">
          {results.map(result => (
            <Flight
              result={result} key={result.flight.id}
            />
          ))}
        </div>
      );
};

export default Flights;
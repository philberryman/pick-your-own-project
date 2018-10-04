import React from 'react';

function Flight ({result}) {
    return (
        <div>
            {result.flight.mapIdfrom} {result.flight.mapIdto} {result.flight.price} {result.sunshine} {result.flight.price / result.sunshine}
        </div>
      );
};

export default Flight;
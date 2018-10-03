import React from 'react';

function Flight ({cityFrom, cityTo, price}) {
    return (
        <div>
            {cityFrom} {cityTo} {price} 
        </div>
      );
};

export default Flight;
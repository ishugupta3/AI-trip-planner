import React from 'react'
import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({trip}) {
  console.log('PlacesToVisit - Trip data:', trip);
  console.log('PlacesToVisit - Itinerary:', trip?.tripData?.itinerary);
  
  // Safe data extraction with fallbacks
  const itinerary = trip?.tripData?.itinerary;
  
  // Check if itinerary exists and is an array
  if (!itinerary || !Array.isArray(itinerary)) {
    console.warn('No valid itinerary data found');
    return (
      <div>
        <h2 className='font-bold text-xl'>Places to Visit</h2>
        <div className='mt-5 p-4 bg-gray-100 rounded-lg'>
          <p className='text-gray-600'>No itinerary data available. Please try generating a new trip.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <h2 className='font-bold text-xl'>Places to Visit</h2>
        <div>
            {itinerary.map((item, index) => {
              // Validate each day item
              if (!item || !item.day) {
                console.warn(`Invalid day item at index ${index}:`, item);
                return null;
              }
              
              const dayPlans = item.plan || [];
              
              return (
                <div key={index} className='mt-5'>
                    <h2 className='font-bold text-lg'>{item.day}</h2>
                    <div className='grid md:grid-cols-2 gap-5'>
                    {Array.isArray(dayPlans) ? dayPlans.map((place, placeIndex) => {
                      // Validate each place item
                      if (!place) {
                        console.warn(`Invalid place item at day ${index}, place ${placeIndex}:`, place);
                        return null;
                      }
                      
                      return (
                        <div key={placeIndex} className='my-2'>
                            <h2 className='font-medium text-sm text-orange-600'>{place.time || 'Time not specified'}</h2>
                            <PlaceCardItem place={place}/>
                        </div>
                      );
                    }) : (
                      <div className='col-span-2 p-4 bg-gray-100 rounded-lg'>
                        <p className='text-gray-600'>No places planned for this day.</p>
                      </div>
                    )}
                    </div>
                </div>
              );
            })}
        </div>
    </div>
  )
}

export default PlacesToVisit
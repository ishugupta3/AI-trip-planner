import React from 'react'
import { Link } from 'react-router-dom'
import HotelCardItem from './HotelCardItem'

function Hotels({ trip }) {
    console.log('Hotels - Trip data:', trip);
    console.log('Hotels - Hotel options:', trip?.tripData?.hotel_options);
    
    // Safe data extraction
    const hotelOptions = trip?.tripData?.hotel_options;
    
    // Check if hotel options exist and is an array
    if (!hotelOptions || !Array.isArray(hotelOptions)) {
        console.warn('No valid hotel options found');
        return (
            <div>
                <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
                <div className='mt-5 p-4 bg-gray-100 rounded-lg'>
                    <p className='text-gray-600'>No hotel recommendations available.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>
                {hotelOptions.map((hotel, index) => {
                    if (!hotel) {
                        console.warn(`Invalid hotel at index ${index}:`, hotel);
                        return null;
                    }
                    return (
                        <HotelCardItem key={index} hotel={hotel} />
                    );
                })}
            </div>
        </div>
    )
}

export default Hotels
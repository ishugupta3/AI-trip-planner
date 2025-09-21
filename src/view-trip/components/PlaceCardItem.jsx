import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { getPlacePhoto } from '@/service/GlobalApi';

function PlaceCardItem({place}) {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
      place && GetPlacePhoto();
  }, [place])
  
  // Format price to ensure it shows in Rupees
  const formatPrice = (price) => {
      if (!price) return 'Free';
      
      // If price contains $ (dollar), convert it
      if (price.includes('$')) {
          const numericValue = price.match(/\d+/);
          if (numericValue) {
              const dollars = parseInt(numericValue[0]);
              const rupees = Math.round(dollars * 83); // Approximate conversion
              return `₹${rupees}`;
          }
      }
      
      // If price already contains ₹, return as is
      if (price.includes('₹')) {
          return price;
      }
      
      // If just a number, add ₹ symbol
      const numericValue = price.match(/\d+/);
      if (numericValue) {
          return `₹${price}`;
      }
      
      return price;
  }

  const GetPlacePhoto = async () => {
      try {
          const placeName = place?.place || place?.name;
          if (!placeName) {
              console.warn('No place name found for photo');
              return;
          }
          
          console.log('Fetching photo for place:', placeName);
          const photoUrl = await getPlacePhoto(placeName);
          setPhotoUrl(photoUrl);
          
      } catch (error) {
          console.error('Error fetching place photo:', error);
          // Keep default placeholder on error
      }
  }

  return (
    <Link to={'https://www.google.com/maps/search/?api=1&query=' +place?.place} target='_blank'>
    <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all'>
        <img src={photoUrl?photoUrl:'/placeholder.jpg'} alt="" className='w-[130px] h-[130px] rounded-xl object-cover' />
        <div>
            <h2 className='font-bold text-lg'>{place.place}</h2>
            <p className='text-sm text-gray-500'>{place.details}</p>
            {/* <h2>place.timetoTravel</h2> */}
            <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {formatPrice(place.ticket_pricing)}</h2>
            {/* <Button size="sm"><FaMapLocationDot /></Button> */}
        </div>
    </div>
    </Link>
  )
}

export default PlaceCardItem
import { getPlacePhoto } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function HotelCardItem({ hotel }) {
    const [photoUrl, setPhotoUrl] = useState();

    useEffect(() => {
        hotel&&GetPlacePhoto();
    }, [hotel])

    const GetPlacePhoto = async () => {
        try {
            const hotelName = hotel?.name;
            if (!hotelName) {
                console.warn('No hotel name found for photo');
                return;
            }
            
            console.log('Fetching photo for hotel:', hotelName);
            const photoUrl = await getPlacePhoto(hotelName + ' hotel');
            setPhotoUrl(photoUrl);
            
        } catch (error) {
            console.error('Error fetching hotel photo:', error);
            // Keep default placeholder on error
        }
    }
    
    // Format price to ensure it shows in Rupees
    const formatPrice = (price) => {
        if (!price) return 'Price not available';
        
        // If price contains $ (dollar), convert it or replace with ₹
        if (price.includes('$')) {
            const numericValue = price.match(/\d+/);
            if (numericValue) {
                const dollars = parseInt(numericValue[0]);
                const rupees = Math.round(dollars * 83); // Approximate conversion rate
                return `₹${rupees}/night`;
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

    return (
        <Link to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.name + "," + hotel?.address} target='_blank'>

            <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
                <img src={photoUrl?photoUrl:'/placeholder.jpg'} className='rounded-xl h-[180px] w-full object-cover' />
                <div className='my-2'>
                    <h2 className='font-medium'>{hotel?.name}</h2>
                    <h2 className='text-xs text-gray-500'>📍{hotel?.address}</h2>
                    <h2 className='text-sm'>💰{formatPrice(hotel?.price)}</h2>
                    <h2 className='text-sm'>⭐{hotel?.rating}</h2>

                </div>
            </div></Link>
    )
}

export default HotelCardItem
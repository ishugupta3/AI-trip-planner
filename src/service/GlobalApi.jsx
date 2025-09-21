import axios from "axios"

// Using FREE OpenStreetMap Nominatim API - No API key required!
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'

// Using FREE Unsplash API for photos - 50 requests per hour
const UNSPLASH_BASE_URL = 'https://api.unsplash.com/search/photos'

// OpenStreetMap search function (completely free!)
export const GetPlaceDetails = async (data) => {
  try {
    // Extract location from the data (assuming data has textQuery like Google Places)
    const searchQuery = data.textQuery || data.query || data
    
    // Search using OpenStreetMap Nominatim
    const response = await axios.get(NOMINATIM_BASE_URL, {
      params: {
        q: searchQuery,
        format: 'json',
        addressdetails: 1,
        limit: 10,
        extratags: 1
      },
      headers: {
        'User-Agent': 'AI-Trip-Planner/1.0'
      }
    })
    
    // Transform response to match Google Places format
    const transformedData = {
      places: response.data.map(place => ({
        id: place.place_id,
        displayName: {
          text: place.display_name
        },
        formattedAddress: place.display_name,
        location: {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon)
        },
        photos: [] // Will be populated by getPlacePhoto function
      }))
    }
    
    return { data: transformedData }
  } catch (error) {
    console.error('Error fetching place details:', error)
    throw error
  }
}

// Get photo from Unsplash (free)
export const getPlacePhoto = async (placeName) => {
  try {
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    
    // If no Unsplash key, return a placeholder
    if (!unsplashKey || unsplashKey === 'demo_key') {
      return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&h=300&fit=crop`
    }
    
    const response = await axios.get(UNSPLASH_BASE_URL, {
      params: {
        query: placeName,
        per_page: 1,
        orientation: 'landscape'
      },
      headers: {
        'Authorization': `Client-ID ${unsplashKey}`
      }
    })
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular
    }
    
    // Fallback to a default travel image
    return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&h=300&fit=crop`
  } catch (error) {
    console.error('Error fetching photo:', error)
    return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&h=300&fit=crop`
  }
}

// For backward compatibility - photo URL function
export const PHOTO_REF_URL = (placeName) => getPlacePhoto(placeName)

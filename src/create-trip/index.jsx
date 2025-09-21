import { Input } from '@/components/ui/input';
import PlaceAutocomplete from '@/components/custom/PlaceAutocomplete';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from '@/constants/options';
import React, { useEffect, useState } from 'react'
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete' // Removed paid API
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';
import { chatSession } from '@/service/AIModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from "firebase/firestore";
import { app, db } from '@/service/firebaseConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);
  const [userName, setUserName] = useState('');

  const [openDialog, setOpenDialog] = useState(false);

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleInputChange = (name, value) => {

    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const onGenerateTrip = async () => {
    console.log('🚀 Trip generation started');
    console.log('Form data:', formData);

    const user = localStorage.getItem('user');
    if (!user) {
      setOpenDialog(true)
      return;
    }

    // Improved validation
    if (!formData?.location?.label) {
      toast('Please select a destination');
      return;
    }
    if (!formData?.noOfDays || formData?.noOfDays <= 0) {
      toast('Please enter number of days');
      return;
    }
    if (formData?.noOfDays > 10) {
      toast('Maximum 10 days allowed');
      return;
    }
    if (!formData?.budget) {
      toast('Please select your budget');
      return;
    }
    if (!formData?.traveler) {
      toast('Please select traveler type');
      return;
    }

    setLoading(true);

    try {
      console.log('✅ All validations passed');
      
      const FINAL_PROMPT = AI_PROMPT
        .replace('{location}', formData?.location?.label)
        .replace('{totalDays}', formData?.noOfDays)
        .replace('{traveler}', formData?.traveler)
        .replace('{budget}', formData?.budget)
        .replace('{budget}', formData?.budget)
        .replace('{totalDays}', formData?.noOfDays);

      console.log('🤖 Sending prompt to AI:', FINAL_PROMPT.substring(0, 100) + '...');

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripData = result?.response?.text();
      
      console.log('🎯 AI Response received:', tripData?.substring(0, 200) + '...');
      
      if (!tripData) {
        throw new Error('No response from AI');
      }

      await SaveAiTrip(tripData);
      console.log('✅ Trip saved successfully');
      
    } catch (error) {
      console.error('❌ Trip generation error:', error);
      toast('Failed to generate trip. Please try again.');
      setLoading(false);
    }
  }

  const SaveAiTrip = async (TripData) => {
    console.log('💾 Saving trip to Firebase...');
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const docId = Date.now().toString();
      
      console.log('User info:', user);
      console.log('Document ID:', docId);
      
      // Parse and validate trip data
      let parsedTripData;
      try {
        parsedTripData = JSON.parse(TripData);
        console.log('Parsed trip data:', parsedTripData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid trip data format');
      }
      
      // Add a new document in collection "AITrips"
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsedTripData,
        userEmail: user?.email,
        id: docId,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Trip saved to Firebase successfully');
      setLoading(false);
      
      // Navigate to view trip page
      console.log('Navigating to trip view page...');
      navigate('/view-trip/' + docId);
      
    } catch (error) {
      console.error('❌ Error saving trip:', error);
      setLoading(false);
      toast('Failed to save trip. Please try again.');
    }
  }

  // Simple name-based authentication (fallback)
  const simpleLogin = () => {
    if (!userName.trim()) {
      toast('Please enter your name');
      return;
    }
    
    const userData = {
      name: userName,
      email: `${userName.toLowerCase().replace(/\s+/g, '')}@demo.com`,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setOpenDialog(false);
    setUserName('');
    onGenerateTrip();
  }

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => {
      console.log('Google OAuth failed:', error);
      toast('Google sign-in failed. Please try with your name instead.');
    }
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      onGenerateTrip();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
    });
  }


  return (
    <div className='sm:px-10 md:px-32 lg:px-56 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>Tell us your travel preferences🏕️🌴</h2>
      <p className='mt-3 text-gray-500 text-xl'>Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.</p>

      <div className='mt-20 flex flex-col gap-10'>
        <div>
          <h2 className='text-xl my-3 font-medium'>What is destination of choice?</h2>
          <PlaceAutocomplete
            placeholder="Ex. Paris, France - Type to search destinations..."
            value={place}
            onChange={(selectedPlace) => {
              console.log('Selected place:', selectedPlace);
              if (typeof selectedPlace === 'string') {
                // User is typing
                setPlace(selectedPlace);
                handleInputChange('location', { label: selectedPlace, value: selectedPlace });
              } else {
                // User selected from dropdown
                setPlace(selectedPlace.label);
                handleInputChange('location', {
                  label: selectedPlace.label,
                  value: selectedPlace.value,
                  city: selectedPlace.city,
                  country: selectedPlace.country,
                  coordinates: { lat: selectedPlace.lat, lon: selectedPlace.lon }
                });
              }
            }}
          />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>How many days are you planning your trip?</h2>
          <Input placeholder={'Ex.4'} type='number' onChange={(e) => handleInputChange('noOfDays', e.target.value)} />
        </div>


        <div>
          <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectBudgetOptions.map((item, index) => (
              <div key={index}
                onClick={() => handleInputChange('budget', item.title)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.budget == item.title && 'shadow-lg border-black'}`}>
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>Who do you plan on traveling with on your next adventure?</h2>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectTravelList.map((item, index) => (
              <div key={index}
                onClick={() => handleInputChange('traveler', item.people)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.traveler == item.people && 'shadow-lg border-black'}`}>
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='my-10 justify-end flex'>
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Generate Trip'}
        </Button>
      </div>

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="logo" width="100px" className='items-center' />
              <h2 className='font-bold text-lg'>Sign In to create your travel plan</h2>
              
              {/* Simple Name-based Authentication */}
              <div className='mt-4'>
                <p className='text-sm text-gray-600 mb-3'>Quick Sign In - Just enter your name:</p>
                <Input 
                  placeholder="Enter your name (e.g., John Doe)" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mb-3"
                  onKeyPress={(e) => e.key === 'Enter' && simpleLogin()}
                />
                <Button
                  onClick={simpleLogin}
                  className="w-full mb-4">
                  Continue & Generate Trip
                </Button>
              </div>
              
              {/* Divider */}
              <div className='flex items-center my-4'>
                <hr className='flex-1' />
                <span className='mx-4 text-sm text-gray-500'>OR</span>
                <hr className='flex-1' />
              </div>
              
              {/* Google OAuth */}
              <p className='text-sm text-gray-600 mb-3'>Sign in with Google (if available):</p>
              <Button
                onClick={login}
                variant="outline"
                className="w-full flex gap-4 items-center">
                <FcGoogle className="h-7 w-7" />Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>


    </div>
  )
}

export default CreateTrip
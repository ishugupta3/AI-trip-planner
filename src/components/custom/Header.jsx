import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { Input } from '../ui/input';
import axios from 'axios';

function Header() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [openDialog, setOpenDialog] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    console.log(user)
  })

  // Simple name-based authentication (fallback)
  const simpleLogin = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
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
    window.location.reload();
  }

  // Google OAuth (if working)
  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => {
      console.log('Google OAuth failed:', error);
      // Fallback to simple auth
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
      window.location.reload();
    }).catch((error) => {
      console.error("Google OAuth Error: ", error);
      // Don't close dialog, let user try simple auth
    });
  }

  return (
    <div className='shadow-sm flex justify-between items-center px-6'>
      <img src="/logo.svg" alt="Logo" />
      <div>
        {user ?
          <div className='flex items-center gap-3'>
            <a href="/create-trip">
            <Button variant="outline" className="rounded-full">+ Create Trip</Button>
            </a>
            <a href="/my-trips">
            <Button variant="outline" className="rounded-full">My Trips</Button>
            </a>
            <Popover>
              <PopoverTrigger>             
                <img src={user?.picture} alt="" className='h-[35px] w-[35px] rounded-full' />
              </PopoverTrigger>
              <PopoverContent>
                <h2 className='cursor-pointer' onClick={()=>{
                  googleLogout();
                  localStorage.clear();
                  window.location.reload();
                }}>Logout</h2>
              </PopoverContent>
            </Popover>

          </div> : <Button onClick={()=>setOpenDialog(true)}>Sign In</Button>}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="logo" width="100px" className='items-center' />
              <h2 className='font-bold text-lg'>Sign In to check out your travel plan</h2>
              
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
                  Continue with Name
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

export default Header
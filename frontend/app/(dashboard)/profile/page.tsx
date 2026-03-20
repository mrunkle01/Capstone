'use client'
// This will just be a profile page
import { loadProfileInfo } from "@/lib/api/profile"
import {useEffect} from "react";
export default function Profile() {
    useEffect(()=>{
        const {user} = loadProfileInfo()
    }, [])
    return (
        <div className="flex">Profile</div>
    )
}

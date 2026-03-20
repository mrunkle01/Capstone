'use client'
// This will just be a profile page
import { loadProfileInfo } from "@/lib/api/profile"
import {useEffect} from "react";
export default function Profile() {
    useEffect(()=>{
        loadProfileInfo().then((user) => {
            console.log("user: ", user)
        })
    }, [])
    return (
        <div className="flex">Profile</div>
    )
}

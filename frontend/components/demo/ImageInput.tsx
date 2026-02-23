"use client"
import {useRef, useState} from "react";
export default function ImageInput({setImageUrl}: {setImageUrl: Function}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    return (
        <div className="flex justify-center">
            <input ref={fileInputRef} type="file" className="absolute right-[9999px]" onChange={(e)=>{
                const file = e.target.files?.[0]
                if(!file){return}
                const url = URL.createObjectURL(file) // makes the image into a url
                setImageUrl(url)
            }}/>
            <button className="bg-blue-500 px-4 py-2 text-white rounded-sm self-center font-semibold"
                    onClick={() => {
                        fileInputRef.current?.click();
                    }}>
                Upload image
            </button>
        </div>
    )
}
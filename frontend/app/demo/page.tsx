"use client"
import {useRef} from "react";

export default function Demo() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    return (
        <div className="bg-zinc-200 h-screen pt-10 flex flex-col">
            <h1 className="text-3xl text-black font-bold text-center pt-10 capitalize">
                Upload your drawing
            </h1>
            <div
                className="flex flex-wrap gap-1 p-5 bg-white w-[650px] min-h-[300px] mx-auto mt-6 mb-10 rounded-md shadow-sm"></div>
            <div className="flex justify-center">
                <input ref={fileInputRef} type="file" className="absolute right-[9999px]" onChange={(e)=>{
                    const file = e.target.files?.[0];
                    console.log(file);
                }}/>
                <button className="bg-blue-500 px-4 py-2 text-white rounded-sm self-center font-semibold"
                        onClick={() => {
                            fileInputRef.current?.click();
                        }}>
                    Upload image
                </button>
            </div>
        </div>
    );
}

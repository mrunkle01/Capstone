"use client"
import {useRef, useState} from "react";
import clsx from "clsx";
import {useRouter} from "next/navigation";

export default function ImageInput({setImageUrl}: {setImageUrl: Function}) {
    const router = useRouter()

    const section_id = 0 //made this hard coded for the demo
    const url = `${process.env.NEXT_PUBLIC_API_URL}/assess/${section_id}`

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const imgUrl = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imgFile = useRef<File | null>(null);

    const handleSubmit = async () => {
        if (!imgFile.current) {return}
        const formData = new FormData();
        try {
            formData.append("image", imgFile.current)

            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 2000)); //TODO DELETE
            const data = {
                score: 72,
                feedback: "Your line work is good but shading needs improvement",
                report_id: 1
            }
            localStorage.setItem("assessmentResult", JSON.stringify(data));
            localStorage.setItem("imageUrl", imgUrl.current ?? "");
            // const response = await fetch(url, {
            //     method: "POST",
            //     body: formData,
            // })
            // const data = await response.json();
            // localStorage.setItem("assessmentResult", JSON.stringify(data));
            // localStorage.setItem("imageUrl", imgUrl.current ?? "");

            router.push(`/demo/results`);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-center">
            <input ref={fileInputRef} type="file" className="absolute right-[9999px]" onChange={(e)=>{
                const file = e.target.files?.[0]
                if(!file){return}
                const img_url = URL.createObjectURL(file)
                setImageUrl(img_url)
                imgUrl.current = img_url;
                imgFile.current = file;
            }}/>
            <button className="bg-blue-400 px-4 py-2 mx-1 text-white rounded-sm self-center font-semibold"
                    onClick={() => {
                        fileInputRef.current?.click();
                    }}>
                Upload image
            </button>
            <button disabled={isLoading} className={clsx(
                "px-4 py-2 text-white rounded-sm self-center font-semibold",
                isLoading ? "bg-gray-500" : imgFile.current ? "bg-orange-400" : "bg-orange-200"
            )}
                    onClick={handleSubmit}>
                {isLoading && <p>Loading...</p>}
                {!isLoading && <p>Submit For Grading</p>}
            </button>
        </div>
    )
}
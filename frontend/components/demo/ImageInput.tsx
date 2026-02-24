"use client"
import {useRef, useState} from "react";
import clsx from "clsx";
import {useRouter} from "next/navigation";
import assessImage from "@/lib/api/assessment"

export default function ImageInput({ setImageUrl }: { setImageUrl: (url: string) => void }) {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const imgUrl = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imgFile = useRef<File | null>(null);

    const handleSubmit = async () => {
        if (!imgFile.current) { return }

        try {
            const formData = new FormData();
            formData.append("image", imgFile.current)
            setIsLoading(true);
            // const data = await assessImage(formData) TODO UNCOMMENT
            //FAKE DATA
            await new Promise(resolve => setTimeout(resolve, 2000));
            const data = {
                score: 72,
                feedback: "Your line work is good but shading needs improvement",
                report_id: 1
            }
            //END OF FAKE DATA
            localStorage.setItem("assessmentResult", JSON.stringify(data));
            localStorage.setItem("imageUrl", imgUrl.current ?? "");
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
            <button className="btn-primary bg-blue-400"
                    onClick={() => fileInputRef.current?.click()}>
                Upload image
            </button>
            <button disabled={isLoading}
                    className={clsx(
                        "btn-primary",
                        isLoading ? "bg-gray-500" : imgFile.current ? "bg-orange-400" : "bg-orange-200"
                    )}
                    onClick={handleSubmit}>
                {isLoading ? <p>Loading...</p> : <p>Submit For Grading</p>}
            </button>
        </div>
    )
}
"use client"
import {useRef, useState} from "react";
import clsx from "clsx";
import {useRouter} from "next/navigation";
import { assessImage, testImage } from "@/lib/api/assessment"

export default function ImageInput({ setImageUrl }: { setImageUrl: (url: string) => void }) {
    const router = useRouter()

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const imgUrl = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imgFile = useRef<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) { return }
        const img_url = URL.createObjectURL(file)
        setImageUrl(img_url)
        imgUrl.current = img_url;
        imgFile.current = file;
    }
    const handleSubmit = async () => {
        if (!imgFile.current) { return }
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", imgFile.current)
            setIsLoading(true);
            // const data = await assessImage(formData) TODO UNCOMMENT AND DELETE FAKE
            // FAKE DATA
            // await new Promise(resolve => setTimeout(resolve, 2000));
            // const data = {
            //     score: 72,
            //     feedback: "Your line work is good but shading needs improvement",
            //     report_id: 1
            // }
            const data = await testImage(formData);
            //END OF FAKE DATa
            localStorage.setItem("assessmentResult", JSON.stringify(data));
            localStorage.setItem("imageUrl", imgUrl.current ?? "");
            router.push(`/demo/results`);
        } catch (error) {
            setError("Something went wrong. Please try again.")
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex">
                <input ref={fileInputRef} type="file" className="absolute right-[9999px]" onChange={handleInputChange}/>
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
            {error && (
                <p className="error-message">{error}</p>
            )}
        </div>
    )
}
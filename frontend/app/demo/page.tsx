'use client'
import ImageInput from "@/components/demo/ImageInput";
import "./demo-styles.css"
import {useState} from "react";
import Image from "next/image";

export default function Demo() {
    const [imageURL, setImageURL] = useState<string | null>(null);
    return (
        <div className="main-box">
            <h1 className="header-1">
                Upload your drawing
            </h1>
            <div className="image-input">
                {imageURL && (<Image
                    className={"preview-image"}
                    src={imageURL}
                    alt="user inputted image"
                    width={350} height={280}
                />
                )}
            </div>
            <ImageInput setImageUrl={setImageURL}/>
        </div>
    );
}

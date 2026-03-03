'use client'
import ImageInput from "@/components/demo/ImageInput";
import {useState} from "react";
import Image from "next/image";

export default function Demo() {
    const [imageURL, setImageURL] = useState<string | null>(null);
    return (
        <div className="main-box">
            <h1 className="header-1">
                Upload your drawing
            </h1>
            <p className="prompt-description">
                Prompt: Draw a basic sketch demonstrating line, shape, and shading.
            </p>
            <div className="image-input">
                {imageURL && (<Image
                    className={"preview-image"}
                    src={imageURL}
                    alt="user inputted image"
                    width={350} height={280}
                    style={{ width: '100%', maxWidth: 350, height: 'auto' }} //makes the image mobile friendly
                />
                )}
            </div>
            <ImageInput setImageUrl={setImageURL}/>
        </div>
    );
}

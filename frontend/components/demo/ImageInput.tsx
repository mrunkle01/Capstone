"use client"
import {useRef, useState, type MutableRefObject} from "react";
import {useRouter} from "next/navigation";
import { testImage } from "@/lib/api/assessment"
import styles from "./ImageInput.module.css"

interface ImageInputProps {
    setImageUrl: (url: string) => void;
    onFileSelected?: (hasFile: boolean) => void;
    submitRef?: MutableRefObject<(() => void) | null>;
}

export default function ImageInput({ setImageUrl, onFileSelected, submitRef }: ImageInputProps) {
    const router = useRouter()

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasFile, setHasFile] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const imgUrl = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imgFile = useRef<File | null>(null);

    const processFile = (file: File) => {
        const img_url = URL.createObjectURL(file)
        setImageUrl(img_url)
        imgUrl.current = img_url;
        imgFile.current = file;
        setPreviewUrl(img_url);
        setHasFile(true);
        onFileSelected?.(true);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) { return }
        processFile(file);
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        processFile(file);
    }

    const handleSubmit = async () => {
        if (!imgFile.current) { return }
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", imgFile.current)
            setIsLoading(true);
            const data = await testImage(formData);
            localStorage.setItem("assessmentResult", JSON.stringify(data));
            localStorage.setItem("imageUrl", imgUrl.current ?? "");
            router.push(`/demo/1/results`);
        } catch (error) {
            setError("Something went wrong. Please try again.")
            setIsLoading(false);
        }
    }

    // Expose handleSubmit to parent via ref
    if (submitRef) {
        submitRef.current = handleSubmit;
    }

    return (
        <div className={styles.wrapper}>
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${hasFile ? styles.hasFile : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenInput}
                    onChange={handleInputChange}
                />
                <div className={styles.uploadIcon}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </div>
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className={styles.preview} />
                        <div className={styles.uploadSub}>Click to change image</div>
                    </>
                ) : (
                    <>
                        <div className={styles.uploadMain}>Upload your drawing</div>
                        <div className={styles.uploadSub}>Click to select or drag and drop</div>
                        <div className={styles.uploadNote}>JPG, PNG up to 10MB</div>
                    </>
                )}
            </div>
            {isLoading && <div className={styles.loadingMsg}>Submitting...</div>}
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    )
}
import ImageInput from "@/components/demo/ImageInput";
import "./demo-styles.css"

export default function Demo() {
    return (
        <div className="main-box">
            <h1 className="header-1">
                Upload your drawing
            </h1>
            <div className="image-input"></div>
            <ImageInput/>
        </div>
    );
}

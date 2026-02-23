
import ImageInput from "@/app/demo/components/ImageInput";

export default function Demo() {
    return (
        <div className="bg-zinc-200 h-screen pt-10 flex flex-col">
            <h1 className="text-3xl text-black font-bold text-center pt-10 capitalize">
                Upload your drawing
            </h1>
            <div
                className="flex flex-wrap gap-1 p-5 bg-white w-[650px] min-h-[300px] mx-auto mt-6 mb-10 rounded-md shadow-sm"></div>
            <ImageInput/>
        </div>
    );
}

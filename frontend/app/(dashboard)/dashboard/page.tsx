import { SectionResponse } from "@/lib/types/dashboard";
import { loadSections } from "@/lib/api/dashboard";
import Greeting from "@/components/dashboard/Greeting";
import LessonList from "@/components/dashboard/LessonList";

export default async function Dashboard() {
    let sectionInfo: SectionResponse;
    try {
        sectionInfo = await loadSections();
    } catch (error) {
        console.log(error);
        return (
            <div className="d-main flex items-center justify-center">
                <div className="text-[#6B6A60]">Failed to load dashboard</div>
            </div>
        );
    }
    return (
        <div className="d-main">
            <Greeting />
            <LessonList sectionInfo={sectionInfo} />
        </div>
    );
}

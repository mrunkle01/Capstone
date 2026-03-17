import {SectionResponse} from "@/lib/types/dashboard";
import {loadSections} from "@/lib/api/dashboard";
import LessonList from "@/components/dashboard/LessonList";
import Greeting from "@/components/dashboard/Greeting";


export default async function Dashboard() {
    let sectionInfo: SectionResponse

    try {
        sectionInfo = await loadSections()
    } catch (error) {
        return <div>Failed to load dashboard</div>
    }
    return(
        <div className="p-6 max-w-3xl">
           <Greeting/>
           <LessonList sectionInfo = {sectionInfo}/>
        </div>
    )
}
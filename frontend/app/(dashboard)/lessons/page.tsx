// I'm not sold on this endpoint, I feel it should have a [lessonId] directory and fetch that lesson
// Maybe want to rethink this directory to be more like Section/SectionID/LessonId for that specific lesson
export default function Lessons(){
    return (
        <div className="flex flex-row">Current Lesson</div>
    )
}
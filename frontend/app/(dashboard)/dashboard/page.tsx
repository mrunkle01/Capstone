import {mockDashboardData, User, Lesson} from "@/lib/types/dashboard";

export default function Dashboard() {
    console.log("Starting Dashboard");
    //need to fetch here to get the data
    console.log(mockDashboardData)
    const user: User = mockDashboardData.user
    const lessons: Lesson[] = mockDashboardData.sections[0].lessons


    return(
        <div>
            <div className="greetings">
                <div>Hey! {user.username}</div>
                <div>Goal: {user.goal}</div>
                <div>Time Commitment: {user.timeCommitment}</div>
            </div>
            <div className="section">
                <ul>
                {mockDashboardData &&
                    lessons.map((lesson, index) => (
                    <li key={index} className="m-2">
                        <h3>Title: {lesson.title}</h3>
                        <h4>Prompt: {lesson.content}</h4>
                        <h4>Is done? {lesson.status}</h4>
                    </li>
                ))}
                </ul>
            </div>
        </div>

    )
}
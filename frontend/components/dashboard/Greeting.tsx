export default function Greeting(){
    //TODO Hard coded user for now later will be rendered in Greeting component
    //use profile backend
    const user = {
        username: "Mark",
        goal: "Manga",
        timeCommitment: "1Hr/day"
    }
    return (
        <div className="p-4 border rounded mb-4">
            <div className="text-lg font-semibold">Hey! {user.username}</div>
            <div>Goal: {user.goal}</div>
            <div>Time Commitment: {user.timeCommitment}</div>
        </div>
    )
}
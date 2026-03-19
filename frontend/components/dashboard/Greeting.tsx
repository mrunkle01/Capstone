export default function Greeting() {
    // TODO: Hard coded user for now, later will use profile backend
    const user = {
        username: "Mark",
        goal: "Manga",
        timeCommitment: "1Hr/day",
    };

    return (
        <div>
            <div className="d-label-row">
                <div className="d-gold-dash" />
                <span className="d-label-text">YOUR CURRICULUM</span>
            </div>
            <h1 className="d-welcome">Welcome back, {user.username}.</h1>
        </div>
    );
}

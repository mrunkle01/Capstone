export default function SectionPlaceholder({ order }: { order: number }) {
    const sectionNum = String(order).padStart(2, "0");
    return (
        <div className="d-section-bar d-section-bar-future" aria-hidden="true">
            <div className="d-section-bar-left">
                <span className="d-section-num">{sectionNum}</span>
                <span className="d-current-title" style={{ color: "#9B9889" }}>Upcoming section</span>
                <span className="d-status-pill d-pill-locked">Coming soon</span>
            </div>
        </div>
    );
}

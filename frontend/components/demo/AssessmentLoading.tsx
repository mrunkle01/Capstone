import styles from "./AssessmentLoading.module.css";

interface AssessmentLoadingProps {
    imageUrl?: string | null;
}

export default function AssessmentLoading({ imageUrl }: AssessmentLoadingProps) {
    return (
        <div className={styles.container}>
            {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Your submitted drawing" className={styles.thumbnail} />
            )}
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} />
                <div className={styles.heading}>Grading your drawing&hellip;</div>
                <div className={styles.sub}>
                    Our AI is analyzing line, shape, and shading. This usually takes
                    10&ndash;30 seconds &mdash; please don&apos;t close the page.
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";

function useTypewriter(text, { typingSpeed = 60, deletingSpeed = 30, pauseTime = 1800 } = {}) {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;

        if (!isDeleting && displayText === text) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && displayText === "") {
            timeout = setTimeout(() => setIsDeleting(false), 400);
        } else {
            const nextText = isDeleting
                ? text.slice(0, displayText.length - 1)
                : text.slice(0, displayText.length + 1);

            timeout = setTimeout(
                () => setDisplayText(nextText),
                isDeleting ? deletingSpeed : typingSpeed
            );
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, text, typingSpeed, deletingSpeed, pauseTime]);

    return displayText;
}

export default useTypewriter;
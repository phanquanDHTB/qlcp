import { useEffect } from "react";
import { useState } from "react";

const useDebounce = (value: string, delay: number) => {
    const [debounceValue, setDebounceValue] = useState(value);
    useEffect(() => {
        const handleDebounce = setTimeout(() => setDebounceValue(value), delay);
        return () => clearTimeout(handleDebounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return debounceValue;
};

export default useDebounce;

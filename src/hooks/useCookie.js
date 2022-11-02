import { useState, useMemo, useCallback } from 'react';
import Cookie from 'js-cookie';

const useCookie = (key, defaultValue = false, expires = 3650 ) => {
    const initialValue = useMemo(() => Cookie.get(key) || defaultValue, [key, defaultValue]);
    const [value, setValue] = useState(initialValue);

    const setCookieValue = useCallback((newValue) => {
        setValue(newValue);
        Cookie.set(key, newValue, { expires });
    }, [key, setValue, expires]);
    
    return [value, setCookieValue];
}

export default useCookie;
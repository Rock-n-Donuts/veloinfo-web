import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { v1 as uuidv1 } from 'uuid';
import Cookie from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const deviceId = useMemo(() => {
        let id = Cookie.get('deviceId') || null;
        if (id === null) {
            id = Cookie.set('deviceId', uuidv1(), { expires: 3650 });
        }
        return id;
    }, []);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // console.log('Getting user...');
        axios
            .request({
                url: '/auth',
                method: 'post',
                data: {
                    uuid: deviceId,
                },
            })
            .then((res) => {
                const { data = null } = res || {};
                const { token = null } = data || {};
                axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
                // console.log('Got user.', data);
                setUser(data);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [deviceId]);

    return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error('useAuth can only be used inside AuthProvider');
    }
    return ctx;
};

export const useUser = () => {
    const auth = useAuth();
    const { user } = auth || {};
    return user;
};

export const useToken = () => {
    const user = useUser();
    const { token } = user || {};
    return token || null;
};

export default AuthContext;

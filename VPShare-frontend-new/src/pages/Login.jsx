import React from 'react';
import { SignInFlow } from '../components/ui/SignInFlow';
import SEO from '../components/SEO';
import { getSEOForPage } from '../utils/seo';

const Login = () => {
    return (
        <>
            <SEO {...getSEOForPage('login')} />
            <SignInFlow />
        </>
    );
};

export default Login;

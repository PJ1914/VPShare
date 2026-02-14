import React from 'react';
import { AuthUI } from '../components/ui/AuthFuse';
import SEO from '../components/SEO';
import { getSEOForPage } from '../utils/seo';

const Signup = () => {
    return (
        <>
            <SEO {...getSEOForPage('signup')} />
            <AuthUI />
        </>
    );
};

export default Signup;

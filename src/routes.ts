export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    PREDICTION: '/prediction',
    ACTIVITIES: '/activities',
    PLANS: '/plans',

    // Dynamic Routes Helpers
    COURSE: (code: string) => `/${code}`,
    GRADES: (code: string) => `/${code}/grades`,
    FLOW: (code: string) => `/${code}/cronograma`,
};

export default ROUTES;

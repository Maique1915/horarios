import { loadCoursesRegistry } from '../../../services/disciplinaService';
import ClassManager from '../../../components/ClassManager';

// Static generation params
export async function generateStaticParams() {
    try {
        const courses = await loadCoursesRegistry();
        if (!courses || courses.length === 0) {
            console.warn('Warning: No courses found for static params generation.');
            return [];
        }
        return courses
            .filter(course => course._cu && typeof course._cu === 'string')
            .map((course) => ({
                cur: course._cu,
            }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function Page({ params }) {
    const { cur } = await params;
    return <ClassManager cur={cur} />;
}

import { loadCoursesRegistry } from '../../../services/disciplinaService';
import ClassManager from '../../../components/ClassManager';

// Static generation params
export async function generateStaticParams() {
    try {
        const courses = await loadCoursesRegistry();
        return courses.map((course) => ({
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

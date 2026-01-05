
import { loadCoursesRegistry } from '../../../services/disciplinaService';
import GradesClient from './GradesClient';

export async function generateStaticParams() {
    try {
        const courses = await loadCoursesRegistry();
        return courses.map((course: any) => ({
            cur: course._cu,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default function GradesPage() {
    return <GradesClient />;
}

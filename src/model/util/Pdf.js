import ReactDOM from 'react-dom/client'
import * as html2pdf from 'html2pdf.js'

function salva(children) {
    const containerElement = document.createElement('div');

    ReactDOM.createRoot(containerElement).render(children);
    console.log(containerElement)
    const opt = {
        margin: [5, 5, 0, 5],
        filename: 'grade',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { dpi: 300, letterRendering: true, scale: 5 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css'] }
    }

    html2pdf().set(opt).from(containerElement).save()
}
export default salva;

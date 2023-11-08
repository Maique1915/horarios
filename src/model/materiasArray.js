import Materias from '../model/Materias'


class MateriasArray{

materias = []
matriz = []

	constructor(){
		/*
		this.materias.push(new Materias(null, "Animação Digital", 1 , 3 , ["1C", "1E", "1G"] , false , "Animação Digital" ))
		this.materias.push(new Materias(null, "Visualização de Dados", 0 , 3 , ["2C", "2F", "3F"] , false , "Visualização de Dados"))
		this.materias.push(new Materias(null, "Ciência e Tecnologia dos Materiais", 2 , 0 , ["2D", "Química Geral"] , false , "Ciência e Tecnologia dos Materiais"))
		this.materias.push(new Materias(null, "Competições de Programação", 0 , 4 , ["3E"] , false , "Competições de Programação"))
		this.materias.push(new Materias(null, "Criptografia", 2 , 2 , ["3E"] , false , "Criptografia"))
		this.materias.push(new Materias(null, "Desenho Técnico", 0 , 2 , ["1A", "1C"] , false , "Desenho Técnico"))
		this.materias.push(new Materias(null, "Fenômenos de Transporte", 3 , 0 , ["3B", "3C", "4A"], false , "Fenômenos de Transporte"))
		this.materias.push(new Materias(null, "Introdução à Mecânica dos Sólidos", 2 , 0 , ["2D", "3B", "4A"] , false , "Introdução à Mecânica dos Sólidos"))
		this.materias.push(new Materias(null, "Introdução à Prog. para Dispositivos Móveis", 0 , 2 , ["1E", "1G"] , false , "Introdução à Prog. para Dispositivos Móveis"))
		this.materias.push(new Materias(null, "Libras I", 3 , 0 , [] , false , "Libras I"))
		this.materias.push(new Materias(null, "Mineração de Dados", 3 , 1 , ["4F"] , false , "Mineração de Dados"))
		this.materias.push(new Materias(null, "Nanociência e Nanotecnologia", 3 , 0 , ["2D"] , false , "Nanociência e Nanotecnologia"))
		this.materias.push(new Materias(null, "Organização do Trabalho e Normas", 2 , 0 , [] , false , "Organização do Trabalho e Normas"))
		this.materias.push(new Materias(null, "Programação em Python", 2 , 2 , ["1E"] , false , "Programação em Python"))
		this.materias.push(new Materias(null, "Programação Orientada a Objetos usando C++", 2 , 2 , ["5G"] , false , "Programação Orientada a Objetos usando C++"))
		this.materias.push(new Materias(null, "Química Geral", 4 , 2 , [] , false , "Química Geral"))
		this.materias.push(new Materias(null, "Redes sem Fio", 1 , 1 , ["6C"] , false , "Redes sem Fio"))
		this.materias.push(new Materias(null, "Monitoria I", 2 , 0 , [] , false , "Monitoria I"))
		this.materias.push(new Materias(null, "Segurança de Redes de Computadores I", 1 , 1 , ["5C"] , false , "Segurança de Redes de Computadores I"))
		this.materias.push(new Materias(null, "Monitoria II", 2 , 0 , ["Monitoria I"] , false , "Monitoria II"))
		this.materias.push(new Materias(null, "Tópicos Complementares em Pré-Cálculo", 0 , 2 , [] , false , "Tópicos Complementares em Pré-Cálculo"))
		this.materias.push(new Materias(null, "Monitoria III", 2 , 0 , ["Monitoria II"] , false , null ))
		this.materias.push(new Materias(null, "Tópicos Especiais em Inteligência Artificial", 4 , 0 , ["2F", "3B"] , false , null ))
		this.materias.push(new Materias(null, "Monitoria IV", 2 , 0 , ["Monitoria III"] , false , null ))
		this.materias.push(new Materias(null, "Tópicos Especiais em Otimização", 4 , 0 , [], false , null ))
		this.materias.push(new Materias(null, "Iniciação Científica I", 2 , 0 , [] , false , null ))
		this.materias.push(new Materias(null, "Tópicos Especiais em Programação", 2 , 2 , ["4F", "5G"] , false , null ))
		this.materias.push(new Materias(null, "Iniciação Científica II", 2 , 0 , ["Iniciação Científica I"] , false , null ))
		this.materias.push(new Materias(null, "Tópicos Especiais em Sistemas Digitais", 3 , 0 , ["1F"] , false , null ))
		this.materias.push(new Materias(null, "Iniciação Científica III", 2 , 0 , ["Iniciação Científica II"], false , null ))
		this.materias.push(new Materias(null, "Virtualização de Servidores", 0 , 2 , ["5B", "5C"] , false , null ))
		this.materias.push(new Materias(null, "Iniciação Científica IV", 2 , 0 , ["Iniciação Científica III"] , false , null ))
		*/

		this.materias.push(new Materias(1, "Introdução a Engenharia", 2 , 0 , [] , true , "1A"))
		this.materias.push(new Materias(1, "Administração e Organização Empresarial", 2 , 0 , [] , true , "1B"))
		this.materias.push(new Materias(1, "Geometria Analítica", 3 , 0 , [] , true , "1C"))
		this.materias.push(new Materias(1, "Pré-Cálculo", 3 , 0 , [] , true , "1D"))
		this.materias.push(new Materias(1, "Introdução a Ciência da Computação", 3 , 0 , [] , true , "1E"))
		this.materias.push(new Materias(1, "Lógica para Computação", 3 , 0 , [] , true , "1F"))
		this.materias.push(new Materias(1, "Projeto de Interação", 2 , 0 , [] , true , "1G"))
		this.materias.push(new Materias(1, "Leitura e Produção de Textos", 2 , 0 , [] , true , "1H"))

		this.materias.push(new Materias(2, "Ética Profissional", 2 , 0 , [] , true , "2A"))
		this.materias.push(new Materias(2, "Cálculo a uma Variável", 5 , 0 , ["1C", "1D"] , true , "2B"))
		this.materias.push(new Materias(2, "Álgebra Linear", 4 , 0 , ["1A", "1C", "1D"] , true , "2C"))
		this.materias.push(new Materias(2, "Mecânica Clássica", 3 , 2 , ["1D"] , true , "2D"))
		this.materias.push(new Materias(2, "Estruturas Discretas", 4 , 0 , ["1D", "1E"] , true , "2E"))
		this.materias.push(new Materias(2, "Introdução a Programação", 2 , 2 , ["1E", "1F"] , true , "2F"))
		this.materias.push(new Materias(2, "Introdução a Economia", 2 , 0 , ["1A"] , true , "2G"))

		this.materias.push(new Materias(3, "Introdução a Engenharia Ambiental", 2 , 0 , ["1A"] , true , "3A"))
		this.materias.push(new Materias(3, "Cálculo a várias Variáveis", 5 , 0 , ["2B"] , true , "3B"))
		this.materias.push(new Materias(3, "Termodinâmica", 2 , 2 , ["2B", "2D"] , true , "3C"))
		this.materias.push(new Materias(3, "Software Básico", 4 , 0 , ["2F"] , true , "3D"))
		this.materias.push(new Materias(3, "Algoritmos e Estruturas de Dados I", 4 , 2 , ["2E", "2F"] , true , "3E"))
		this.materias.push(new Materias(3, "Modelagem de Dados", 2 , 0 , ["1E"] , true , "3F"))
		this.materias.push(new Materias(3, "Humanidades e Ciências Sociais", 2 , 0 , ["2A"] , true , "3G"))

		this.materias.push(new Materias(4, "Equações Diferenciais Ordinárias I", 4 , 0 , ["2B", "2C"] , true , "4A"))
		this.materias.push(new Materias(4, "Eletromagnetismo", 3 , 2 , ["2D", "3B"] , true , "4B"))
		this.materias.push(new Materias(4, "Redes de Computadores I", 4 , 0 , ["1D", "2F"] , true , "4C"))
		this.materias.push(new Materias(4, "Arquitetura de Computadores", 4 , 2 , ["3D"] , true , "4D"))
		this.materias.push(new Materias(4, "Algoritmos e Estruturas de Dados II", 4 , 2 , ["3E"] , true , "4E"))
		this.materias.push(new Materias(4, "Banco de Dados", 2 , 2 , ["2F", "3F"] , true , "4F"))

		this.materias.push(new Materias(5, "Probabilidade e Estatística", 3 , 0 , ["2B"] , true , "5A"))
		this.materias.push(new Materias(5, "Sistemas Operacionais", 4 , 0 , ["4D"] , true , "5B"))
		this.materias.push(new Materias(5, "Circuitos Lineares", 4 , 0 , ["4A", "4B"] , true , "5D"))
		this.materias.push(new Materias(5, "Redes de Computadores II", 4 , 0 , ["4C"] , true , "5C"))
		this.materias.push(new Materias(5, "Cálculo Numérico", 3 , 1 , ["2E", "2F", "3B"] , true , "5E"))
		this.materias.push(new Materias(5, "Engenharia de Software", 2 , 0 , ["2F"] , true , "5F"))
		this.materias.push(new Materias(5, "Programação Orientada a Objetos", 3 , 3 , ["3E"] , true , "5G"))

		this.materias.push(new Materias(6, "Sinais e Sistemas", 4 , 0 , ["2C", "2A"] , true , "6A"))
		this.materias.push(new Materias(6, "Ondulatória e Física Moderna", 2 , 2 , ["2D", "3B"] , true , "6B"))
		this.materias.push(new Materias(6, "Servidores de Redes", 4 , 0 , ["5C"] , true , "6C"))
		this.materias.push(new Materias(6, "Lab. de Circuitos Elétricos e Eletrônicos", 0 , 2 , ["5D"] , true , "6D"))
		this.materias.push(new Materias(6, "Eletrônica Analógica", 4 , 0 , ["5D"] , true , "6E"))
		this.materias.push(new Materias(6, "Linguagens Formais e Autômatos", 3 , 0 , ["2E", "2F"] , true , "6F"))
		this.materias.push(new Materias(6, "Análise de Algoritmos", 4 , 0 , ["4E"] , true , "6G"))

		this.materias.push(new Materias(7, "Técnicas Digitais", 4 , 2 , ["6D", "6E"] , true , "7A"))
		this.materias.push(new Materias(7, "Programação Linear", 4 , 0 , ["5E"] , true , "7B"))
		this.materias.push(new Materias(7, "Processamento Digital de Sinais", 4 , 0 , ["6A"] , true , "7C"))
		this.materias.push(new Materias(7, "Metodologia Científica", 2 , 0 , [162] , true , "7D"))

		this.materias.push(new Materias(8, "Sistemas Distribuídos", 2 , 2 , ["3E", "5B", "5C"] , true , "8A"))
		this.materias.push(new Materias(8, "Microcontroladores e Sistemas Embarcados", 2 , 2 , ["3D", "7A"] , true , "8B"))
		this.materias.push(new Materias(8, "Sistemas Inteligentes", 4 , 0 , ["3E", "5A"] , true , "8C"))
		this.materias.push(new Materias(8, "Computação Gráfica", 0 , 3 , ["2C", "5G"] , true , "8D"))
		this.materias.push(new Materias(8, "Sistemas de Controle", 4 , 0 , ["6E"] , true , "8E"))

		this.materias.push(new Materias(9, "Computação de Alto Desempenho", 2 , 2 , ["4E", "8A"] , true , "9A"))
		this.materias.push(new Materias(9, "Trabalho de Conclusão de Curso I", 2 , 0 , ["7D"] , true , "9B"))
		this.materias.push(new Materias(9, "Estágio Supervisionado", 0 , 0 , [140] , true , "9C"))

		this.materias.push(new Materias(10, "Trabalho de Conclusão de Curso II", 2 , 0 , ["9B"] , true , "10A"))

		this.materias.sort(this.compare)


		this.opc = []
		this.opc.push({sem:1, mat:["Introdução a Engenharia","Administração e Organização Empresarial", "Geometria Analítica", "Pré-Cálculo", "Introdução a Ciência da Computação", "Lógica para Computação", "Projeto de Interação", "Leitura e Produção de Textos"]})
		this.opc.push({sem:2, mat:["Ética Profissional", "Cálculo a uma Variável", "Álgebra Linear", "Mecânica Clássica", "Estruturas Discretas", "Introdução a Programação", "Introdução a Economia"]})
		this.opc.push({sem:3, mat:["Introdução a Engenharia Ambiental", "Cálculo a várias Variáveis", "Termodinâmica", "Software Básico", "Algoritmos e Estruturas de Dados I", "Modelagem de Dados", "Humanidades e Ciências Sociais"]})
		this.opc.push({sem:4, mat:["Equações Diferenciais Ordinárias I", "Eletromagnetismo", "Redes de Computadores I", "Arquitetura de Computadores", "Algoritmos e Estruturas de Dados II", "Banco de Dados"]})
		this.opc.push({sem:5, mat:["Probabilidade e Estatística", "Sistemas Operacionais", "Circuitos Lineares", "Redes de Computadores II", "Cálculo Numérico", "Engenharia de Software", "Programação Orientada a Objetos"]})
		this.opc.push({sem:6, mat:["Sinais e Sistemas", "Ondulatória e Física Moderna", "Servidores de Redes", "Lab. de Circuitos Elétricos e Eletrônicos", "Eletrônica Analógica", "Linguagens Formais e Autômatos", "Análise de Algoritmos"]})
		this.opc.push({sem:7, mat:["Técnicas Digitais", "Programação Linear", "Processamento Digital de Sinais", "Metodologia Científica"]})
		this.opc.push({sem:8, mat:["Sistemas Distribuídos", "Microcontroladores e Sistemas Embarcados", "Sistemas Inteligentes", "Computação Gráfica", "Sistemas de Controle"]})
		this.opc.push({sem:9, mat:["Computação de Alto Desempenho", "Trabalho de Conclusão de Curso I", "Estágio Supervisionado"]})
		this.opc.push({sem:10,mat:["Trabalho de Conclusão de Curso II"]})
}
	compare(a, b){
		let i = a.semestre
		let j = b.semestre
		return j == null? -1:i < j? -1: i > j ? 1: 0
	}

}
export default MateriasArray

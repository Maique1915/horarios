import React from 'react';
import '../model/util/css/Matricular.css'
import {cursos, horarios, dimencao, ativas } from '../model/Filtro'
import * as html2pdf from 'html2pdf.js'
import { Link } from 'react-router-dom';

const cores = ["l0","l1","l2","l3","l4","l5","l6","l7","l8","l9", "l10"] 
const s = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const c = {"engcomp":"Engenharia de computação", "fisica":"Física", "turismo":"Turismo", "matematica":"Matemática"}
class Comum extends React.Component{

	constructor(props){
		super(props)
		this.state = { b: 0, ind:0, id: 0, se: props.separa, desc: null }
		this.arr = props.materias
		this.t = props.tela
		this.f = props.f
		this.g = props.g
		this.fun = props.fun
		this.cur = props.cur === undefined ? "engcomp" : props.cur
		this.next = this.next.bind(this);
		this.selected = this.selected.bind(this);
		this.selects = this.selects.bind(this);
		this.b = 0
	}

	inicia() {
		this.getCurso()
		this.grade()
		this.passo = [...this.quadros].splice(0, this.quadros.length > 10 ? 10 : this.quadros.length)
		this.h1 = horarios(this.cur)
		this.j = 0
		this.i = 0
		
		this.indices(0)
	}

	getCurso() {
		let a = window.location.href.split("/")[3]
		if (a !== this.cur && a !== "") {
			this.cur = a
		}
	}

	componentDidUpdate(prevProps, prevState) {
		this.getCurso()
	}

	indices(b){
		this.passo = []
		for (let i = b; i < b + 10 && i < this.quadros.length; i++)
			this.passo.push(this.quadros[b + i])
	}

	grade() {
		const arr = []
		const cor = []
		const bd = [...this.arr]
		
		const [th, td] = dimencao(this.cur)
		let aux = this.state.se ? this.separa(bd): bd
		this.td = td
		this.s = s.slice(0,td)
		const m = Array(td).fill("")
		const m2 = Array(th).fill("")
		for (const a of aux) {
			const cl = Array.from(m2, () => Array.from(m))
			const v = Array.from(m2, () => Array.from(m))
			const r = Math.floor(Math.random() * cores.length)
			
			for (const b in a) {
				
				const opt = a[b]._el === false && !a[b]._di.includes(" - OPT") ? " - OPT" : "";
				for (let c = 0; c < td; c++) {
					for (let d = 0; d < th; d++) {
						if (a[b]._ho[c]) {
							if (a[b]._ho[c][d]) {
								if (v[d][c] === "" || v[d][c] === undefined) v[d][c] = a[b]._di + opt
								else v[d][c] += " / " + a[b]._di + opt
								cl[d][c] = cores[(parseInt(b) + r) % cores.length]
							}
						}
					}
				}
			}
			arr.push(v);
			cor.push(cl);
		}

		this.quadros = arr
		this.cor = cor
	}

	separa(arr) {
		let aux = [];
		let aux2 = [];
		let count = 1;

		for (const i of arr) {
			if (i._se !== count) {
				count = i._se;
				aux.push(aux2);
				aux2 = [];
			}
			aux2.push(i);
		}

		aux.push(aux2);
		return aux.filter(e => e.some(elemento => elemento !== undefined && elemento !== null));
	}

	salva(){
		// Cria uma nova div
		const slide = document.createElement('div');
		const tela = document.createElement('div');

		// Adiciona uma classe à nova div
		slide.classList.add('slides2');

		const root = document.querySelector(".seila2")
		// Fazer uma cópia do elemento
		const elementoCopiado = root.cloneNode(true);

		// Anexar a cópia a algum lugar no DOM (por exemplo, ao final do corpo do documento)
		const elementoTexto = elementoCopiado.querySelector('.intervalo');
		// Selecionar o elemento que contém o texto "4ª Grade possível"
	    elementoTexto.textContent = "Grade";

		// Insere a nova div interna dentro da div externa
		slide.appendChild(elementoCopiado);
		tela.appendChild(slide);
		
		const options = {
			margin: [10,10,10,10],
			filename: "Grade.pdf",
			html2canvas:{scale: 5},
			jsPDF: { unit: "mm", format: "A4", orientation: "landscape"}
		}

		// Centralize o conteúdo
		tela.style.textAlign = "center"; // Centralize horizontalmente
		tela.style.display = "flex";
		tela.style.flexDirection = "column";
		tela.style.width = "100%";
		tela.style.height = "100vh";
		tela.style.justifyContent = "center"; // Centralize verticalmente
		tela.style.alignItems = "center"; // Centralize verticalmente
		tela.style.margin = "auto"; /// Centralize verticalmente
		slide.style.margin = "auto"; /// Centralize verticalmente

		html2pdf().set(options).from(tela).save()
	}

	isChecked(i, j){
		const id = "t_"+i+"_"+j
		return <input type="checkbox" className="t_mat2" onClick={(e)=>{this.atualiza(i, j, e.target)}} name={id} id={id} value={id} />
	}

	primeiro(n){
		this.setState({id: n-1})
	}

	selected(e){
		let checkbox = document.getElementById('section1')
		checkbox.checked = false
		const arr = Object.entries(c).filter(item => {
			if (item[1] === e.target.innerText)
				return true
			return false
		})[0]
		this.cur = arr[0]
		this.arr = ativas(this.cur)
		this.primeiro(this.state.id > this.quadros.length ? this.quadros.length : this.state.id + 1)
	}

	option(e) {
		return <Link to={"/" + e} onClick={(f) => this.selected(f)}>{c[e]}</Link>
	}

	selects(){
		const item = cursos()
		return (
			<div class="accordion">
				<input type="checkbox" id="section1"/>
				<label for="section1">Cursos</label>
				<div className="content-cursos">
					<div className="cursos">
						{item.map((e)=>this.option(e))}
					</div>
				</div>
			</div>
			)
	}
	
	mudaTela(e, i){
  		this.setState({b : i})
	}

	matricular(){
		if(this.t === 2)
			return (
			<>
				<input type="submit" value="Baixar grade" onClick={(e) => this.salva()} />
			</>)
		return (
			this.selects()
		)
	}

	tela(){
		let i = this.state.id
		return (
		<div className="grade-content">
			<div className="intervalo">
				{(i+1)+this.g+this.f}
			</div>
			{this.caso()}
		</div>
		)
	}

	muda(){
		this.i = 0
		if(this.state.b !== 1)
			return (
			<>
				<div className="salvar">
					{this.matricular()}
				</div>
					<div className="slides">
						<div className={"seila"+this.t}>
							{this.tela()}
						</div>
					</div>
				<div className="footer">
					<div className="buttom-content">
					{this.fun || " "}<br/>
					</div>
					<div className="navigation">
						{this.pages()}
					</div>
				</div>
			</>
			)

		return (
		<>
			<form class="box" action="#" method="post">
				<h1>Login</h1>
				<input type="text" name="" placeholder="Digite sua matrícula"/>
				<input type="password" name="" placeholder="Digite sua senha"/>
				<input type="submit" value="Matricule-me"  onClick={(e) => {this.mudaTela(e, 0); alert("Ainda não funciona")}}/>
			</form>
		</>)
	}

	next(p) {
		this.b += p ? 10 : this.b >= 10 ? -10 : 0
		this.b = (this.quadros.length < 10 + this.b) ? this.quadros.length - 10 : this.b - this.b % 10
		this.indices(this.b)
		this.setState({})
	}

	pages(){
		let h = []
		if(this.b > 0)
			h.push(<label className="control prev" onClick={(e)=>{this.next(false)}}>{"<<"}</label>)
		if(this.t !== 3){
			for(const x in this.passo){
				h.push(this.labels(x))
			}
			if (this.b + 10 < this.quadros.length)
				h.push(<label className="control next"  onClick={(e)=>{this.next(true)}}>{">>"}</label>)
		}
		return h
	}

	labels(f){
		const n = parseInt(f)+1+this.b
		const i = this.t+""+(n-1)
		return (
			<label htmlFor={"radio"+i} className={"page"} onClick={(e)=>{this.primeiro(n)}} id={"bar"+i}>
				{n+this.g}
			</label>
			)
	}

	linha(a, b, c){
		let h = []
		let s = this.td === 6? "semana1": "semana2"
		if(b !== null){
			h.push(<th className="horario" scope="col">{this.h1[this.i][0] +" às "+this.h1[this.i][1]}</th>)//
			for (const i in a){
				if(this.t !== 3)
					h.push(<th className={"grade " + a[i]} scope="col" name={b}>{b[i]}</th>)
				else{
					h.push(
						<th className="grade" scope="col" >
							{this.isChecked(c,i)}
						</th>
						)
				}
			}
			this.i++
		}else{
			h.push(<th className={"semana "+ s} scope="col"></th>)
			for (const i in a)
				h.push(<th className={"semana " + s} scope="col">{a[i]}</th>)
		}

		return h
	}

	horario(a, b, c) {
		if (this.i > 0 && this.h1[this.i][0] !== this.h1[this.i - 1][1]) {
			return (
				<>
					<tr><th className='intervalo2' colSpan="7" scope="row">Intervalo</th></tr>
					<tr className="tr">{this.linha(a, b, c)}</tr>
				</>)
		}
		return (<tr className="tr">{this.linha(a, b, c)}</tr>)
	}

	getHorarios(a, b, c){
		let h = []
		if (this.i < this.h1.length)
			h.push(this.horario(b, a, c))
			return h
	}

	caso() {
		this.inicia()
		let u = this.quadros[this.state.id] || []
		return(
			<>
			<table className="">
  				<thead>	      		
						<tr>{this.linha(this.s, null)}</tr>
			  	</thead>
			  	<tbody>
			      	{u.map((a,b)=>{return this.getHorarios(a,this.cor[this.state.id][b], b)})}
				</tbody>
			</table>
			</>
		)
	}
	
	render(){
		return this.muda()
	}
}

export default Comum
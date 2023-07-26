import React from 'react';
import '../model/util/css/Matricular.css'
import materias from '../model/db1'
import Materias from '../model/Materias'


const cores = ["l0","l1","l2","l3","l4","l5","l6","l7","l8","l9", "l10"] 

export default class Comum extends React.Component{

	constructor(props){
		super(props)
		this.state ={b: 0, id: 0, j: 0, desc: null}
		this.arr = props.materias
		this.t = props.tela
		this.f = props.f
		this.g = props.g
		this.grade(props.materias, props.separa)
		this.passo = props.materias.splice(0, this.arr.length > 10? 10: this.arr.length)
		this.b = 0
		this.inicio = 0
		this.next = this.next.bind(this);

		this.h1 = ["07:00", " 07:50", "08:40", "09:30", "10:00","10:50", "11:40", "12:30", "14:00", "14:50",  "15:40", "16:30", "17:20", "18:10", "19:00"]
		this.s = ["Seg", "Ter", "Qua", "Qui", "Sex"]
		this.id = props.tela
		this.i = 0
		this.j = 0
		this.teste()

		if(this.t === 3)
			this.fun = <input type="submit" value="Salvar" onClick={(e) => this.salva()}/>
		else
			this.fun = props.fun
	}
	
	componentDidMount() {
    	//this.primeiro(this.state.id+1)
  	}

	teste(){
		this.materias = [[],[],[],[],[],[],[],[],[],[]]
		for(const a of materias)
			this.materias[a._se-1].push(a)
	}

	grade(materias, s){
		const m = Array(5).fill("")
		const m2 = Array(15).fill("")
		let arr = []
		let cor = []
		let aux = materias
		const r = Math.floor(Math.random()*cores.length)
		if (s) {
			aux = this.separa(aux)
		}
		
		for(const a of aux){
			const cl = Array.from(m2, () => Array.from(m))
			const v = Array.from(m2, () => Array.from(m))
			for(const b in a){
				let  opt = a[b]._el === false && !a[b]._di.includes(" - OPT")? " - OPT": ""

				for(const c in a[b]._ho){
					for(const d in a[b]._ho[c]){
						if(a[b]._ho[c][d]){
							if(v[d][c] === "")
								v[d][c] = a[b]._di + opt
							else
								v[d][c] += " / "+ a[b]._di + opt
							cl[d][c] = cores[(b + r)%cores.length]
						}				
					}
				}
			}
			arr.push(v)
			cor.push(cl)
		}
		this.arr = arr
		
		this.cor = cor
		this.setState({id: 0})
	}

	separa(arr){
		let aux = []
		let aux2 = []
		let count = 1
		for(const i of arr){
			if(i._se !== count){
				count = i._se
				aux.push(aux2)
				aux2 = []
			}
			aux2.push(i)
		}
		aux.push(aux2)
		return aux
	}
	
	periodos(array){
		this.materias = array
		const arr = this.separa(array)
		let aux = []
		for (const i in arr) {
			let sem = []
			for (var l = 0; l < 5; l++) {
				let h = []
				for (var c = 0; c < 6; c++) {
					h.push(this.selects(l,c, arr[i]))
				}
				sem.push(h)
			}
			aux.push(sem)
		}
		return aux
	}

	salva(){
		let r = []
		for (const a of this.materias) {
			for (const b of a) {
				const m = new  Materias(b._se, b._di, b._ap, b._at, b._pr, b._el, b._re)
				for (var i = 0; i < m._ho.length; i++) {
					for (var j = 0; j < m._ho[0].length; j++) {
						console.log(b._ho[i])
						if(b._ho[i])
							m._ho[i][j] = b._ho[i][j]
					}
				}
				r.push(m)
			}
		}
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(r, null, 1))
		var downloadAnchorNode = document.createElement('a')
		downloadAnchorNode.setAttribute("href",     dataStr)
		downloadAnchorNode.setAttribute("download", "bd.json")
		document.body.appendChild(downloadAnchorNode); // required for firefox
		alert("salve este db.json na pasta model")
		downloadAnchorNode.click()
		downloadAnchorNode.remove()
	}

	atualiza(i, j, op){
		if(this.materias[this.state.id][this.state.j]._ho[j] !== null)
			this.materias[this.state.id][this.state.j]._ho[j][i] = op.checked
	}

	isChecked(i, j){
		const id = "t_"+i+"_"+j
		return <input type="checkbox" className="t_mat2" onClick={(e)=>{this.atualiza(i, j, e.target)}} name={id} id={id} value={id} />
	}

	primeiro(n){
		this.setState({id: n-1, j: 0})
		if(this.t === 3){
			const selectElement = document.getElementById('materia3');
			selectElement.selectedIndex = 0;
	  		this.selected(selectElement, n-1, false)
		}
	}

	selected(sel, id, b){

		const selectElement = document.getElementById('materia3');
		let selectedOption = null
		let k = 0
		if(!b)
			k = this.state.j
		else{
			k = sel.selectedIndex
		}

		selectedOption = sel.options[k]

		const mat = this.materias[id]
		
		const r = mat[k]._ho
		
		for (var i = 0; i < r.length; i++) {
			for (var j = 0; j < r[0].length; j++) {
				const op = document.getElementById('t_'+j+'_'+i)
				if(op)
					op.checked = r[i][j];
			}
		}
	}

	option(e){
		return <option value={e._di}>{e._di}</option>
	}///

	selects(){
		const key = this.state.id
		const item = this.materias[key]
		const val = ""
		return (
			<select name={"materia"+key} defaultValue={val} id={"materia3"} onChange={(e)=>{this.selected(e.target, key, true)}}>
			    {item.map((e)=>this.option(e))}
			</select>
			)
	}///

	

	mudaTela(e, i){
  		e.preventDefault()
  		this.setState({b : i})
	}

	matricular(){
		if(this.t === 2)
			return (
			<>
				<input type="submit" value="Escolher esta" onClick={(e) => this.mudaTela(e, 1)}/>
				<input type="submit" value="Imprime grade" onClick={(e) => alert("Ainda não funciona")}/>

			</>)///
		if(this.t === 3){
			return this.selects()
			}///
		return " "
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

	next(p){
		this.passo = []
		this.b += p ? 10 : this.b >= 10? -10: 0
		this.b = (this.arr.length < 10 +this.b) ? this.arr.length -10 : this.b - this.b%10

		for (let i = this.b; i < this.b + 10 && i < this.arr.length; i++)
			this.passo.push(this.arr[this.b+i])
	
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
			if(this.b+10 < this.arr.length)
				h.push(<label className="control next"  onClick={(e)=>{this.next(true)}}>{">>"}</label>)
		}else{
			for(const x in this.materias){
				h.push(this.labels(x))
			}
		}
		return h
	}///

	labels(f){
		const n = parseInt(f)+1+this.b
		const i = this.t+""+(n-1)
		return (
			<label htmlFor={"radio"+i} className={"page"} onClick={(e)=>{this.primeiro(n)}} id={"bar"+i}>
				{n+this.g}
			</label>
			)
	}///
	
	openDescription(e) {
		let x = null, c = [], ja = [], s
		for(const a of materias){
			if(e.includes(a._di)){

				s = a._di.split(' - ')[0]
				if(e.includes(" II") && !a._di.includes(" II")){
					ja.push(s)
					continue
				}
				if(!ja.includes(s)){
					ja.push(s)
					x = a
					c.push( <div className="desc">
						<div className="topx">
							<div className="di">{s}</div>
							<div className="ap">SIGLA: {x._re}</div>
							<div className="ap">AP: {x._ap}</div>
							<div className="at">AT: {x._at}</div>
							<div className="pr">PRÉ-REQUISITOS: {x._pr.join(', ')}</div>
						</div>
					</div>)
				}
			}
		}
		if(c.length > 0){
			console.log(c.length)
			const selectedDescription = document.getElementById("description");
				//selectedDescription.classList.remove('hidden');
				this.setState({desc: c})
		}else{
			this.closeDescription()
		}
		/*
		const descriptions = document.querySelectorAll('.description');
		descriptions.forEach(description => {
		description.classList.add('hidden');
		});
		*/
		// Exibe a descrição selecionada
	}

	closeDescription(){
		const selectedDescription = document.getElementById("description");
		//selectedDescription.classList.add('hidden');
	}

	linha(a, b, c){
		let h = []
		if(b !== null){
			if(this.h1[this.i] === "09:30" || this.h1[this.i] === "12:30"){
				h.push(<th className='intervalo2' colSpan="6" scope="row">Intervalo</th>)
			}else{///
				h.push(<th className="horario" scope="col">{this.h1[this.i] +" às "+this.h1[this.i+1]}</th>)//
				for (const i in a){
					if(this.t !== 3)
						h.push(<th className={"grade "+a[i]} onClick={(e) =>{this.openDescription(b[i])}} scope="col">{b[i]}</th>)
					else{///
						h.push(
							<th className="grade" scope="col">
								{this.isChecked(c,i)}
							</th>
							)
					}///
				}
			}
			this.i++

		}else{
			h.push(<th className="semana" scope="col"></th>)
			for (const i in a)
				h.push(<th className="semana" scope="col">{a[i]}</th>)
		}

		return h
	}///

	horario(a, b, c){
		if(this.h1[this.i] === "09:30" || this.h1[this.i] === "12:30")
			return (
				<>
					<tr>{this.linha(a, b, c)}</tr>
					<tr className="tr">{this.linha(a, b, c)}</tr>
				</>)
		return (<tr className="tr">{this.linha(a, b, c)}</tr>)
	}///

	horarios(a, b, c){
		let h = []
		h.push(this.horario(b, a, c))
		if(this.i < this.h1.length)
			return h
	}

	caso(){///
		console.log(this.arr);
		let u = this.arr[this.state.id] || []
		return(
			<>
			<table className="">
  				<thead>	      		
		      		<tr>{this.linha(this.s, null)}</tr>
			  	</thead>
			  	<tbody>
			      	{u.map((a,b)=>{return this.horarios(a,this.cor[this.state.id][b], b)})}
				</tbody>
			</table>
			<div class="description hidden" id="description" onClick={(e)=>this.closeDescription()}>
				<div className="desc-content">
					<div className="fe" onClick={(e)=>this.closeDescription()}>X</div>
					{this.state.desc || "asd"}
				</div>
			</div>
			</>
		)
	}
	
	render(){
		return this.muda()
	}
}
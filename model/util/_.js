export default class _{
  	convertHora(str,def){
		var d = new Date()
		var ano = d.getFullYear()
		var mes = d.getMonth()
		var dia = d.getDay()

		var h, min
		let u = (typeof str) !== "undefined"
		if (u) {
			h = str.substring(0,2)
			min = str.substring(3,5)
		}else{
			h = def.substring(0,2)
			min = def.substring(3,5)
		}
		return new Date(ano, mes, dia, h, min)
  	}
}
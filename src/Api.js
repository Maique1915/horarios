import React from 'react';
import axios from 'axios';

export default axios.create({baseURL: 'http://localhost:5000/'});

/*
const fs = require('fs');
		const file = __dirname + '/banco.json';
		
		fs.writeFile(file, JSON.stringify(ma), err => {
		    console.log(err || 'Arquivo salvo');
		});
*/
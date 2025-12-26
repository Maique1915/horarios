import Escolhe from './src/model/util/Escolhe.js';

const mockSchedule = [
  [{id: 'seg'}, {id: 'ter'}], 
  [{id: 'M1'}, {id: 'M2'}]
];

const subjectA = { 
  _re: 'A', _ho: [['seg', 'M1']] 
};

const subjectB = { 
  _re: 'B', _ho: [['seg', 'M1']] 
}; // Collides with A

const subjectC = { 
  _re: 'C', _ho: [['ter', 'M2']] 
}; // No collision

const escolhe = new Escolhe([subjectA, subjectB, subjectC], 'curso', [2, 2], mockSchedule);
console.log('Result count:', escolhe.exc().length);


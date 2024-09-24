//VARIABLES
const numberOfDefaultSubjects = 5;
const numberOfDecimalPoints = 2;
let settings;

//SELECTORS
const calculatorTable = document.querySelector('.calculator-table');
const calculatorTableBody = calculatorTable.getElementsByTagName('tbody')[0];
const addSubjectButton = document.querySelector('.addSubject-btn');
const currentCGPAInput = document.querySelector('.currentCGPA');
const creditsCompletedInput = document.querySelector('.creditsCompleted');
const gradeScaleTableBody = document.querySelector('.grade-scale-table-body');

//FUNCTIONS
function getIdAndCountryId() {
  const path = window.location.pathname;
  const parts = path.split('/');
  const countryId = parts[parts.length - 2];
  const lastPart = parts[parts.length - 1];
  const id = lastPart.split('.')[0];
  return {
    id,
    countryId,
  };
}

async function fetchSettings({ id, countryId }) {
  const gradingSchemeUrl = countryId
    ? `../grading-schemes/${countryId}/${id}.json`
    : `../grading-schemes/index.json`;
  const response = await fetch(gradingSchemeUrl);
  const data = await response.json();
  settings = data;
}

function addSubject() {
  let gradeScale = settings.gradeScale;
  let row = calculatorTableBody.insertRow(-1);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);

  //Subject Input
  let subjectInput = document.createElement('input');
  subjectInput.setAttribute('type', 'text');
  subjectInput.setAttribute('class', 'course form-control');
  subjectInput.setAttribute('placeholder', 'Course name');
  cell1.appendChild(subjectInput);

  //Credit Select
  let creditInput = document.createElement('input');
  creditInput.setAttribute('type', 'number');
  creditInput.setAttribute('class', 'credit form-control');
  creditInput.setAttribute('min', '0');
  creditInput.setAttribute('placeholder', 'Credits');
  creditInput.setAttribute('onchange', 'calculator()');
  cell2.appendChild(creditInput);

  //Grade Select
  let gradeSelect = document.createElement('select');
  gradeSelect.setAttribute('class', 'grade form-select');
  gradeSelect.setAttribute('onchange', 'handleGradeSelect(event)');
  let gradeOption = document.createElement('option');
  gradeOption.append('Grade');
  gradeOption.setAttribute('disabled', true);
  gradeOption.setAttribute('selected', true);
  gradeOption.setAttribute('value', '');
  gradeSelect.appendChild(gradeOption);

  for (item of gradeScale) {
    let gradeOption = document.createElement('option');
    gradeOption.append(item.grade);
    gradeOption.setAttribute('value', item.qualityPoints);
    gradeSelect.appendChild(gradeOption);
  }
  cell3.appendChild(gradeSelect);

  //Remove Button
  cell4.innerHTML = "<i class='fa-solid fa-xmark'></i>";
  cell4.setAttribute('onclick', 'removeSubject(this), calculator()');
  cell4.setAttribute('class', 'remove-subject-button text-center');
  toggleRemoveButton();
}

function handleGradeSelect(event) {
  event.target.classList.add('grade-selected');
  calculator();
}

function calculator() {
  let result = {
    semesterCredits: 0,
    totalGradePoints: 0,
    gpa: 0,
    totalCredits: 0,
    cgpa: 0,
  };

  calculateGPA(result);
  calculateCGPA(result);
  displayResults(result);
}

function calculateGPA(result) {
  for (row of calculatorTableBody.rows) {
    let creditInput = row.cells[1].querySelector('.credit').value;
    let gradeInput = row.cells[2].querySelector('.grade').value;

    if (!creditInput || !gradeInput) {
      continue;
    }

    let credit = parseFloat(creditInput);
    let gradeValue = parseFloat(gradeInput);
    let gradePoints = gradeValue * credit;
    result.totalGradePoints += gradePoints;
    result.semesterCredits += credit;
  }

  result.gpa = result.totalGradePoints / result.semesterCredits;
}

function calculateCGPA(result) {
  let currentCGPA = parseFloat(currentCGPAInput.value);
  let creditsCompleted = parseFloat(creditsCompletedInput.value);

  if (currentCGPAInput.value === '' || creditsCompletedInput.value === '') {
    return;
  }

  let currentGradePoints = currentCGPA * creditsCompleted;
  result.totalCredits = result.semesterCredits + creditsCompleted;
  result.totalGradePoints += currentGradePoints;
  result.cgpa = result.totalGradePoints / result.totalCredits;
}

function displayResults(result) {
  document.querySelector('#semesterCreditDisplay').innerHTML =
    result.semesterCredits;
  document.querySelector('#gpaDisplay').innerHTML = formatScore(result.gpa);
  document.querySelector('#totalCreditDisplay').innerHTML = result.totalCredits;
  document.querySelector('#cgpaDisplay').innerHTML = formatScore(result.cgpa);

  document.querySelector('#gpaDisplay').style.color = getColour(result.gpa);
  document.querySelector('#cgpaDisplay').style.color = getColour(result.cgpa);
}

function getColour(value) {
  const maxPoints = settings.gradeScale[0]?.qualityPoints || 4;
  let color = '';
  if (value <= 0) color = '';
  else if (value <= maxPoints / 2) color = '#EA5959';
  else if (value <= (maxPoints / 4) * 3) color = '#FFC871';
  else if (value <= maxPoints) color = '#30CFB3';

  return color;
}

function formatScore(value) {
  if (value === 0) return 0;
  if (isNaN(value)) return 0;
  return value.toFixed(numberOfDecimalPoints);
}

function removeSubject(tableRow) {
  calculatorTable.deleteRow(tableRow.parentNode.rowIndex);
  toggleRemoveButton();
}

function toggleRemoveButton() {
  const displayStyle =
    calculatorTableBody.rows.length === 1 ? 'none' : 'table-cell';
  document.querySelector('.remove-subject-button').style.display = displayStyle;
}

//ACTIONS
window.onload = async () => {
  await fetchSettings(getIdAndCountryId());
};

addSubjectButton.onclick = addSubject;

currentCGPAInput.addEventListener('keyup', calculator);
currentCGPAInput.addEventListener('change', calculator);

creditsCompletedInput.addEventListener('keyup', calculator);
creditsCompletedInput.addEventListener('change', calculator);

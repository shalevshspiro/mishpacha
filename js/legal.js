fetch('./js/legal.json')
  .then(response => response.json())
  .then(data => {
    const rulesContainer = document.getElementById('rules-container');
    const formsContainer = document.getElementById('forms-container');

    // הצגת כללים
    data.rules.forEach(rule => {
      const ruleDiv = document.createElement('div');
      ruleDiv.className = 'rule-item';
      ruleDiv.innerHTML = `<h3>${rule.title}</h3><p>${rule.text}</p>`;
      rulesContainer.appendChild(ruleDiv);
    });

    // הצגת טפסים
    data.forms.forEach(form => {
      const formDiv = document.createElement('div');
      formDiv.className = 'form-item';
      formDiv.innerHTML = `
        <h3>${form.title}</h3>
        <p>${form.description}</p>
        <a href="${form.link}" download target="_blank">הורד טופס</a>
      `;
      formsContainer.appendChild(formDiv);
    });
  })
  .catch(error => {
    console.error('שגיאה בטעינת קובץ legal.json:', error);
  });

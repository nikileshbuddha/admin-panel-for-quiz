document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // DOM Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const questionForm = document.getElementById('questionForm');
    const questionsTable = document.getElementById('questionsTable');
    const questionsTableBody = document.getElementById('questionsTableBody');
    const emptyState = document.getElementById('emptyState');
    const editModal = new bootstrap.Modal(document.getElementById('editQuestionModal'));
    const editForm = document.getElementById('editQuestionForm');
    const updateQuestionBtn = document.getElementById('updateQuestionBtn');
    const excelFile = document.getElementById('excelFile');
    const importBtn = document.getElementById('importBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    const previewTableBody = document.getElementById('previewTableBody');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    // Load saved questions
    loadQuestions();
    
    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    questionForm.addEventListener('submit', handleFormSubmit);
    updateQuestionBtn.addEventListener('click', function() {
        const id = Number(this.getAttribute('data-id'));
        
        // Get form values
        const questionData = {
            id: id,
            question: document.getElementById('editQuestion').value.trim(),
            optionA: document.getElementById('editOptionA').value.trim(),
            optionB: document.getElementById('editOptionB').value.trim(),
            optionC: document.getElementById('editOptionC').value.trim(),
            optionD: document.getElementById('editOptionD').value.trim(),
            answer: document.getElementById('editAnswer').value,
            marks: Number(document.getElementById('editMarks').value)
        };
        
        // Validate form
        if (!editForm.checkValidity()) {
            editForm.classList.add('was-validated');
            return;
        }
        
        // Get questions from localStorage
        let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        
        // Update the question
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            questions[index] = questionData;
            
            // Save to localStorage
            localStorage.setItem('quizQuestions', JSON.stringify(questions));
            
            // Update UI
            renderQuestions(questions);
            
            // Hide modal
            editModal.hide();
            
            // Reset form validation
            editForm.classList.remove('was-validated');
        }
    });
    importBtn.addEventListener('click', handleImport);
    downloadTemplateBtn.addEventListener('click', downloadTemplate);
    confirmImportBtn.addEventListener('click', confirmImport);
    
    // Functions
    function handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Reset validation
        resetValidation();
        
        // Get form values
        const question = document.getElementById('question').value.trim();
        const optionA = document.getElementById('optionA').value.trim();
        const optionB = document.getElementById('optionB').value.trim();
        const optionC = document.getElementById('optionC').value.trim();
        const optionD = document.getElementById('optionD').value.trim();
        const answer = document.getElementById('answer').value;
        const marks = document.getElementById('marks').value;
        
        // Validate form
        let isValid = true;
        
        if (!question) {
            showError('question');
            isValid = false;
        }
        
        if (!optionA) {
            showError('optionA');
            isValid = false;
        }
        
        if (!optionB) {
            showError('optionB');
            isValid = false;
        }
        
        if (!optionC) {
            showError('optionC');
            isValid = false;
        }
        
        if (!optionD) {
            showError('optionD');
            isValid = false;
        }
        
        if (!answer) {
            showError('answer');
            isValid = false;
        }
        
        if (!marks || isNaN(Number(marks)) || Number(marks) <= 0) {
            showError('marks');
            isValid = false;
        }
        
        if (!isValid) return;
        
        const editId = questionForm.getAttribute('data-edit-id');
        const questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        
        const questionData = {
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            answer,
            marks: Number(marks)
        };

        if (editId) {
            // Update existing question
            const index = questions.findIndex(q => q.id === Number(editId));
            if (index !== -1) {
                questionData.id = Number(editId);
                questions[index] = questionData;
            }
        } else {
            // Add new question
            questionData.id = Date.now();
            questions.push(questionData);
        }
        
        // Save to localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
        
        // Reset form and update UI
        questionForm.removeAttribute('data-edit-id');
        const submitBtn = document.querySelector('#questionForm button[type="submit"]');
        submitBtn.textContent = 'Add Question';
        questionForm.reset();
        
        // Update table
        renderQuestions(questions);
    }
    
    function resetValidation() {
        const inputs = questionForm.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }
    
    function showError(inputId) {
        const input = document.getElementById(inputId);
        input.classList.add('is-invalid');
    }
    
    function addQuestion(question) {
        // Get existing questions from localStorage
        let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        
        // Add new question
        questions.push(question);
        
        // Save to localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
        
        // Update UI
        renderQuestions(questions);
    }
    
    function loadQuestions() {
        const questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        renderQuestions(questions);
    }
    
    function renderQuestions(questions) {
        // Show/hide empty state
        if (questions.length === 0) {
            emptyState.classList.remove('d-none');
            questionsTable.classList.add('d-none');
        } else {
            emptyState.classList.add('d-none');
            questionsTable.classList.remove('d-none');
        }
        
        // Clear table
        questionsTableBody.innerHTML = '';
        
        // Add questions to table
        questions.forEach(q => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="question-cell">
                    <div class="question-text">${q.question}</div>
                    <div class="options-list">
                        <div class="option-item"><span class="option-label">A:</span> ${q.optionA}</div>
                        <div class="option-item"><span class="option-label">B:</span> ${q.optionB}</div>
                        <div class="option-item"><span class="option-label">C:</span> ${q.optionC}</div>
                        <div class="option-item"><span class="option-label">D:</span> ${q.optionD}</div>
                    </div>
                </td>
                <td class="text-center answer-cell"><span class="badge-answer">${q.answer}</span></td>
                <td class="text-center marks-cell">${q.marks}</td>
                <td class="action-cell">
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn-edit" data-id="${q.id}">Edit</button>
                        <button class="btn-delete" data-id="${q.id}">Delete</button>
                    </div>
                </td>
            `;
            
            questionsTableBody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        const deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }
    
    function handleDelete(e) {
        const id = Number(e.target.getAttribute('data-id'));
        
        // Get questions from localStorage
        let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        
        // Filter out the question to delete
        questions = questions.filter(q => q.id !== id);
        
        // Save to localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
        
        // Update UI
        renderQuestions(questions);
    }

    function handleEdit(e) {
        const id = Number(e.target.getAttribute('data-id'));
        const questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        const question = questions.find(q => q.id === id);
        
        if (question) {
            // Fill the modal form with question data
            document.getElementById('editQuestion').value = question.question;
            document.getElementById('editOptionA').value = question.optionA;
            document.getElementById('editOptionB').value = question.optionB;
            document.getElementById('editOptionC').value = question.optionC;
            document.getElementById('editOptionD').value = question.optionD;
            document.getElementById('editAnswer').value = question.answer;
            document.getElementById('editMarks').value = question.marks;
            
            // Store the question ID in the update button's data attribute
            updateQuestionBtn.setAttribute('data-id', id);
            
            // Show the modal
            editModal.show();
        }
    }

    let importedQuestions = []; // Store temporarily for preview

    function handleImport() {
        const file = excelFile.files[0];
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Validate and format the data
                importedQuestions = jsonData.map(row => ({
                    id: Date.now() + Math.random(),
                    question: row.Question || '',
                    optionA: row['Option A'] || '',
                    optionB: row['Option B'] || '',
                    optionC: row['Option C'] || '',
                    optionD: row['Option D'] || '',
                    answer: row.Answer || '',
                    marks: Number(row.Marks) || 1
                }));

                // Show preview
                showPreview(importedQuestions);
                
                // Close the import modal
                const importModal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
                importModal.hide();
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid Excel file.');
                console.error(error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function showPreview(questions) {
        previewTableBody.innerHTML = '';
        
        questions.forEach(q => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${q.question}</td>
                <td>${q.optionA}</td>
                <td>${q.optionB}</td>
                <td>${q.optionC}</td>
                <td>${q.optionD}</td>
                <td>${q.answer}</td>
                <td>${q.marks}</td>
            `;
            previewTableBody.appendChild(row);
        });

        previewModal.show();
    }

    function confirmImport() {
        // Get existing questions
        let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
        
        // Add imported questions
        questions = [...questions, ...importedQuestions];
        
        // Save to localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
        
        // Update UI
        renderQuestions(questions);
        
        // Clear file input and imported questions
        excelFile.value = '';
        importedQuestions = [];
        
        // Hide preview modal
        previewModal.hide();
    }

    function downloadTemplate() {
        // Create template data
        const template = [
            {
                'Question': 'Sample question?',
                'Option A': 'First option',
                'Option B': 'Second option',
                'Option C': 'Third option',
                'Option D': 'Fourth option',
                'Answer': 'A',
                'Marks': 1
            }
        ];
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(template);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Questions');
        
        // Save file
        XLSX.writeFile(wb, 'quiz_questions_template.xlsx');
    }
});
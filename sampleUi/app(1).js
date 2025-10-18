// Application State
const appState = {
    currentStep: 1,
    totalSteps: 6,
    patientData: {},
    assessmentResults: {},
    isRecording: false,
    recordingStartTime: null,
    recordingDuration: 0,
    maxRecordingTime: 120000, // 2 minutes in milliseconds
    timers: {
        recording: null,
        memory: null,
        fluency: null
    },
    canvasContext: null,
    isDrawing: false,
    drawingHistory: []
};

// Comprehensive Assessment Data
const assessmentData = {
    overall: {
        risk_score: 0.58,
        risk_level: "Medium",
        risk_color: "#f39c12",
        confidence: 0.85,
        components_analyzed: 5,
        total_possible_components: 6
    },
    components: {
        demographic: {
            score: 0.45,
            weight: 15,
            name: "Demographics & Background",
            icon: "👥",
            description: "Age, education, and gender factors",
            status: "Age-related risk factors present",
            details: {
                age_contribution: 40,
                education_contribution: -10,
                gender_contribution: 5
            }
        },
        medical_history: {
            score: 0.60,
            weight: 20,
            name: "Medical History",
            icon: "🏥",
            description: "Health conditions and medications",
            status: "Family history of dementia noted",
            details: {
                total_risk_factors: 3,
                high_risk_conditions: ["family_history_dementia"]
            }
        },
        speech_analysis: {
            score: 0.65,
            weight: 25,
            name: "Speech Analysis",
            icon: "🎤",
            description: "Voice patterns and language use",
            status: "Mild speech pattern changes detected",
            details: {
                ai_prediction: 0.65,
                speaking_rate: 1.8,
                vocabulary_diversity: 0.45
            }
        },
        cognitive_tests: {
            score: 0.70,
            weight: 25,
            name: "Cognitive Tests",
            icon: "🧠",
            description: "Memory and thinking assessments",
            status: "Some cognitive test concerns",
            details: {
                tests_completed: 3,
                memory_recall: 6,
                clock_drawing: 4,
                word_fluency: 11,
                estimated_mmse: 24
            }
        },
        neuroimaging: {
            score: null,
            weight: 10,
            name: "Brain Imaging",
            icon: "🖼️",
            description: "MRI scan analysis",
            status: "MRI data not available",
            details: {
                status: "no_mri_data"
            }
        },
        behavioral: {
            score: 0.35,
            weight: 5,
            name: "Lifestyle Factors",
            icon: "🏃‍♀️",
            description: "Sleep, activity, and mood",
            status: "Good lifestyle factors present",
            details: {
                sleep_quality: 5,
                activity_level: 4,
                mood_concerns: false
            }
        }
    },
    recommendations: {
        immediate_actions: [
            "Discuss results with primary care physician",
            "Consider cognitive assessment by specialist"
        ],
        lifestyle_changes: [
            "Engage in regular physical exercise",
            "Maintain social connections",
            "Follow Mediterranean-style diet"
        ],
        follow_up: [
            "Repeat assessment in 6-12 months",
            "Monitor for changes in memory"
        ],
        monitoring: [
            "Monitor changes in speech patterns",
            "Practice memory exercises"
        ]
    }
};

// DOM Elements
const elements = {
    stepContents: document.querySelectorAll('.step-content'),
    progressSteps: document.querySelectorAll('.progress-step'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    submitBtn: document.getElementById('submit-btn'),
    recordBtn: document.getElementById('record-btn'),
    playBtn: document.getElementById('play-btn'),
    reRecordBtn: document.getElementById('re-record-btn'),
    audioControls: document.getElementById('audio-controls'),
    recordingStatus: document.getElementById('recording-status'),
    recordingTimer: document.getElementById('recording-timer'),
    waveform: document.getElementById('waveform'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// Utility Functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showElement(element) {
    if (element) element.classList.remove('hidden');
}

function hideElement(element) {
    if (element) element.classList.add('hidden');
}

function updateProgress() {
    elements.progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < appState.currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === appState.currentStep) {
            step.classList.add('active');
        }
    });
}

function showStep(stepNumber) {
    // Hide all step contents
    elements.stepContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update navigation buttons
    elements.prevBtn.disabled = stepNumber === 1;
    
    if (stepNumber === appState.totalSteps) {
        hideElement(elements.nextBtn);
        showElement(elements.submitBtn);
    } else {
        showElement(elements.nextBtn);
        hideElement(elements.submitBtn);
    }
    
    updateProgress();
}

// Step Navigation
function nextStep() {
    if (appState.currentStep < appState.totalSteps) {
        if (validateCurrentStep()) {
            appState.currentStep++;
            showStep(appState.currentStep);
            
            // Special handling for results step
            if (appState.currentStep === 6) {
                generateResults();
            }
        }
    }
}

function prevStep() {
    if (appState.currentStep > 1) {
        appState.currentStep--;
        showStep(appState.currentStep);
    }
}

function validateCurrentStep() {
    switch (appState.currentStep) {
        case 1:
            return validatePatientInfo();
        case 2:
            return validateSpeechAssessment();
        case 3:
            return validateCognitiveTests();
        default:
            return true; // Optional steps
    }
}

function validatePatientInfo() {
    const name = document.getElementById('patient-name').value.trim();
    const age = document.getElementById('patient-age').value;
    const gender = document.getElementById('patient-gender').value;
    const education = document.getElementById('patient-education').value;
    
    if (!name || !age || !gender || !education) {
        alert('Please fill in all required patient information fields.');
        return false;
    }
    
    if (age < 50 || age > 100) {
        alert('Please enter a valid age between 50 and 100.');
        return false;
    }
    
    // Store patient data
    appState.patientData = {
        name,
        age: parseInt(age),
        gender,
        education,
        medicalHistory: getSelectedMedicalHistory(),
        familyHistory: document.getElementById('family-dementia').checked,
        medications: document.getElementById('medications').value.trim()
    };
    
    return true;
}

function getSelectedMedicalHistory() {
    const conditions = ['diabetes', 'hypertension', 'heart-disease', 'stroke-history', 'depression', 'sleep-disorders'];
    return conditions.filter(condition => 
        document.getElementById(condition).checked
    );
}

function validateSpeechAssessment() {
    // For demo purposes, we'll consider this step valid if user has interacted with recording
    return true;
}

function validateCognitiveTests() {
    // Check if at least some tests have been attempted
    const recalledWords = document.getElementById('recalled-words').value.trim();
    const mathAnswer = document.getElementById('math-answer').value.trim();
    
    if (!recalledWords && !mathAnswer) {
        alert('Please complete at least one cognitive test.');
        return false;
    }
    
    return true;
}

// Speech Recording Functions
function toggleRecording() {
    if (appState.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    appState.isRecording = true;
    appState.recordingStartTime = Date.now();
    
    // Update UI
    elements.recordBtn.classList.add('recording');
    elements.recordingStatus.textContent = 'Recording... Speak now';
    showElement(elements.audioControls);
    
    // Start timer
    appState.timers.recording = setInterval(updateRecordingTimer, 100);
    
    // Simulate recording (in real app, use Web Audio API)
    console.log('Recording started');
}

function stopRecording() {
    appState.isRecording = false;
    
    // Update UI
    elements.recordBtn.classList.remove('recording');
    elements.recordingStatus.textContent = 'Recording complete';
    
    // Clear timer
    if (appState.timers.recording) {
        clearInterval(appState.timers.recording);
        appState.timers.recording = null;
    }
    
    console.log('Recording stopped');
}

function updateRecordingTimer() {
    if (appState.recordingStartTime) {
        const elapsed = Date.now() - appState.recordingStartTime;
        const elapsedSeconds = Math.floor(elapsed / 1000);
        const totalSeconds = Math.floor(appState.maxRecordingTime / 1000);
        
        elements.recordingTimer.textContent = `${formatTime(elapsedSeconds)} / ${formatTime(totalSeconds)}`;
        
        // Auto-stop at max time
        if (elapsed >= appState.maxRecordingTime) {
            stopRecording();
        }
    }
}

function playRecording() {
    // Simulate playback
    alert('Playing recorded audio... (Simulated)');
}

function reRecord() {
    // Reset recording state
    appState.recordingDuration = 0;
    elements.recordingTimer.textContent = '0:00 / 2:00';
    hideElement(elements.audioControls);
    elements.recordingStatus.textContent = 'Click to start recording';
}

// Cognitive Test Functions
function startMemoryRecall() {
    // Hide the sequence and show input
    document.getElementById('memory-sequence').style.display = 'none';
    showElement(document.getElementById('recall-input'));
    
    const button = document.getElementById('start-memory-recall');
    button.textContent = 'Submit Recall';
    button.onclick = submitMemoryRecall;
}

function submitMemoryRecall() {
    const recalled = document.getElementById('recalled-words').value.trim();
    const correctWords = ['apple', 'river', 'table', 'happy', 'mountain'];
    const recalledWords = recalled.toLowerCase().split(',').map(word => word.trim());
    
    let score = 0;
    correctWords.forEach(word => {
        if (recalledWords.includes(word)) {
            score++;
        }
    });
    
    appState.assessmentResults.memoryScore = score / correctWords.length;
    
    const button = document.getElementById('start-memory-recall');
    button.textContent = `Completed (${score}/${correctWords.length} correct)`;
    button.disabled = true;
    
    console.log(`Memory test score: ${score}/${correctWords.length}`);
}

// Drawing Canvas Functions
function initializeCanvas() {
    const canvas = document.getElementById('clock-canvas');
    if (!canvas) return;
    
    appState.canvasContext = canvas.getContext('2d');
    
    // Set up event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    appState.isDrawing = true;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    appState.canvasContext.beginPath();
    appState.canvasContext.moveTo(x, y);
    
    // Save state for undo
    saveCanvasState();
}

function draw(e) {
    if (!appState.isDrawing) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    appState.canvasContext.lineTo(x, y);
    appState.canvasContext.strokeStyle = '#1f8c8d';
    appState.canvasContext.lineWidth = 2;
    appState.canvasContext.lineCap = 'round';
    appState.canvasContext.stroke();
}

function stopDrawing() {
    appState.isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    const canvas = document.getElementById('clock-canvas');
    appState.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    appState.drawingHistory = [];
}

function saveCanvasState() {
    const canvas = document.getElementById('clock-canvas');
    appState.drawingHistory.push(canvas.toDataURL());
}

function undoDrawing() {
    if (appState.drawingHistory.length > 1) {
        appState.drawingHistory.pop();
        const canvas = document.getElementById('clock-canvas');
        const img = new Image();
        img.onload = function() {
            appState.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            appState.canvasContext.drawImage(img, 0, 0);
        };
        img.src = appState.drawingHistory[appState.drawingHistory.length - 1];
    } else {
        clearCanvas();
    }
}

// Word Fluency Test
function startFluencyTest() {
    const textarea = document.getElementById('animal-words');
    const button = document.getElementById('start-fluency');
    const timerElement = document.getElementById('fluency-timer');
    
    textarea.disabled = false;
    textarea.focus();
    button.disabled = true;
    
    let timeLeft = 60;
    
    appState.timers.fluency = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(appState.timers.fluency);
            textarea.disabled = true;
            button.textContent = 'Test Completed';
            
            // Calculate score
            const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
            appState.assessmentResults.fluencyScore = words.length;
            console.log(`Fluency test score: ${words.length} words`);
        }
    }, 1000);
}

// File Upload Functions
function initializeFileUploads() {
    // Image upload for neuroimaging
    const imageDropZone = document.getElementById('image-drop-zone');
    const imageUpload = document.getElementById('image-upload');
    
    if (imageDropZone) {
        imageDropZone.addEventListener('dragover', handleDragOver);
        imageDropZone.addEventListener('drop', handleImageDrop);
        imageDropZone.addEventListener('dragleave', handleDragLeave);
    }
    
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Audio upload
    const audioUpload = document.getElementById('audio-upload');
    if (audioUpload) {
        audioUpload.addEventListener('change', handleAudioUpload);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('dragover');
}

function handleDragLeave(e) {
    e.target.classList.remove('dragover');
}

function handleImageDrop(e) {
    e.preventDefault();
    e.target.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    processImageFiles(files);
}

function processImageFiles(files) {
    const uploadedFiles = document.getElementById('uploaded-files');
    
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.name.endsWith('.dcm')) {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file';
            fileDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base); margin-bottom: 8px;">
                    <span>📄</span>
                    <span>${file.name}</span>
                    <span style="margin-left: auto; font-size: var(--font-size-sm); color: var(--color-text-secondary);">${(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
            `;
            uploadedFiles.appendChild(fileDiv);
        }
    });
}

function handleAudioUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
        console.log('Audio file uploaded:', file.name);
        showElement(elements.audioControls);
        elements.recordingStatus.textContent = `Audio file: ${file.name}`;
    }
}

// Scale Input Functions
function initializeScaleInputs() {
    const sleepQuality = document.getElementById('sleep-quality');
    if (sleepQuality) {
        const valueDisplay = sleepQuality.parentElement.querySelector('.scale-value');
        sleepQuality.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });
    }
}

// Results Generation
function generateResults() {
    showLoadingOverlay();
    
    // Simulate AI processing time
    setTimeout(() => {
        hideLoadingOverlay();
        displayResults();
        initializeResultsTabs();
    }, 3000);
}

function showLoadingOverlay() {
    showElement(elements.loadingOverlay);
}

function hideLoadingOverlay() {
    hideElement(elements.loadingOverlay);
}

function displayResults() {
    const data = assessmentData;
    
    // Update main score display
    updateMainScoreDisplay(data.overall);
    
    // Update component cards
    updateComponentCards(data.components);
    
    // Update detailed views
    updateDetailedViews(data);
    
    console.log('Results generated:', { assessmentData, patientData: appState.patientData });
}

function updateMainScoreDisplay(overallData) {
    const scoreValue = document.getElementById('overall-score-value');
    const riskLevel = document.getElementById('risk-level');
    const confidenceValue = document.getElementById('confidence-value');
    const scoreCircle = document.getElementById('overall-score-circle');
    
    if (scoreValue) {
        scoreValue.textContent = `${Math.round(overallData.risk_score * 100)}%`;
    }
    
    if (riskLevel) {
        riskLevel.textContent = overallData.risk_level + ' Risk';
        riskLevel.className = `risk-level ${overallData.risk_level.toLowerCase()}`;
    }
    
    if (confidenceValue) {
        confidenceValue.textContent = `${Math.round(overallData.confidence * 100)}% Confidence`;
    }
    
    // Update circular progress
    if (scoreCircle) {
        const percentage = overallData.risk_score * 100;
        const color = overallData.risk_level.toLowerCase() === 'low' ? 'var(--color-success)' : 
                     overallData.risk_level.toLowerCase() === 'medium' ? 'var(--color-warning)' : 
                     'var(--color-error)';
        
        scoreCircle.style.background = `conic-gradient(${color} 0% ${percentage}%, var(--color-secondary) ${percentage}% 100%)`;
    }
}

function updateComponentCards(components) {
    Object.keys(components).forEach(key => {
        const component = components[key];
        const card = document.querySelector(`[data-component="${key}"]`);
        
        if (card && component.score !== null) {
            const scoreElement = card.querySelector('.component-score');
            const progressFill = card.querySelector('.progress-fill');
            const statusElement = card.querySelector('.component-status');
            
            if (scoreElement) {
                const percentage = Math.round(component.score * 100);
                scoreElement.textContent = `${percentage}%`;
                
                // Update score class
                scoreElement.className = 'component-score ' + getScoreClass(component.score);
            }
            
            if (progressFill) {
                const percentage = component.score * 100;
                progressFill.style.width = `${percentage}%`;
                progressFill.className = 'progress-fill ' + getScoreClass(component.score);
            }
            
            if (statusElement) {
                statusElement.textContent = component.status;
            }
        }
    });
}

function getScoreClass(score) {
    if (score < 0.4) return 'low';
    if (score < 0.7) return 'moderate';
    return 'high';
}

function updateDetailedViews(data) {
    // Update component detail cards with specific breakdowns
    updateComponentDetails(data.components);
    
    // Update methodology calculations
    updateMethodologyCalculations(data);
}

function updateComponentDetails(components) {
    // Demographics details
    updateDemographicDetails(components.demographic);
    
    // Medical history details
    updateMedicalDetails(components.medical_history);
    
    // Speech analysis details
    updateSpeechDetails(components.speech_analysis);
    
    // Cognitive test details
    updateCognitiveDetails(components.cognitive_tests);
    
    // Lifestyle details
    updateLifestyleDetails(components.behavioral);
}

function updateDemographicDetails(component) {
    // This would update specific demographic breakdown in the detailed view
    console.log('Updated demographic details:', component.details);
}

function updateMedicalDetails(component) {
    // This would update medical history breakdown
    console.log('Updated medical details:', component.details);
}

function updateSpeechDetails(component) {
    // This would update speech analysis breakdown
    console.log('Updated speech details:', component.details);
}

function updateCognitiveDetails(component) {
    // This would update cognitive test breakdown
    console.log('Updated cognitive details:', component.details);
}

function updateLifestyleDetails(component) {
    // This would update lifestyle factors breakdown
    console.log('Updated lifestyle details:', component.details);
}

function updateMethodologyCalculations(data) {
    // Calculate the weighted scores for display in methodology tab
    const components = data.components;
    const totalWeight = Object.values(components)
        .filter(comp => comp.score !== null)
        .reduce((sum, comp) => sum + comp.weight, 0);
    
    let calculationHTML = '';
    let totalPoints = 0;
    
    Object.values(components).forEach(comp => {
        if (comp.score !== null) {
            const points = (comp.score * comp.weight);
            totalPoints += points;
            
            calculationHTML += `
                <div class="formula-item">
                    <span class="component">${comp.name}</span>
                    <span class="calculation">${Math.round(comp.score * 100)}% × ${comp.weight}% =</span>
                    <span class="result">${points.toFixed(1)} points</span>
                </div>
            `;
        } else {
            calculationHTML += `
                <div class="formula-item disabled">
                    <span class="component">${comp.name}</span>
                    <span class="calculation">N/A × ${comp.weight}% =</span>
                    <span class="result">0.0 points</span>
                </div>
            `;
        }
    });
    
    // Add total calculation
    const adjustedScore = (totalPoints / totalWeight) * 100;
    calculationHTML += `
        <div class="formula-total">
            <span class="component"><strong>Total Score</strong></span>
            <span class="calculation">${totalPoints.toFixed(1)} ÷ ${totalWeight}% =</span>
            <span class="result"><strong>${adjustedScore.toFixed(1)}% ≈ ${Math.round(adjustedScore)}%</strong></span>
        </div>
    `;
    
    // Update the calculation display
    const calculationContainer = document.querySelector('.calculation-formula');
    if (calculationContainer) {
        calculationContainer.innerHTML = calculationHTML;
    }
}

// Action Button Handlers
function shareWithDoctor() {
    alert('Report sharing functionality would be implemented here. In a real application, this would securely share the assessment results with healthcare providers.');
}

function downloadReport() {
    alert('Report download functionality would be implemented here. In a real application, this would generate and download a PDF report.');
}

function scheduleFollowup() {
    alert('Follow-up scheduling functionality would be implemented here. In a real application, this would integrate with a calendar system.');
}

function skipImaging() {
    nextStep();
}

// Event Listeners
function initializeEventListeners() {
    // Navigation buttons
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', prevStep);
    if (elements.nextBtn) elements.nextBtn.addEventListener('click', nextStep);
    if (elements.submitBtn) elements.submitBtn.addEventListener('click', () => {
        alert('Assessment completed! In a real application, this would submit the data for processing.');
    });
    
    // Recording buttons
    if (elements.recordBtn) elements.recordBtn.addEventListener('click', toggleRecording);
    if (elements.playBtn) elements.playBtn.addEventListener('click', playRecording);
    if (elements.reRecordBtn) elements.reRecordBtn.addEventListener('click', reRecord);
    
    // Cognitive test buttons
    const memoryBtn = document.getElementById('start-memory-recall');
    if (memoryBtn) memoryBtn.addEventListener('click', startMemoryRecall);
    
    const fluencyBtn = document.getElementById('start-fluency');
    if (fluencyBtn) fluencyBtn.addEventListener('click', startFluencyTest);
    
    // Canvas buttons
    const clearCanvasBtn = document.getElementById('clear-canvas');
    if (clearCanvasBtn) clearCanvasBtn.addEventListener('click', clearCanvas);
    
    const undoBtn = document.getElementById('undo-draw');
    if (undoBtn) undoBtn.addEventListener('click', undoDrawing);
    
    // Skip imaging button
    const skipImagingBtn = document.getElementById('skip-imaging');
    if (skipImagingBtn) skipImagingBtn.addEventListener('click', skipImaging);
    
    // Result action buttons
    const shareDoctorBtn = document.getElementById('share-doctor');
    if (shareDoctorBtn) shareDoctorBtn.addEventListener('click', shareWithDoctor);
    
    const downloadBtn = document.getElementById('download-report');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadReport);
    
    const followupBtn = document.getElementById('schedule-followup');
    if (followupBtn) followupBtn.addEventListener('click', scheduleFollowup);
}

// Math Test Auto-Check
function initializeMathTest() {
    const mathAnswer = document.getElementById('math-answer');
    if (mathAnswer) {
        mathAnswer.addEventListener('blur', () => {
            const answer = parseInt(mathAnswer.value);
            const correct = 42; // 15 + 27
            
            if (answer === correct) {
                mathAnswer.style.borderColor = 'var(--color-success)';
                appState.assessmentResults.mathScore = 1;
            } else if (answer) {
                mathAnswer.style.borderColor = 'var(--color-error)';
                appState.assessmentResults.mathScore = 0;
            }
        });
    }
}

// Tab Management for Results
function initializeResultsTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Component Card Interactions
function initializeComponentCards() {
    const componentCards = document.querySelectorAll('.component-card');
    
    componentCards.forEach(card => {
        card.addEventListener('click', () => {
            const componentType = card.getAttribute('data-component');
            
            // Switch to component details tab and highlight the relevant section
            const detailsTab = document.querySelector('[data-tab="components"]');
            if (detailsTab) {
                detailsTab.click();
            }
            
            // Scroll to the relevant detail card
            setTimeout(() => {
                const detailCard = document.querySelector(`[data-component="${componentType}"]`);
                if (detailCard && detailCard.closest('.component-detail-card')) {
                    detailCard.closest('.component-detail-card').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 300);
        });
    });
}

// Initialize Application
function initializeApp() {
    // Set initial step
    showStep(appState.currentStep);
    
    // Initialize components
    initializeCanvas();
    initializeFileUploads();
    initializeScaleInputs();
    initializeMathTest();
    initializeEventListeners();
    
    // Pre-fill sample data for demo
    if (document.getElementById('patient-name')) {
        document.getElementById('patient-name').value = 'John Smith';
        document.getElementById('patient-age').value = '72';
        document.getElementById('patient-gender').value = 'male';
        document.getElementById('patient-education').value = 'high-school';
        // Pre-select some medical history items
        setTimeout(() => {
            document.getElementById('family-dementia').checked = true;
            document.getElementById('hypertension').checked = true;
        }, 100);
    }
    
    console.log('DementiaGuard AI Application initialized');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
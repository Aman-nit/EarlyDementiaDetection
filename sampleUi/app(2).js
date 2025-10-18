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

// Sample Data for Demo
const sampleData = {
    patients: [
        {
            name: "John Smith",
            age: 72,
            gender: "Male",
            education: "High School",
            risk_score: 0.23,
            status: "Low Risk"
        },
        {
            name: "Mary Johnson",
            age: 68,
            gender: "Female",
            education: "College",
            risk_score: 0.67,
            status: "Medium Risk"
        }
    ],
    riskFactors: [
        {
            factor: "Speech Analysis",
            score: 0.15,
            status: "Normal"
        },
        {
            factor: "Memory Test",
            score: 0.45,
            status: "Mild Concern"
        },
        {
            factor: "Clinical Data",
            score: 0.20,
            status: "Low Risk"
        }
    ]
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
    }, 3000);
}

function showLoadingOverlay() {
    showElement(elements.loadingOverlay);
}

function hideLoadingOverlay() {
    hideElement(elements.loadingOverlay);
}

function displayResults() {
    // Calculate overall risk score
    let riskScore = 0.23; // Default from sample data
    
    // Update risk gauge
    const gaugeEl = document.getElementById('risk-gauge');
    const scoreEl = document.getElementById('risk-score');
    const statusEl = document.getElementById('risk-status');
    
    if (gaugeEl && scoreEl && statusEl) {
        const gaugeFill = gaugeEl.querySelector('.gauge-fill');
        const gaugePointer = gaugeEl.querySelector('.gauge-pointer');
        
        const percentage = riskScore * 100;
        
        if (gaugeFill) gaugeFill.style.width = `${percentage}%`;
        if (gaugePointer) gaugePointer.style.left = `${percentage}%`;
        
        scoreEl.textContent = riskScore.toFixed(2);
        
        // Update status based on score
        let status, statusClass;
        if (riskScore < 0.3) {
            status = 'Low Risk';
            statusClass = 'low';
        } else if (riskScore < 0.7) {
            status = 'Medium Risk';
            statusClass = 'medium';
        } else {
            status = 'High Risk';
            statusClass = 'high';
        }
        
        statusEl.textContent = status;
        statusEl.className = `risk-status ${statusClass}`;
    }
    
    console.log('Results generated:', { riskScore, patientData: appState.patientData });
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
        document.getElementById('patient-name').value = sampleData.patients[0].name;
        document.getElementById('patient-age').value = sampleData.patients[0].age;
        document.getElementById('patient-gender').value = sampleData.patients[0].gender.toLowerCase();
        document.getElementById('patient-education').value = 'high-school';
    }
    
    console.log('DementiaGuard AI Application initialized');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
// Global variables
let currentStep = 1;
let userProfile = {};
let nutritionGoal = {};
let macroTargets = {};
let nutritionPlan = {};

// Utility functions
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, duration);
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    const percentage = (currentStep / 4) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `Step ${currentStep} of 4`;
    progressPercent.textContent = `${Math.round(percentage)}% Complete`;
}

function showStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step${i}`).classList.add('hidden');
    }
    // Show current step
    document.getElementById(`step${step}`).classList.remove('hidden');
    currentStep = step;
    updateProgress();
}

function validateStep1() {
    const currentWeight = document.getElementById('currentWeight').value;
    const height = document.getElementById('height').value;
    const goalWeight = document.getElementById('goalWeight').value;
    const goalBodyFat = document.getElementById('goalBodyFat').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activityLevel').value;
    
    return currentWeight && height && goalWeight && goalBodyFat && age && gender && activityLevel;
}

function validateStep2() {
    return nutritionGoal.type;
}

function validateStep3() {
    return nutritionGoal.preference;
}

function nextStep(step) {
    if (step === 2 && !validateStep1()) {
        showToast('Please fill in all personal information fields');
        return;
    }
    
    if (step === 3 && !validateStep2()) {
        showToast('Please select your goal (bulk or cut)');
        return;
    }
    
    if (step === 2) {
        // Save profile data
        userProfile = {
            currentWeight: parseFloat(document.getElementById('currentWeight').value),
            height: parseFloat(document.getElementById('height').value),
            goalWeight: parseFloat(document.getElementById('goalWeight').value),
            goalBodyFat: parseFloat(document.getElementById('goalBodyFat').value),
            age: parseFloat(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            activityLevel: document.getElementById('activityLevel').value
        };
    }
    
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

function selectGoal(goalType) {
    nutritionGoal.type = goalType;
    
    // Update UI
    document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[value="${goalType}"]`).closest('.radio-option');
    selectedOption.classList.add('selected');
    document.querySelector(`input[value="${goalType}"]`).checked = true;
}

function selectPreference(preference) {
    nutritionGoal.preference = preference;
    
    // Update UI
    document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[value="${preference}"]`).closest('.radio-option');
    selectedOption.classList.add('selected');
    document.querySelector(`input[value="${preference}"]`).checked = true;
}

// Nutrition calculation functions
function calculateBMR(profile) {
    const { currentWeight, height, age, gender } = profile;
    
    if (gender === 'male') {
        return 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }
}

function calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very-active': 1.9
    };
    
    return bmr * (activityMultipliers[activityLevel] || 1.2);
}

function calculateMacroTargets(profile, goal) {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    
    let targetCalories;
    
    if (goal.type === 'bulk') {
        targetCalories = tdee + 300; // Moderate surplus
    } else {
        targetCalories = tdee - 500; // Moderate deficit
    }
    
    // Calculate macros based on goal
    let proteinCalories, fatCalories, carbCalories;
    
    if (goal.type === 'bulk') {
        proteinCalories = profile.currentWeight * 2.2 * 4; // 2.2g per kg * 4 cal/g
        fatCalories = targetCalories * 0.25; // 25% of calories from fat
        carbCalories = targetCalories - proteinCalories - fatCalories;
    } else {
        proteinCalories = profile.currentWeight * 2.5 * 4; // Higher protein for cutting
        fatCalories = targetCalories * 0.20; // 20% of calories from fat
        carbCalories = targetCalories - proteinCalories - fatCalories;
    }
    
    return {
        calories: Math.round(targetCalories),
        protein: Math.round(proteinCalories / 4),
        carbs: Math.round(carbCalories / 4),
        fat: Math.round(fatCalories / 9)
    };
}

function generateWeeklyPlan(macroTargets, preference) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => ({
        day,
        meals: generateDailyMeals(macroTargets, preference),
        totalMacros: macroTargets
    }));
}

function generateDailyMeals(macroTargets, preference) {
    const mealDistribution = [0.25, 0.15, 0.35, 0.25]; // Breakfast, Snack, Lunch, Dinner
    const mealNames = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Dinner'];
    const mealTimes = ['7:00 AM', '10:00 AM', '12:30 PM', '7:00 PM'];
    
    return mealDistribution.map((percentage, index) => ({
        name: mealNames[index],
        time: mealTimes[index],
        foods: generateFoodsForMeal(macroTargets, percentage, preference),
        macros: distributeMacros(macroTargets, percentage)
    }));
}

function distributeMacros(macroTargets, percentage) {
    return {
        calories: Math.round(macroTargets.calories * percentage),
        protein: Math.round(macroTargets.protein * percentage),
        carbs: Math.round(macroTargets.carbs * percentage),
        fat: Math.round(macroTargets.fat * percentage)
    };
}

function generateFoodsForMeal(macroTargets, percentage, preference) {
    const targetCalories = macroTargets.calories * percentage;
    
    if (preference === 'drinks') {
        return [
            {
                name: 'Protein Smoothie',
                quantity: 1,
                unit: 'serving',
                calories: Math.round(targetCalories * 0.6),
                protein: Math.round(macroTargets.protein * percentage * 0.7),
                carbs: Math.round(macroTargets.carbs * percentage * 0.6),
                fat: Math.round(macroTargets.fat * percentage * 0.4)
            },
            {
                name: 'Fresh Juice',
                quantity: 200,
                unit: 'ml',
                calories: Math.round(targetCalories * 0.4),
                protein: Math.round(macroTargets.protein * percentage * 0.3),
                carbs: Math.round(macroTargets.carbs * percentage * 0.4),
                fat: Math.round(macroTargets.fat * percentage * 0.6)
            }
        ];
    } else {
        // Generate food-based meals
        const foods = [
            { name: 'Chicken Breast', protein: 31, carbs: 0, fat: 3.6, calPer100g: 165 },
            { name: 'Brown Rice', protein: 2.6, carbs: 23, fat: 0.9, calPer100g: 111 },
            { name: 'Avocado', protein: 2, carbs: 9, fat: 15, calPer100g: 160 },
            { name: 'Sweet Potato', protein: 2, carbs: 20, fat: 0.1, calPer100g: 86 },
            { name: 'Salmon', protein: 25, carbs: 0, fat: 12, calPer100g: 208 },
            { name: 'Quinoa', protein: 4.4, carbs: 22, fat: 1.9, calPer100g: 120 }
        ];
        
        return [
            {
                name: foods[Math.floor(Math.random() * foods.length)].name,
                quantity: Math.round(targetCalories / 200 * 100),
                unit: 'g',
                calories: Math.round(targetCalories * 0.6),
                protein: Math.round(macroTargets.protein * percentage * 0.6),
                carbs: Math.round(macroTargets.carbs * percentage * 0.6),
                fat: Math.round(macroTargets.fat * percentage * 0.6)
            },
            {
                name: foods[Math.floor(Math.random() * foods.length)].name,
                quantity: Math.round(targetCalories / 300 * 100),
                unit: 'g',
                calories: Math.round(targetCalories * 0.4),
                protein: Math.round(macroTargets.protein * percentage * 0.4),
                carbs: Math.round(macroTargets.carbs * percentage * 0.4),
                fat: Math.round(macroTargets.fat * percentage * 0.4)
            }
        ];
    }
}

function generatePlan() {
    if (!validateStep3()) {
        showToast('Please select your food preference');
        return;
    }
    
    // Calculate macro targets
    macroTargets = calculateMacroTargets(userProfile, nutritionGoal);
    
    // Generate weekly plan
    const weeklyPlan = generateWeeklyPlan(macroTargets, nutritionGoal.preference);
    
    // Generate monthly plan (4 weeks)
    const monthlyPlan = Array.from({ length: 4 }, (_, week) => 
        weeklyPlan.map(day => ({ ...day, day: `Week ${week + 1} - ${day.day}` }))
    ).flat();
    
    nutritionPlan = {
        userProfile,
        goal: nutritionGoal,
        dailyTargets: macroTargets,
        weeklyPlan,
        monthlyPlan
    };
    
    displayResults();
    showStep(4);
    showToast('Your personalized nutrition plan is ready!');
}

function displayResults() {
    // Update plan description
    document.getElementById('planDescription').textContent = 
        `Your personalized ${nutritionGoal.type} plan with ${nutritionGoal.preference} preferences`;
    
    // Display macro targets
    const macroResults = document.getElementById('macroResults');
    macroResults.innerHTML = `
        <div class="macro-card">
            <div class="macro-value" style="color: #667eea;">${macroTargets.calories}</div>
            <div class="macro-label">Calories</div>
        </div>
        <div class="macro-card">
            <div class="macro-value" style="color: #22c55e;">${macroTargets.protein}g</div>
            <div class="macro-label">Protein</div>
        </div>
        <div class="macro-card">
            <div class="macro-value" style="color: #f59e0b;">${macroTargets.carbs}g</div>
            <div class="macro-label">Carbs</div>
        </div>
        <div class="macro-card">
            <div class="macro-value" style="color: #3b82f6;">${macroTargets.fat}g</div>
            <div class="macro-label">Fat</div>
        </div>
    `;
    
    // Update badges
    document.getElementById('goalBadge').textContent = `Goal: ${nutritionGoal.type.toUpperCase()}`;
    document.getElementById('preferenceBadge').textContent = `Preference: ${nutritionGoal.preference.toUpperCase()}`;
    
    // Display weekly plan
    displayWeeklyPlan();
    displayMonthlyPlan();
}

function displayWeeklyPlan() {
    const weeklyPlanContainer = document.getElementById('weeklyPlan');
    let planHTML = '';
    
    nutritionPlan.weeklyPlan.forEach(dayPlan => {
        planHTML += `
            <div class="day-plan">
                <div class="day-header">
                    <div class="day-title">📅 ${dayPlan.day}</div>
                    <div class="day-macros">
                        <span class="badge">${dayPlan.totalMacros.calories} cal</span>
                        <span class="badge badge-outline">${dayPlan.totalMacros.protein}g protein</span>
                    </div>
                </div>
                <div class="meals">
                    ${dayPlan.meals.map(meal => `
                        <div class="meal">
                            <div class="meal-header">
                                <div>
                                    <span class="meal-name">⏰ ${meal.name}</span>
                                    <span class="meal-time">${meal.time}</span>
                                </div>
                                <div class="meal-calories">${meal.macros.calories} cal</div>
                            </div>
                            <div class="foods">
                                ${meal.foods.map(food => `
                                    <div class="food-item">
                                        <span class="food-name">${food.quantity}${food.unit} ${food.name}</span>
                                        <span class="food-macros">${food.calories} cal | ${food.protein}g P | ${food.carbs}g C | ${food.fat}g F</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    weeklyPlanContainer.innerHTML = planHTML;
}

function displayMonthlyPlan() {
    const monthlyPlanContainer = document.getElementById('monthlyPlan');
    let planHTML = '';
    
    for (let week = 1; week <= 4; week++) {
        planHTML += `
            <div class="week-overview">
                <div class="week-title">Week ${week}</div>
                <p style="color: #64748b; margin-bottom: 15px;">Consistent nutrition targets throughout the month</p>
                <div class="week-macros">
                    <div class="week-macro">
                        <div class="week-macro-value">${macroTargets.calories * 7}</div>
                        <div class="week-macro-label">Weekly Calories</div>
                    </div>
                    <div class="week-macro">
                        <div class="week-macro-value">${macroTargets.protein * 7}g</div>
                        <div class="week-macro-label">Weekly Protein</div>
                    </div>
                    <div class="week-macro">
                        <div class="week-macro-value">${macroTargets.carbs * 7}g</div>
                        <div class="week-macro-label">Weekly Carbs</div>
                    </div>
                    <div class="week-macro">
                        <div class="week-macro-value">${macroTargets.fat * 7}g</div>
                        <div class="week-macro-label">Weekly Fat</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    monthlyPlanContainer.innerHTML = planHTML;
}

function showTab(tabName) {
    // Hide all tab contents
    document.getElementById('weeklyTab').classList.add('hidden');
    document.getElementById('monthlyTab').classList.add('hidden');
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // Add active class to selected tab button
    event.target.classList.add('active');
}

async function analyzeFoodImage() {
    const url = 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/analyzeFoodPlate';
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Breakfast_foods.jpg';
    
    try {
        showToast('Analyzing food image...');
        
        const response = await fetch(`${url}?imageUrl=${encodeURIComponent(imageUrl)}&lang=en&noqueue=1`, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': '0140eecbeemshe01739e941e1c82p1e7ceejsn7fac0c03f7f0',
                'x-rapidapi-host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({})
        });
        
        const result = await response.json();
        console.log('Food analysis result:', result);
        
        if (result.result && result.result.foods_identified) {
            const foods = result.result.foods_identified;
            const totalNutrition = result.result.total_nutrition;
            
            let analysisText = `Food Analysis Results:\n\n`;
            analysisText += `Foods identified: ${foods.map(f => f.name).join(', ')}\n`;
            analysisText += `Total Calories: ${totalNutrition.total_calories}\n`;
            analysisText += `Total Protein: ${totalNutrition.total_protein}\n`;
            analysisText += `Total Carbs: ${totalNutrition.total_carbs}\n`;
            analysisText += `Total Fat: ${totalNutrition.total_fats}`;
            
            alert(analysisText);
            showToast('Food analysis completed! Check the alert for details.');
        } else {
            showToast('Food analysis completed! Check the browser console for detailed results.');
        }
    } catch (error) {
        console.error('Food analysis error:', error);
        showToast('Unable to analyze the food image. Please try again.');
    }
}

function downloadPlan(type) {
    // Simulate download
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} plan download started!`);
    
    // In a real application, you would generate and download a PDF file here
    // For now, we'll just create a simple text representation
    let planText = `GoalEats - ${type.charAt(0).toUpperCase() + type.slice(1)} Nutrition Plan\n\n`;
    planText += `Goal: ${nutritionGoal.type.toUpperCase()}\n`;
    planText += `Preference: ${nutritionGoal.preference.toUpperCase()}\n\n`;
    planText += `Daily Targets:\n`;
    planText += `Calories: ${macroTargets.calories}\n`;
    planText += `Protein: ${macroTargets.protein}g\n`;
    planText += `Carbs: ${macroTargets.carbs}g\n`;
    planText += `Fat: ${macroTargets.fat}g\n\n`;
    
    if (type === 'weekly') {
        planText += `Weekly Meal Plan:\n`;
        nutritionPlan.weeklyPlan.forEach(day => {
            planText += `\n${day.day}:\n`;
            day.meals.forEach(meal => {
                planText += `  ${meal.name} (${meal.time}):\n`;
                meal.foods.forEach(food => {
                    planText += `    - ${food.quantity}${food.unit} ${food.name}\n`;
                });
            });
        });
    } else {
        planText += `Monthly Overview:\n`;
        for (let week = 1; week <= 4; week++) {
            planText += `\nWeek ${week}:\n`;
            planText += `  Weekly Calories: ${macroTargets.calories * 7}\n`;
            planText += `  Weekly Protein: ${macroTargets.protein * 7}g\n`;
            planText += `  Weekly Carbs: ${macroTargets.carbs * 7}g\n`;
            planText += `  Weekly Fat: ${macroTargets.fat * 7}g\n`;
        }
    }
    
    // Create downloadable file
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goaleats-${type}-plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function startOver() {
    // Reset all data
    userProfile = {};
    nutritionGoal = {};
    macroTargets = {};
    nutritionPlan = {};
    
    // Reset form fields
    document.querySelectorAll('input, select').forEach(field => {
        field.value = '';
        if (field.type === 'radio') {
            field.checked = false;
        }
    });
    
    // Reset radio option selections
    document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Go back to step 1
    showStep(1);
    showToast('Starting over with a fresh plan!');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    showToast('Welcome to GoalEats! Let\'s create your personalized nutrition plan.');
});
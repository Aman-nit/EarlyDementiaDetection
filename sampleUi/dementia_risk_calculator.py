
import numpy as np
from datetime import datetime
import json

class DementiaRiskCalculator:
    """
    Comprehensive risk calculator that combines all user inputs
    from the web UI into a single, interpretable risk score
    """

    def __init__(self):
        # Define weights for each assessment component
        self.weights = {
            'demographic': 0.15,      # Age, gender, education
            'medical_history': 0.20,  # Medical conditions, medications
            'speech_analysis': 0.25,  # Audio recording analysis
            'cognitive_tests': 0.25,  # Memory, clock drawing, etc.
            'neuroimaging': 0.10,     # MRI scan (if available)
            'behavioral': 0.05        # Sleep, activity, mood
        }

        # Risk factor thresholds and scoring
        self.risk_thresholds = {
            'age': {'high': 75, 'medium': 65},
            'education': {'low': 12, 'medium': 16},  # years
            'mmse_equivalent': {'severe': 18, 'moderate': 24, 'mild': 27}
        }

    def calculate_demographic_score(self, patient_data):
        """
        Calculate risk from demographic factors
        Age, gender, education level
        """
        score = 0.0
        max_score = 100.0

        # Age factor (strongest predictor)
        age = int(patient_data.get('age', 65))
        if age >= 85:
            age_score = 90
        elif age >= 75:
            age_score = 70
        elif age >= 65:
            age_score = 40
        else:
            age_score = 20

        # Education factor (protective)
        education = patient_data.get('education_level', 'High School')
        education_years = {
            'Less than High School': 8,
            'High School': 12,
            'Some College': 14,
            'College': 16,
            'Graduate': 18
        }.get(education, 12)

        if education_years >= 16:
            edu_score = -10  # Protective factor
        elif education_years >= 12:
            edu_score = 0
        else:
            edu_score = 15   # Risk factor

        # Gender factor (slight difference)
        gender = patient_data.get('gender', 'Unknown')
        gender_score = 5 if gender == 'Female' else 0  # Slightly higher risk for females

        # Combine demographic factors
        demographic_score = min(max_score, max(0, age_score + edu_score + gender_score))

        return {
            'score': demographic_score / max_score,  # Normalize to 0-1
            'details': {
                'age_contribution': age_score,
                'education_contribution': edu_score,
                'gender_contribution': gender_score
            }
        }

    def calculate_medical_history_score(self, medical_data):
        """
        Calculate risk from medical history
        Diabetes, hypertension, heart disease, etc.
        """
        score = 0.0

        # Risk factors and their weights
        risk_factors = {
            'diabetes': 15,
            'hypertension': 10,
            'heart_disease': 12,
            'stroke_history': 20,
            'depression': 10,
            'head_injury': 15,
            'family_history_dementia': 25
        }

        # Calculate based on present conditions
        for condition, weight in risk_factors.items():
            if medical_data.get(condition, False):
                score += weight

        # Medications (some are protective, some risky)
        medications = medical_data.get('current_medications', [])
        for med in medications:
            if 'statin' in med.lower():
                score -= 5  # Protective
            elif 'anticholinergic' in med.lower():
                score += 10  # Risk factor

        # Normalize to 0-1
        max_medical_score = 100
        normalized_score = min(1.0, score / max_medical_score)

        return {
            'score': normalized_score,
            'details': {
                'total_risk_factors': sum(1 for k, v in medical_data.items() if v and k in risk_factors),
                'high_risk_conditions': [k for k, v in medical_data.items() if v and k in ['stroke_history', 'family_history_dementia']]
            }
        }

    def calculate_speech_analysis_score(self, speech_results):
        """
        Process results from speech AI analysis
        """
        if not speech_results:
            return {'score': 0.5, 'details': {'status': 'no_data'}}

        # Get AI prediction
        ai_risk_score = speech_results.get('risk_score', 0.5)

        # Additional speech quality indicators
        acoustic_issues = 0
        linguistic_issues = 0

        # Check acoustic features
        acoustic = speech_results.get('acoustic_analysis', {})
        if acoustic.get('speaking_rate', 2.5) < 1.5:  # Very slow speech
            acoustic_issues += 1
        if acoustic.get('pause_frequency', 0.5) > 1.0:  # Too many pauses
            acoustic_issues += 1

        # Check linguistic features  
        linguistic = speech_results.get('linguistic_analysis', {})
        if linguistic.get('type_token_ratio', 0.6) < 0.4:  # Poor vocabulary diversity
            linguistic_issues += 1
        if linguistic.get('disfluency_rate', 0.05) > 0.15:  # Too many disfluencies
            linguistic_issues += 1

        # Combine AI score with manual indicators
        manual_adjustment = (acoustic_issues + linguistic_issues) * 0.1
        final_score = min(1.0, ai_risk_score + manual_adjustment)

        return {
            'score': final_score,
            'details': {
                'ai_prediction': ai_risk_score,
                'acoustic_issues': acoustic_issues,
                'linguistic_issues': linguistic_issues,
                'speaking_rate': acoustic.get('speaking_rate', 0),
                'vocabulary_diversity': linguistic.get('type_token_ratio', 0)
            }
        }

    def calculate_cognitive_tests_score(self, cognitive_results):
        """
        Calculate risk from cognitive test performance
        Memory recall, clock drawing, word fluency, etc.
        """
        if not cognitive_results:
            return {'score': 0.5, 'details': {'status': 'no_tests_completed'}}

        total_score = 0
        total_tests = 0
        test_details = {}

        # Memory recall test (0-10 words remembered)
        if 'memory_recall' in cognitive_results:
            words_remembered = cognitive_results['memory_recall'].get('score', 5)
            memory_score = max(0, (10 - words_remembered) / 10)  # Higher forgotten = higher risk
            total_score += memory_score
            total_tests += 1
            test_details['memory_recall'] = words_remembered

        # Clock drawing test (0-6 points, 6 = perfect)
        if 'clock_drawing' in cognitive_results:
            clock_score = cognitive_results['clock_drawing'].get('score', 3)
            clock_risk = max(0, (6 - clock_score) / 6)
            total_score += clock_risk
            total_tests += 1
            test_details['clock_drawing'] = clock_score

        # Word fluency (animals in 1 minute)
        if 'word_fluency' in cognitive_results:
            animals_named = cognitive_results['word_fluency'].get('count', 12)
            # Normal: 15+, Mild impairment: 10-14, Severe: <10
            if animals_named >= 15:
                fluency_risk = 0.1
            elif animals_named >= 10:
                fluency_risk = 0.4
            else:
                fluency_risk = 0.8

            total_score += fluency_risk
            total_tests += 1
            test_details['word_fluency'] = animals_named

        # Trail making or pattern recognition
        if 'pattern_recognition' in cognitive_results:
            correct_patterns = cognitive_results['pattern_recognition'].get('correct', 5)
            total_patterns = cognitive_results['pattern_recognition'].get('total', 10)
            pattern_risk = 1 - (correct_patterns / total_patterns) if total_patterns > 0 else 0.5
            total_score += pattern_risk
            total_tests += 1
            test_details['pattern_recognition'] = f"{correct_patterns}/{total_patterns}"

        # Calculate average if tests were taken
        if total_tests > 0:
            avg_score = total_score / total_tests
        else:
            avg_score = 0.5  # Neutral if no tests

        return {
            'score': avg_score,
            'details': {
                'tests_completed': total_tests,
                'individual_results': test_details,
                'estimated_mmse': max(10, 30 - int(avg_score * 20))  # Rough MMSE equivalent
            }
        }

    def calculate_neuroimaging_score(self, mri_results):
        """
        Process MRI analysis results (if available)
        """
        if not mri_results:
            return {'score': None, 'details': {'status': 'no_mri_data'}}

        # Get AI analysis results
        ai_risk = mri_results.get('risk_score', 0.5)

        # Brain region analysis
        brain_regions = mri_results.get('brain_regions', {})
        regional_issues = 0

        for region, data in brain_regions.items():
            if data.get('severity') in ['moderate', 'severe']:
                regional_issues += 1

        # Adjust score based on regional analysis
        regional_adjustment = regional_issues * 0.1
        final_score = min(1.0, ai_risk + regional_adjustment)

        return {
            'score': final_score,
            'details': {
                'ai_prediction': ai_risk,
                'brain_regions_affected': regional_issues,
                'hippocampus_status': brain_regions.get('hippocampus', {}).get('severity', 'normal'),
                'cortical_thickness': brain_regions.get('frontal_cortex', {}).get('thickness_reduction', 0)
            }
        }

    def calculate_behavioral_score(self, behavioral_data):
        """
        Calculate risk from behavioral and lifestyle factors
        """
        if not behavioral_data:
            return {'score': 0.3, 'details': {'status': 'no_behavioral_data'}}

        score = 0.0

        # Sleep quality (1-10 scale, lower is worse)
        sleep_quality = behavioral_data.get('sleep_quality', 7)
        if sleep_quality <= 4:
            score += 0.3
        elif sleep_quality <= 6:
            score += 0.1

        # Physical activity (1-10 scale)
        activity_level = behavioral_data.get('activity_level', 5)
        if activity_level <= 3:
            score += 0.2
        elif activity_level <= 5:
            score += 0.1

        # Social interaction (1-10 scale)
        social_interaction = behavioral_data.get('social_interaction', 5)
        if social_interaction <= 3:
            score += 0.2

        # Mood/depression screening (1-10, higher = more depressed)
        mood_score = behavioral_data.get('mood_assessment', 3)
        if mood_score >= 7:
            score += 0.2
        elif mood_score >= 5:
            score += 0.1

        return {
            'score': min(1.0, score),
            'details': {
                'sleep_quality': sleep_quality,
                'activity_level': activity_level,
                'social_interaction': social_interaction,
                'mood_concerns': mood_score >= 5
            }
        }

    def calculate_overall_risk(self, all_assessments):
        """
        Combine all assessment scores into final risk assessment
        """

        # Calculate individual component scores
        demographic = self.calculate_demographic_score(all_assessments.get('demographic', {}))
        medical = self.calculate_medical_history_score(all_assessments.get('medical_history', {}))
        speech = self.calculate_speech_analysis_score(all_assessments.get('speech_results', {}))
        cognitive = self.calculate_cognitive_tests_score(all_assessments.get('cognitive_tests', {}))
        neuroimaging = self.calculate_neuroimaging_score(all_assessments.get('mri_results', {}))
        behavioral = self.calculate_behavioral_score(all_assessments.get('behavioral', {}))

        # Calculate weighted average (only include components with data)
        total_weight = 0
        weighted_sum = 0

        # Add each component if data is available
        components_used = {}

        if demographic['score'] is not None:
            weighted_sum += demographic['score'] * self.weights['demographic']
            total_weight += self.weights['demographic']
            components_used['demographic'] = demographic

        if medical['score'] is not None:
            weighted_sum += medical['score'] * self.weights['medical_history']
            total_weight += self.weights['medical_history']
            components_used['medical_history'] = medical

        if speech['score'] is not None:
            weighted_sum += speech['score'] * self.weights['speech_analysis']
            total_weight += self.weights['speech_analysis']
            components_used['speech_analysis'] = speech

        if cognitive['score'] is not None:
            weighted_sum += cognitive['score'] * self.weights['cognitive_tests']
            total_weight += self.weights['cognitive_tests']
            components_used['cognitive_tests'] = cognitive

        # MRI is optional but highly weighted if available
        if neuroimaging['score'] is not None:
            weighted_sum += neuroimaging['score'] * self.weights['neuroimaging']
            total_weight += self.weights['neuroimaging']
            components_used['neuroimaging'] = neuroimaging

        if behavioral['score'] is not None:
            weighted_sum += behavioral['score'] * self.weights['behavioral']
            total_weight += self.weights['behavioral']
            components_used['behavioral'] = behavioral

        # Calculate final risk score (0-1)
        if total_weight > 0:
            overall_risk_score = weighted_sum / total_weight
        else:
            overall_risk_score = 0.5  # Default if no data

        # Determine risk level
        if overall_risk_score >= 0.7:
            risk_level = "High"
            risk_color = "#e74c3c"  # Red
        elif overall_risk_score >= 0.4:
            risk_level = "Medium"  
            risk_color = "#f39c12"  # Orange
        else:
            risk_level = "Low"
            risk_color = "#27ae60"  # Green

        # Calculate confidence based on amount of data available
        confidence = min(1.0, total_weight / sum(self.weights.values()))

        return {
            'overall_risk_score': round(overall_risk_score, 3),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'confidence': round(confidence, 2),
            'components_analyzed': len(components_used),
            'total_possible_components': len(self.weights),
            'component_scores': components_used,
            'recommendations': self.generate_recommendations(overall_risk_score, components_used),
            'timestamp': datetime.now().isoformat()
        }

    def generate_recommendations(self, risk_score, components):
        """
        Generate personalized recommendations based on assessment results
        """
        recommendations = {
            'immediate_actions': [],
            'lifestyle_changes': [],
            'follow_up': [],
            'monitoring': []
        }

        if risk_score >= 0.7:  # High risk
            recommendations['immediate_actions'] = [
                "Consult with a neurologist or memory specialist",
                "Consider comprehensive neuropsychological testing",
                "Discuss findings with primary care physician"
            ]
            recommendations['follow_up'] = [
                "Schedule follow-up assessment in 3-6 months",
                "Consider MRI brain scan if not already done",
                "Blood work to rule out other causes"
            ]
        elif risk_score >= 0.4:  # Medium risk
            recommendations['immediate_actions'] = [
                "Discuss results with primary care physician",
                "Consider cognitive assessment by specialist"
            ]
            recommendations['follow_up'] = [
                "Repeat assessment in 6-12 months",
                "Monitor for changes in memory or thinking"
            ]

        # Universal lifestyle recommendations
        recommendations['lifestyle_changes'] = [
            "Engage in regular physical exercise (30 min, 5x/week)",
            "Maintain social connections and activities",
            "Follow Mediterranean-style diet",
            "Ensure 7-8 hours of quality sleep",
            "Engage in mentally stimulating activities"
        ]

        # Component-specific recommendations
        if 'speech_analysis' in components and components['speech_analysis']['score'] > 0.6:
            recommendations['monitoring'].append("Monitor changes in speech patterns")

        if 'cognitive_tests' in components and components['cognitive_tests']['score'] > 0.5:
            recommendations['lifestyle_changes'].append("Practice memory exercises and brain training")

        return recommendations

# Example usage and testing
if __name__ == "__main__":
    calculator = DementiaRiskCalculator()

    # Sample patient data
    sample_assessments = {
        'demographic': {
            'age': 72,
            'gender': 'Female',
            'education_level': 'College'
        },
        'medical_history': {
            'diabetes': True,
            'hypertension': True,
            'heart_disease': False,
            'family_history_dementia': True,
            'current_medications': ['metformin', 'lisinopril']
        },
        'speech_results': {
            'risk_score': 0.65,
            'acoustic_analysis': {
                'speaking_rate': 1.8,
                'pause_frequency': 1.2
            },
            'linguistic_analysis': {
                'type_token_ratio': 0.45,
                'disfluency_rate': 0.12
            }
        },
        'cognitive_tests': {
            'memory_recall': {'score': 6},
            'clock_drawing': {'score': 4},
            'word_fluency': {'count': 11}
        },
        'behavioral': {
            'sleep_quality': 5,
            'activity_level': 4,
            'social_interaction': 6,
            'mood_assessment': 4
        }
    }

    # Calculate overall risk
    results = calculator.calculate_overall_risk(sample_assessments)

    print("🧠 DEMENTIA RISK ASSESSMENT RESULTS")
    print("=" * 50)
    print(f"Overall Risk Score: {results['overall_risk_score']} ({results['risk_level']})")
    print(f"Confidence: {results['confidence'] * 100:.1f}%")
    print(f"Components Analyzed: {results['components_analyzed']}/{results['total_possible_components']}")
    print("\nComponent Breakdown:")
    for component, data in results['component_scores'].items():
        print(f"  {component}: {data['score']:.2f}")

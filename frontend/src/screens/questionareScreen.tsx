import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CryQuestionnaireScreen({ navigation, route }: any) {

  const reason = route?.params?.reason ?? 'hungry';
  const childName = route?.params?.childName ?? 'Baby';
  const infantId = route?.params?.infantId;

  const [answers, setAnswers] = useState({
    feeding: null,
    sleepy: null,
    legs: null,
    gas: null,
    hair: null,
    mouth: null,
  });

  const selectAnswer = (question: string, value: boolean) => {
    setAnswers({ ...answers, [question]: value });
  };

  // ✅ Updated Score calculation
  const calculateFinalReason = () => {

    let scores: any = {
      hungry: 0,
      sleepiness: 0,
      belly_pain: 0,
    };

    // Audio prediction base score
    scores[reason] += 1;

    // Hungry indicators
    if (answers.feeding === false) {
      scores.hungry += 0.5;
    }

    if (answers.mouth === true) {
      scores.hungry += 0.5;
    }

    // Sleepiness indicators
    if (answers.sleepy === true) {
      scores.sleepiness += 0.5;
    }

    if (answers.hair === true) {
      scores.sleepiness += 0.4;
    }

    // Belly pain indicators
    if (answers.legs === true) {
      scores.belly_pain += 0.5;
    }

    if (answers.gas === true) {
      scores.belly_pain += 0.3;
    }

    const finalReason = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    return finalReason;
  };

  const QuestionRow = ({ question, keyName }: any) => (
    <View style={styles.questionCard}>

      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.options}>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            answers[keyName] === true && styles.selectedYes
          ]}
          onPress={() => selectAnswer(keyName, true)}
        >
          <Icon name="check-circle" size={28} color="#1FBF75" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            answers[keyName] === false && styles.selectedNo
          ]}
          onPress={() => selectAnswer(keyName, false)}
        >
          <Icon name="close-circle" size={28} color="#FF5C5C" />
        </TouchableOpacity>

      </View>
    </View>
  );

  return (

    <LinearGradient
      colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
      style={styles.container}
    >

      <SafeAreaView style={{ flex: 1 }}>

        <Text style={styles.title}>Answer a few questions</Text>

        <QuestionRow
          question="Was the baby fed recently?"
          keyName="feeding"
        />

        <QuestionRow
          question="Is the baby yawning or rubbing eyes?"
          keyName="sleepy"
        />

        <QuestionRow
          question="Is the baby pulling legs towards stomach?"
          keyName="legs"
        />

        <QuestionRow
          question="Does the baby seem gassy or bloated?"
          keyName="gas"
        />

        <QuestionRow
          question="Is the baby pulling their hair?"
          keyName="hair"
        />

        <QuestionRow
          question="Is the baby putting hands into mouth?"
          keyName="mouth"
        />

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => {

            const finalReason = calculateFinalReason();

            navigation.navigate('FinalResult', {
              reason: finalReason,
              childName: childName,
              infantId: infantId
            });

          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

      </SafeAreaView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
     
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
     top: 55,
  },

  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    top: 55,
  },

  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },

  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  optionBtn: {
    padding: 10,
    borderRadius: 30,
  },

  selectedYes: {
    backgroundColor: '#D7F5E6',
  },

  selectedNo: {
    backgroundColor: '#FFE2E2',
  },

  continueBtn: {
    marginTop: 100,
    backgroundColor: '#3FA9F5',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});
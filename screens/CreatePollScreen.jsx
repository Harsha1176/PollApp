import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const CreatePollScreen = ({ navigation }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Default 2 options

  const addOption = () => setOptions([...options, '']);
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      Alert.alert('Error', 'Please enter a question and at least two valid options.');
      return;
    }

    try {
      const response = await fetch('http://192.168.56.1:3000/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options }),
      });

      if (!response.ok) throw new Error('Failed to create poll');

      navigation.goBack();
    } catch (error) {
      console.error('Error creating poll:', error);
      Alert.alert('Error', 'Failed to create poll.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Poll Question:</Text>
      <TextInput style={styles.input} value={question} onChangeText={setQuestion} />

      <Text style={styles.label}>Options:</Text>
      {options.map((opt, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={opt}
          onChangeText={(value) => updateOption(index, value)}
        />
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addOption}>
        <Text style={styles.addText}>+ Add Option</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createButton} onPress={createPoll}>
        <Text style={styles.createText}>Create Poll</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  addButton: { padding: 10, backgroundColor: '#007bff', marginBottom: 10 },
  addText: { color: 'white', textAlign: 'center' },
  createButton: { padding: 15, backgroundColor: '#28a745' },
  createText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

export default CreatePollScreen;

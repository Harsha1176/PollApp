import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const VoteScreen = ({ route, navigation }) => {
  const { pollId } = route.params;
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`http://192.168.56.1:3000/api/polls/${pollId}`);
      if (!response.ok) throw new Error('Failed to fetch poll');

      const data = await response.json();

      // 🔍 Debug API Response
      console.log('Fetched Poll Data:', data);
      console.log('Poll Options Type:', typeof data.options);
      console.log('Poll Options Value:', data.options);

      // ✅ Ensure `options` is always an array
      if (typeof data.options === 'string') {
        try {
          data.options = JSON.parse(data.options); // Convert JSON string to an array
        } catch (error) {
          console.error('Error parsing options JSON:', error);
          data.options = [];
        }
      }
      if (!Array.isArray(data.options)) {
        data.options = []; // Set to empty array if not valid
      }

      setPoll(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching poll:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  const vote = async () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Please select an option before voting.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.56.1:3000/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (!response.ok) throw new Error('Voting failed');

      Alert.alert('Success', 'Vote recorded successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to submit vote.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : poll ? (
        <>
          <Text style={styles.question}>{poll.question}</Text>

          {poll.options.length > 0 ? (
            poll.options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionButton,
                  selectedOption === opt.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedOption(opt.id)}
              >
                <Text style={styles.optionText}>
                  {opt.text} ({opt.votes} votes)
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.errorText}>⚠️ No options available for this poll</Text>
          )}

          {poll.options.length > 0 && (
            <TouchableOpacity
              style={[styles.voteButton, !selectedOption && styles.disabledVoteButton]}
              onPress={vote}
              disabled={!selectedOption}
            >
              <Text style={styles.voteText}>Submit Vote</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.errorText}>⚠️ Poll not found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  question: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  optionButton: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    width: '90%',
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  optionText: { fontSize: 16 },

  voteButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  disabledVoteButton: {
    backgroundColor: '#a0a0a0',
  },
  voteText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  errorText: { fontSize: 16, color: 'red' },
  loadingText: { fontSize: 18, color: 'gray' },
});

export default VoteScreen;

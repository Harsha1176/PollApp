import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PollDetailsScreen = ({ route }) => {
  const { pollId } = route.params;
  const [poll, setPoll] = useState(null);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`http://192.168.56.1:3000/api/polls/${pollId}`);
      if (!response.ok) throw new Error('Failed to fetch poll');

      const data = await response.json();

      // Ensure options is an array
      if (typeof data.options === 'string') {
        data.options = JSON.parse(data.options);
      }

      setPoll(data);
    } catch (error) {
      console.error('Error fetching poll:', error);
    }
  };

  useEffect(() => {
    fetchPoll();
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {poll ? (
        <>
          <Text style={styles.question}>{poll.question}</Text>

          {Array.isArray(poll.options) ? (
            poll.options.map((opt) => (
              <View key={opt.id} style={styles.optionContainer}>
                <Text style={styles.optionText}>
                  {opt.text} - {opt.votes} votes
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.errorText}>No options available</Text>
          )}
        </>
      ) : (
        <Text style={styles.loadingText}>Loading poll data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  question: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  optionContainer: { padding: 10, backgroundColor: '#f1f1f1', width: '100%', marginBottom: 5 },
  optionText: { fontSize: 16 },
  errorText: { fontSize: 16, color: 'red' },
  loadingText: { fontSize: 18, color: 'gray' },
});

export default PollDetailsScreen;

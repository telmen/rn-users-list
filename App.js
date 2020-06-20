/**
 * @format
 */

import React, {useState, useCallback, useEffect} from 'react';
import {SafeAreaView, StyleSheet, FlatList, View, Text, Button, ActivityIndicator} from 'react-native';

import useSWR from 'swr';

const swrFetcher = async (...args) => {
  try {
    const response = await fetch(...args);
    if (!response.ok) {
      throw new Error();
    }
    return response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

const RowValue = ({label, value}) => {
  return (
    <View style={[styles.row,styles.marginV]}>
      <View style={styles.flex}>
        <Text>{label}</Text>
      </View>
      <View style={styles.flex}>
        <Text>{value}</Text>
      </View>
    </View>
  );
};

const ItemSeparator = () => {
  return <View style={styles.separator} />;
};

const Card = ({name, username, email}) => {
  return (
    <View style={styles.card}>
      <RowValue label="Name" value={name} />
      <RowValue label="Username" value={username} />
      <RowValue label="Email" value={email} />
    </View>
    );
};

const FIRST_PAGE = 1;

const Pager = ({current = FIRST_PAGE, total, onNext, onPrev}) => {
  return (
    <View style={[styles.row, styles.center]}>
      <Button color="#000" disabled={current === FIRST_PAGE} title="Prev" onPress={onPrev} />
      <Text style={styles.pageNumber}>{current}</Text>
      <Button color="#000" disabled={current === total} title="Next" onPress={onNext} />
    </View>
  );
};

const apiUrl = 'https://jsonplaceholder.typicode.com/users';
const itemsPerPage = 4;

const App = () => {
  const {data: users, isValidating, error, mutate} = useSWR(apiUrl, swrFetcher, {
    revalidateOnMount: true,
    shouldRetryOnError: false,
  });
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Update data to show per page.
  useEffect(() => {
    if (!isValidating && Array.isArray(users)) {
      setData(users.slice((currentPage - 1) * itemsPerPage, itemsPerPage * currentPage));
    }
  }, [users, isValidating, currentPage]);

  const refreshData = useCallback(() => {
    if (!isValidating) {
      mutate();
    }
  }, [isValidating, mutate]);

  const handleNext = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage]);

  const handlePrev = useCallback(() => {
    setCurrentPage(currentPage - 1);
  }, [currentPage]);

  // Error handling
  if (!isValidating && error) {
    return (
      <SafeAreaView style={[styles.flex, styles.center]}>
        <Text style={styles.errorText}>Sorry, could not get users list, please try again</Text>
        <Button title="Try again" onPress={refreshData} />
      </SafeAreaView>
    );
  }

  // If the list is empty
  if (!isValidating && users?.length === 0) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text>No users yet.</Text>
      </View>
    );
  }

  const renderCard = useCallback(({item}) => <Card name={item.name} username={item.username} email={item.email} />, []);

  if (!error) {
    return (
      <>
        <SafeAreaView style={styles.flex}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Users list</Text>
          </View>
          <FlatList
            data={data}
            onRefresh={refreshData}
            refreshing={isValidating}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={({id}) => `card_${id}`}
            renderItem={renderCard}
            contentContainerStyle={styles.listWrapper}
          />
          <Pager
            current={currentPage}
            onNext={handleNext}
            onPrev={handlePrev}
            total={Math.ceil(users?.length / itemsPerPage)}
          />
        </SafeAreaView>
      </>
    );
  }
  return null;
};

const baseUnit = 12;

const styles = StyleSheet.create({
  listWrapper: {
    padding: baseUnit * 2
  },
  card: {
    borderRadius: baseUnit,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: baseUnit,
  },
  marginV: { marginVertical: baseUnit / 2},
  center: {alignItems: 'center', justifyContent: 'center'},
  flex: {flex: 1},
  row: {flexDirection: 'row'},
  separator: {
    height: baseUnit * 2,
  },
  pageNumber: {
    fontWeight: 'bold',
    fontSize: baseUnit * 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: baseUnit * 3
  },
  titleWrapper: {
    padding: baseUnit
  }
});

export default App;
